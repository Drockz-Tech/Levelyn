# Supabase SQL Migration for Levelyn

-- =====================================================
-- 1. PROFILES (extends Supabase Auth users)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT DEFAULT 'astronaut',
  theme TEXT DEFAULT 'blue' CHECK (theme IN ('blue', 'purple', 'teal')),
  job_class TEXT DEFAULT 'Focus Cadet',
  title TEXT DEFAULT 'One Who Surmounted Adversity',
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  attributes JSONB DEFAULT '{"strength":10,"agility":10,"vitality":10,"intelligence":10,"sense":10}',
  stat_points INTEGER DEFAULT 5,
  fatigue INTEGER DEFAULT 0,
  skills JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Hunter_' || LEFT(NEW.id::text, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 2. SESSIONS (focus logs)
-- =====================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('coding', 'study', 'reading')),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  xp_earned INTEGER DEFAULT 0,
  note TEXT,
  manual BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_ended ON sessions(ended_at);

-- =====================================================
-- 3. FOLLOWS
-- =====================================================
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- =====================================================
-- 4. ACTIVITIES (social feed)
-- =====================================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('session', 'levelup', 'achievement')),
  category TEXT,
  duration INTEGER,
  xp INTEGER,
  level INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-- =====================================================
-- 5. REACTIONS
-- =====================================================
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('respect', 'energy', 'keepgoing')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (activity_id, user_id, type)
);

-- =====================================================
-- 6. GUILDS
-- =====================================================
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  banner_color TEXT DEFAULT '#00F0FF',
  weekly_goal INTEGER DEFAULT 1000,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE guild_members (
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE guild_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guild_messages_guild ON guild_messages(guild_id, created_at DESC);

-- =====================================================
-- 7. LEADERBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id,
  p.username,
  p.avatar,
  p.level,
  p.total_xp,
  COALESCE(SUM(CASE WHEN s.category = 'coding' THEN s.xp_earned ELSE 0 END), 0)::INTEGER AS coding_xp,
  COALESCE(SUM(CASE WHEN s.category = 'study' THEN s.xp_earned ELSE 0 END), 0)::INTEGER AS study_xp,
  COALESCE(SUM(CASE WHEN s.category = 'reading' THEN s.xp_earned ELSE 0 END), 0)::INTEGER AS reading_xp,
  COUNT(DISTINCT DATE(s.ended_at))::INTEGER AS active_days
FROM profiles p
LEFT JOIN sessions s ON s.user_id = p.id AND s.ended_at > now() - interval '30 days'
GROUP BY p.id;

-- =====================================================
-- 8. ROW LEVEL SECURITY
-- =====================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON sessions USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public follows read" ON follows FOR SELECT USING (true);
CREATE POLICY "Users manage own follows" ON follows USING (auth.uid() = follower_id);
CREATE POLICY "Users insert own follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feed visibility" ON activities FOR SELECT USING (
  user_id = auth.uid() OR
  user_id IN (SELECT following_id FROM follows WHERE follower_id = auth.uid())
);
CREATE POLICY "Users insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reactions read" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users manage own reactions" ON reactions USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Guilds
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public guilds read" ON guilds FOR SELECT USING (true);
CREATE POLICY "Authenticated create guilds" ON guilds FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Guild Members
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public guild members read" ON guild_members FOR SELECT USING (true);
CREATE POLICY "Users join guilds" ON guild_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave guilds" ON guild_members FOR DELETE USING (auth.uid() = user_id);

-- Guild Messages
ALTER TABLE guild_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guild members read messages" ON guild_messages FOR SELECT USING (
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
);
CREATE POLICY "Guild members send messages" ON guild_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
);

-- =====================================================
-- 9. ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE guild_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- =====================================================
-- 10. SEED DATA (default guilds)
-- =====================================================
INSERT INTO guilds (name, description, banner_color, weekly_goal) VALUES
  ('Shadow Army', 'Elite coders who code in silence. Precision. Speed. Shadows.', '#00F0FF', 1500),
  ('Radiant Dawn', 'Scholars and readers who seek knowledge at the speed of light.', '#B77BFF', 1200),
  ('Iron Fortress', 'All-rounders who never break. Iron will, iron focus.', '#0DF5C4', 1000);
