-- Make sure social_profiles table has fields needed for Facebook integration
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'social_profiles' AND column_name = 'category'
  ) THEN
    ALTER TABLE social_profiles ADD COLUMN category text;
  END IF;
END $$;

-- Facebook-specific fields that might need to be added to content_media
DO $$
BEGIN
  -- Facebook media duration column (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_media' AND column_name = 'duration_secs'
  ) THEN
    ALTER TABLE content_media ADD COLUMN duration_secs integer;
  END IF;
  
  -- Target URL for links
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_media' AND column_name = 'target_url'
  ) THEN
    ALTER TABLE content_media ADD COLUMN target_url text;
  END IF;
  
  -- Facebook-specific metadata columns for social_posts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'social_posts' AND column_name = 'metrics'
  ) THEN
    ALTER TABLE social_posts ADD COLUMN metrics jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Facebook typically needs to store location data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'social_profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE social_profiles ADD COLUMN location jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create or update Facebook-specific indexes
CREATE INDEX IF NOT EXISTS social_profiles_platform_idx ON social_profiles(platform);
CREATE INDEX IF NOT EXISTS social_posts_profile_id_idx ON social_posts(profile_id);
CREATE INDEX IF NOT EXISTS social_posts_platform_idx ON social_posts(platform);
CREATE INDEX IF NOT EXISTS social_posts_post_type_idx ON social_posts(post_type);
CREATE INDEX IF NOT EXISTS social_comments_post_id_idx ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS content_media_post_id_idx ON content_media(post_id);

-- Add view for Facebook insights to easily query metrics
CREATE OR REPLACE VIEW facebook_post_insights AS
SELECT 
  sp.id AS post_id,
  sp.post_type,
  sp.caption,
  sp.created_at_platform,
  sp.metrics->>'reactions' AS reactions,
  sp.metrics->>'comments' AS comments,
  sp.metrics->>'shares' AS shares,
  sp.metrics->>'impressions' AS impressions,
  sp.metrics->>'video_views' AS video_views,
  prof.name AS page_name,
  prof.category AS page_category,
  prof.followers_count AS page_followers,
  prof.platform,
  sp.user_id
FROM 
  social_posts sp
JOIN
  social_profiles prof ON sp.profile_id = prof.id
WHERE
  sp.platform = 'facebook';

-- Create function to detect posts with videos that need transcription
CREATE OR REPLACE FUNCTION get_facebook_videos_needing_transcription(user_id_param UUID)
RETURNS TABLE (
  post_id UUID,
  media_id UUID,
  media_url TEXT,
  post_type TEXT
)
LANGUAGE SQL
AS $$
  SELECT 
    p.id as post_id,
    cm.id as media_id,
    cm.media_url,
    p.post_type
  FROM 
    social_posts p
  JOIN 
    content_media cm ON p.id = cm.post_id
  WHERE 
    p.platform = 'facebook' AND
    p.user_id = user_id_param AND
    cm.media_type = 'video' AND
    cm.transcript_text IS NULL
  LIMIT 50;
$$;

-- Add RLS to any new views
ALTER VIEW facebook_post_insights SECURITY INVOKER;