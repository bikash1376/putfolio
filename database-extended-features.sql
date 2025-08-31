-- Extended Features Database Migration for Putfolio
-- Run this in your Supabase SQL editor after the basic setup

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;

-- Create social_links table for user social media links
CREATE TABLE IF NOT EXISTS social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_text TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follows table for user following system
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create profile_stats table for analytics
CREATE TABLE IF NOT EXISTS profile_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_links_profile_id ON social_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_profile_stats_profile_id ON profile_stats(profile_id);

-- Enable RLS on new tables
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_links
CREATE POLICY "Social links are viewable by everyone" ON social_links
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own social links" ON social_links
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for follows
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON follows
  FOR ALL USING (
    follower_id = auth.uid() OR following_id = auth.uid()
  );

-- RLS Policies for profile_stats
CREATE POLICY "Profile stats are viewable by everyone" ON profile_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile stats" ON profile_stats
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON social_links TO authenticated;
GRANT SELECT ON social_links TO anon;
GRANT ALL ON follows TO authenticated;
GRANT SELECT ON follows TO anon;
GRANT ALL ON profile_stats TO authenticated;
GRANT SELECT ON profile_stats TO anon;

-- Create function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    INSERT INTO profile_stats (profile_id, following_count)
    SELECT p.id, 1
    FROM profiles p
    WHERE p.user_id = NEW.follower_id
    ON CONFLICT (profile_id)
    DO UPDATE SET following_count = profile_stats.following_count + 1;
    
    -- Increment followers count for following
    INSERT INTO profile_stats (profile_id, followers_count)
    SELECT p.id, 1
    FROM profiles p
    WHERE p.user_id = NEW.following_id
    ON CONFLICT (profile_id)
    DO UPDATE SET followers_count = profile_stats.followers_count + 1;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE profile_stats
    SET following_count = following_count - 1
    WHERE profile_id IN (
      SELECT p.id FROM profiles p WHERE p.user_id = OLD.follower_id
    );
    
    -- Decrement followers count for following
    UPDATE profile_stats
    SET followers_count = followers_count - 1
    WHERE profile_id IN (
      SELECT p.id FROM profiles p WHERE p.user_id = OLD.following_id
    );
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follows table
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON follows;
CREATE TRIGGER trigger_update_follower_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follower_counts();

-- Create function to initialize profile stats when profile is created
CREATE OR REPLACE FUNCTION initialize_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_stats (profile_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS trigger_initialize_profile_stats ON profiles;
CREATE TRIGGER trigger_initialize_profile_stats
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_profile_stats();

-- Verify the new structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'social_links', 'follows', 'profile_stats')
ORDER BY table_name, ordinal_position;
