-- =====================================================
-- LEVELYN BACKEND MIGRATION V3: DISPLAY NAMES
-- =====================================================

-- 1. Add display_name column to profiles table (non-unique display name)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Backfill existing records (set display_name equal to username initially)
UPDATE profiles SET display_name = username WHERE display_name IS NULL;

-- 3. Update the handle_new_user trigger to populate display_name from metadata
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
