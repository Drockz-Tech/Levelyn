-- =====================================================
-- LEVELYN BACKEND MIGRATION V4: FOLLOW REQUESTS
-- =====================================================

CREATE TABLE IF NOT EXISTS follow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

-- Enable RLS
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

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE follow_requests;
