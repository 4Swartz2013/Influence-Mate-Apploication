/*
  # Social Media Harvester Schema

  1. New Tables
    - `social_profiles` - Platform-agnostic profile data
    - `social_posts` - Posts from various social platforms
    - `social_comments` - Comments on social posts
    - `content_media` - Media files associated with posts
    - `integrations` - OAuth tokens and platform connections

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Social profiles table
CREATE TABLE IF NOT EXISTS social_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, -- 'instagram', 'twitter', etc.
  handle text NOT NULL,
  profile_id text, -- platform-specific ID
  name text,
  bio text,
  profile_url text,
  profile_image_url text,
  followers_count integer,
  following_count integer,
  post_count integer,
  category text,
  verified boolean DEFAULT false,
  link_urls text[],
  last_scraped_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform, handle)
);

-- Social posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES social_profiles(id) ON DELETE CASCADE,
  platform text NOT NULL, -- 'instagram', 'twitter', etc.
  post_id text NOT NULL, -- platform-specific ID
  post_type text, -- 'image', 'video', 'carousel', 'reel', etc.
  post_url text,
  caption text,
  created_at_platform timestamptz,
  metrics jsonb DEFAULT '{}', -- likes, comments, shares, etc.
  hashtags text[],
  mentions text[],
  location jsonb DEFAULT '{}',
  media_urls text[],
  harvested_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, platform, post_id)
);

-- Social comments table
CREATE TABLE IF NOT EXISTS social_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES social_posts(id) ON DELETE CASCADE,
  comment_id text NOT NULL, -- platform-specific ID
  parent_comment_id text, -- for replies
  author_handle text,
  author_name text,
  author_id text,
  text text,
  created_at_platform timestamptz,
  like_count integer DEFAULT 0,
  is_reply boolean DEFAULT false,
  harvested_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, comment_id)
);

-- Content media table
CREATE TABLE IF NOT EXISTS content_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES social_posts(id) ON DELETE CASCADE,
  media_type text, -- 'image', 'video', 'audio', etc.
  media_url text NOT NULL,
  thumbnail_url text,
  width integer,
  height integer,
  duration_secs integer, -- for videos
  alt_text text,
  position integer DEFAULT 0, -- for carousels
  harvested_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(post_id, media_url)
);

-- Integrations table for OAuth tokens
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, -- 'instagram', 'twitter', etc.
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  platform_user_id text,
  platform_username text,
  scope text[],
  is_active boolean DEFAULT true,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS social_profiles_user_id_idx ON social_profiles(user_id);
CREATE INDEX IF NOT EXISTS social_profiles_platform_idx ON social_profiles(platform);
CREATE INDEX IF NOT EXISTS social_profiles_handle_idx ON social_profiles(handle);

CREATE INDEX IF NOT EXISTS social_posts_user_id_idx ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS social_posts_profile_id_idx ON social_posts(profile_id);
CREATE INDEX IF NOT EXISTS social_posts_platform_idx ON social_posts(platform);
CREATE INDEX IF NOT EXISTS social_posts_created_at_platform_idx ON social_posts(created_at_platform DESC);

CREATE INDEX IF NOT EXISTS social_comments_user_id_idx ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS social_comments_post_id_idx ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS social_comments_author_handle_idx ON social_comments(author_handle);

CREATE INDEX IF NOT EXISTS content_media_user_id_idx ON content_media(user_id);
CREATE INDEX IF NOT EXISTS content_media_post_id_idx ON content_media(post_id);

CREATE INDEX IF NOT EXISTS integrations_user_id_platform_idx ON integrations(user_id, platform);
CREATE INDEX IF NOT EXISTS integrations_platform_user_id_idx ON integrations(platform_user_id);

-- Enable RLS on all tables
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own social profiles"
  ON social_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social posts"
  ON social_posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social comments"
  ON social_comments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own content media"
  ON content_media
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own integrations"
  ON integrations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_social_profiles_updated_at BEFORE UPDATE ON social_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();