-- =====================================================
-- ASCEND SUPABASE MISSING MIGRATIONS
-- =====================================================
-- Run this in your Supabase SQL Editor to resolve the API 400 and 404 errors.

-- 1. Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
UPDATE profiles SET display_name = username WHERE display_name IS NULL;

-- 2. Update the handle_new_user trigger to populate display_name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'hunter_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', 'Hunter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create follow_requests table
CREATE TABLE IF NOT EXISTS follow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

-- Enable RLS for follow_requests
ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;

-- Select: Users can view requests they sent OR received
CREATE POLICY "Users read own follow requests" ON follow_requests
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Insert: Users can send a request as themselves
CREATE POLICY "Users insert own follow requests" ON follow_requests
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Update: The target user (following_id) can accept or reject requests
CREATE POLICY "Target users update follow requests" ON follow_requests
  FOR UPDATE USING (auth.uid() = following_id);

-- Delete: Either user can cancel/delete the request
CREATE POLICY "Users delete own follow requests" ON follow_requests
  FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Enable realtime for follow_requests
ALTER PUBLICATION supabase_realtime ADD TABLE follow_requests;

-- 4. Update the Leaderboard View to include display_name (if needed)
DROP VIEW IF EXISTS leaderboard;

CREATE VIEW leaderboard AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar,
  p.level,
  p.total_xp,
  COALESCE(SUM(CASE WHEN s.category = 'coding' THEN s.xp_earned ELSE 0 END), 0)::INTEGER AS coding_xp,
  COALESCE(SUM(CASE WHEN s.category = 'study' THEN s.xp_earned ELSE 0 END), 0)::INTEGER AS study_xp,
  COALESCE(SUM(CASE WHEN s.category = 'reading' THEN s.xp_earned ELSE 0 END), 0)::INTEGER AS reading_xp,
  COUNT(DISTINCT DATE(s.ended_at))::INTEGER AS active_days
FROM profiles p
LEFT JOIN sessions s ON s.user_id = p.id AND s.ended_at > now() - interval '30 days'
GROUP BY p.id, p.username, p.display_name, p.avatar, p.level, p.total_xp;
