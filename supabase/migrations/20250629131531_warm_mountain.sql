/*
  # Add Mock Data for Communications Hub

  1. Mock Data
    - Sample contacts with different platforms and enrichment status
    - Sample messages across various platforms
    - Sample comments with sentiment analysis
    - Contact enrichment logs
    - Contact interactions timeline
    - Contact tags for categorization

  2. Data Features
    - Realistic contact profiles with social media data
    - Multi-platform messaging examples
    - Enrichment tracking and logs
    - Interaction history
    - Sentiment analysis on comments
*/

-- First, let's create a function to get or create a demo user
DO $$
DECLARE
    demo_user_id uuid;
BEGIN
    -- Try to get the first user from auth.users, or create a demo user ID
    SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
    
    -- If no users exist, we'll use a fixed UUID for demo purposes
    IF demo_user_id IS NULL THEN
        demo_user_id := '00000000-0000-0000-0000-000000000001'::uuid;
    END IF;

    -- Store the demo user ID in a temporary table for use in this migration
    CREATE TEMP TABLE IF NOT EXISTS demo_user_context (user_id uuid);
    DELETE FROM demo_user_context;
    INSERT INTO demo_user_context (user_id) VALUES (demo_user_id);
END $$;

-- Insert mock contacts
INSERT INTO contacts (
  user_id,
  full_name,
  first_name,
  last_name,
  email,
  phone,
  handle,
  platform,
  profile_image,
  bio,
  location,
  website,
  company,
  job_title,
  follower_count,
  engagement_rate,
  sentiment_score,
  tags,
  enriched,
  enriched_at,
  enrichment_source,
  last_interaction,
  interaction_count,
  total_value,
  status,
  source
) VALUES 
-- Contact 1: Sarah Johnson (Instagram Influencer)
(
  (SELECT user_id FROM demo_user_context),
  'Sarah Johnson',
  'Sarah',
  'Johnson',
  'sarah@example.com',
  '+1 (555) 123-4567',
  '@sarahj_official',
  'instagram',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Fashion influencer & lifestyle blogger passionate about sustainable fashion and wellness',
  'Los Angeles, CA',
  'https://sarahjohnson.com',
  'SJ Media',
  'Content Creator',
  125000,
  4.2,
  0.8,
  ARRAY['VIP', 'Fashion', 'Lifestyle', 'Influencer'],
  true,
  now() - interval '2 days',
  'AI Agent',
  now() - interval '30 minutes',
  15,
  2500.00,
  'active',
  'auto-generated'
),
-- Contact 2: Mark Thompson (Business Partner)
(
  (SELECT user_id FROM demo_user_context),
  'Mark Thompson',
  'Mark',
  'Thompson',
  'mark@techsolutions.com',
  '+1 (555) 987-6543',
  null,
  'email',
  null,
  'Marketing director with 10+ years experience in digital marketing and brand partnerships',
  'San Francisco, CA',
  'https://techsolutions.com',
  'Tech Solutions Inc',
  'Marketing Director',
  0,
  0,
  0.6,
  ARRAY['Business', 'Partnership', 'Marketing'],
  false,
  null,
  null,
  now() - interval '2 hours',
  8,
  5000.00,
  'active',
  'manual'
),
-- Contact 3: Emily Chen (Twitter Follower)
(
  (SELECT user_id FROM demo_user_context),
  'Emily Chen',
  'Emily',
  'Chen',
  'emily.chen@gmail.com',
  null,
  '@emilychen_dev',
  'twitter',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Software developer and tech enthusiast. Love sharing coding tips and career advice.',
  'Seattle, WA',
  'https://emilychen.dev',
  'Microsoft',
  'Senior Software Engineer',
  8500,
  3.1,
  0.9,
  ARRAY['Tech', 'Developer', 'Follower'],
  true,
  now() - interval '1 day',
  'Scraper',
  now() - interval '4 hours',
  12,
  750.00,
  'active',
  'auto-generated'
),
-- Contact 4: Alex Rodriguez (LinkedIn Connection)
(
  (SELECT user_id FROM demo_user_context),
  'Alex Rodriguez',
  'Alex',
  'Rodriguez',
  'alex.rodriguez@startup.co',
  '+1 (555) 456-7890',
  'alex.rodriguez',
  'linkedin',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Entrepreneur and startup founder. Building the future of e-commerce.',
  'Austin, TX',
  'https://alexrodriguez.co',
  'StartupCo',
  'CEO & Founder',
  15000,
  2.8,
  0.7,
  ARRAY['Entrepreneur', 'Startup', 'Business'],
  true,
  now() - interval '3 days',
  'Clearbit',
  now() - interval '6 hours',
  5,
  1200.00,
  'active',
  'import'
),
-- Contact 5: Jessica Williams (YouTube Subscriber)
(
  (SELECT user_id FROM demo_user_context),
  'Jessica Williams',
  'Jessica',
  'Williams',
  'jessica@creativestudio.com',
  null,
  '@jessicaw_creative',
  'youtube',
  'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Creative director and video producer. Helping brands tell their stories through video.',
  'New York, NY',
  'https://creativestudio.com',
  'Creative Studio',
  'Creative Director',
  45000,
  5.2,
  0.85,
  ARRAY['Creative', 'Video', 'Production'],
  false,
  null,
  null,
  now() - interval '12 hours',
  7,
  3200.00,
  'active',
  'auto-generated'
);

-- Insert mock messages
INSERT INTO messages (
  user_id,
  platform,
  contact_id,
  sender_name,
  sender_handle,
  sender_email,
  subject,
  body,
  message_type,
  timestamp,
  is_read,
  status,
  priority,
  attachments
) VALUES 
-- Message 1: Instagram DM from Sarah
(
  (SELECT user_id FROM demo_user_context),
  'instagram',
  (SELECT id FROM contacts WHERE email = 'sarah@example.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  'Sarah Johnson',
  '@sarahj_official',
  'sarah@example.com',
  'Collaboration Opportunity',
  'Hi! I love your content and would like to discuss a potential collaboration for our upcoming spring campaign. I think our audiences would really connect! Let me know if you''re interested.',
  'dm',
  now() - interval '30 minutes',
  false,
  'pending',
  'high',
  '[]'::jsonb
),
-- Message 2: Email from Mark
(
  (SELECT user_id FROM demo_user_context),
  'email',
  (SELECT id FROM contacts WHERE email = 'mark@techsolutions.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  'Mark Thompson',
  null,
  'mark@techsolutions.com',
  'Brand Partnership Proposal - Q1 2024',
  'Hello! We would love to partner with you for our spring collection launch. We''ve been following your work and believe you''d be a perfect fit for our brand. Please find the proposal attached. Looking forward to hearing from you!',
  'email',
  now() - interval '2 hours',
  true,
  'replied',
  'normal',
  '[{"id": "1", "filename": "proposal.pdf", "url": "#", "type": "pdf", "size": 1024000}]'::jsonb
),
-- Message 3: Twitter mention from Emily
(
  (SELECT user_id FROM demo_user_context),
  'twitter',
  (SELECT id FROM contacts WHERE email = 'emily.chen@gmail.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  'Emily Chen',
  '@emilychen_dev',
  'emily.chen@gmail.com',
  null,
  '@yourusername Your latest video on productivity tips was incredibly helpful! How do you stay motivated during challenging times? #productivity #motivation',
  'mention',
  now() - interval '4 hours',
  false,
  'pending',
  'normal',
  '[]'::jsonb
),
-- Message 4: LinkedIn message from Alex
(
  (SELECT user_id FROM demo_user_context),
  'linkedin',
  (SELECT id FROM contacts WHERE email = 'alex.rodriguez@startup.co' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  'Alex Rodriguez',
  'alex.rodriguez',
  'alex.rodriguez@startup.co',
  'Speaking Opportunity',
  'I saw your post about digital marketing trends and was impressed by your insights. Would you be interested in guest speaking at our upcoming conference? We have 500+ attendees expected.',
  'dm',
  now() - interval '6 hours',
  true,
  'replied',
  'high',
  '[]'::jsonb
),
-- Message 5: WhatsApp message
(
  (SELECT user_id FROM demo_user_context),
  'whatsapp',
  null,
  'David Kim',
  null,
  null,
  null,
  'Hey! Loved your recent post about morning routines. Could you share more tips on staying consistent with habits?',
  'message',
  now() - interval '1 hour',
  false,
  'pending',
  'normal',
  '[]'::jsonb
);

-- Insert mock comments
INSERT INTO comments (
  user_id,
  platform,
  post_id,
  post_title,
  post_url,
  content,
  author_name,
  author_handle,
  author_avatar,
  contact_id,
  timestamp,
  replied,
  reply_content,
  replied_at,
  sentiment,
  sentiment_score,
  likes_count,
  replies_count,
  is_mention
) VALUES 
-- Comment 1: Instagram comment from Sarah
(
  (SELECT user_id FROM demo_user_context),
  'instagram',
  'post-123',
  'Morning routine for productivity',
  'https://instagram.com/p/abc123',
  'This morning routine changed my life! Thank you for sharing these amazing tips. Do you have any recommendations for evening routines too?',
  'Sarah Johnson',
  '@sarahj_official',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  (SELECT id FROM contacts WHERE email = 'sarah@example.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  now() - interval '45 minutes',
  false,
  null,
  null,
  'positive',
  0.9,
  12,
  3,
  false
),
-- Comment 2: YouTube comment from Jessica
(
  (SELECT user_id FROM demo_user_context),
  'youtube',
  'video-456',
  'How to Start Your Influencer Journey',
  'https://youtube.com/watch?v=abc123',
  'Great video! I''ve been struggling with content consistency. Your tips on batch creating content are gold!',
  'Jessica Williams',
  '@jessicaw_creative',
  'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150',
  (SELECT id FROM contacts WHERE email = 'jessica@creativestudio.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  now() - interval '2 hours',
  true,
  'Thank you so much! Consistency is definitely key - you''ve got this! I''ll be sharing more batch content tips soon.',
  now() - interval '90 minutes',
  'positive',
  0.8,
  8,
  1,
  false
),
-- Comment 3: Twitter mention from Emily
(
  (SELECT user_id FROM demo_user_context),
  'twitter',
  'tweet-789',
  'Thoughts on work-life balance',
  'https://twitter.com/user/status/123',
  '@yourusername Your perspective on work-life balance really resonates with me. How do you handle burnout when building your personal brand?',
  'Emily Chen',
  '@emilychen_dev',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
  (SELECT id FROM contacts WHERE email = 'emily.chen@gmail.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  now() - interval '4 hours',
  false,
  null,
  null,
  'neutral',
  0.5,
  5,
  0,
  true
),
-- Comment 4: TikTok comment
(
  (SELECT user_id FROM demo_user_context),
  'tiktok',
  'tiktok-101',
  'Quick productivity hack',
  'https://tiktok.com/@user/video/123',
  'This hack actually works! I''ve been using it for a week and my productivity has increased so much. Thank you! 🙌',
  'Maria Santos',
  '@mariasantos',
  'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150',
  null,
  now() - interval '8 hours',
  false,
  null,
  null,
  'positive',
  0.95,
  24,
  2,
  false
);

-- Insert contact enrichment logs
INSERT INTO contact_enrichment_logs (
  contact_id,
  user_id,
  enriched_by,
  enrichment_type,
  data_before,
  data_after,
  fields_updated,
  confidence_score,
  cost,
  status
) VALUES 
(
  (SELECT id FROM contacts WHERE email = 'sarah@example.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  (SELECT user_id FROM demo_user_context),
  'AI Agent',
  'profile',
  '{"bio": null, "company": null, "job_title": null}'::jsonb,
  '{"bio": "Fashion influencer & lifestyle blogger", "company": "SJ Media", "job_title": "Content Creator"}'::jsonb,
  ARRAY['bio', 'company', 'job_title'],
  0.95,
  0.25,
  'completed'
),
(
  (SELECT id FROM contacts WHERE email = 'emily.chen@gmail.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  (SELECT user_id FROM demo_user_context),
  'Scraper',
  'social',
  '{"follower_count": 0, "engagement_rate": 0}'::jsonb,
  '{"follower_count": 8500, "engagement_rate": 3.1}'::jsonb,
  ARRAY['follower_count', 'engagement_rate'],
  0.88,
  0.15,
  'completed'
),
(
  (SELECT id FROM contacts WHERE email = 'alex.rodriguez@startup.co' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  (SELECT user_id FROM demo_user_context),
  'Clearbit',
  'professional',
  '{"company": null, "job_title": null, "website": null}'::jsonb,
  '{"company": "StartupCo", "job_title": "CEO & Founder", "website": "https://alexrodriguez.co"}'::jsonb,
  ARRAY['company', 'job_title', 'website'],
  0.92,
  0.35,
  'completed'
);

-- Insert contact interactions
INSERT INTO contact_interactions (
  contact_id,
  user_id,
  interaction_type,
  platform,
  title,
  description,
  timestamp
) VALUES 
(
  (SELECT id FROM contacts WHERE email = 'sarah@example.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  (SELECT user_id FROM demo_user_context),
  'message',
  'instagram',
  'Instagram DM',
  'Collaboration inquiry about spring campaign',
  now() - interval '30 minutes'
),
(
  (SELECT id FROM contacts WHERE email = 'mark@techsolutions.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  (SELECT user_id FROM demo_user_context),
  'email',
  'email',
  'Brand Partnership Email',
  'Received partnership proposal with attached PDF',
  now() - interval '2 hours'
),
(
  (SELECT id FROM contacts WHERE email = 'emily.chen@gmail.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  (SELECT user_id FROM demo_user_context),
  'comment',
  'twitter',
  'Twitter Mention',
  'Asked about work-life balance and burnout',
  now() - interval '4 hours'
),
(
  (SELECT id FROM contacts WHERE email = 'alex.rodriguez@startup.co' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  (SELECT user_id FROM demo_user_context),
  'message',
  'linkedin',
  'LinkedIn Message',
  'Speaking opportunity at conference',
  now() - interval '6 hours'
),
(
  (SELECT id FROM contacts WHERE email = 'jessica@creativestudio.com' AND user_id = (SELECT user_id FROM demo_user_context) LIMIT 1),
  (SELECT user_id FROM demo_user_context),
  'comment',
  'youtube',
  'YouTube Comment',
  'Positive feedback on content consistency video',
  now() - interval '2 hours'
);

-- Insert contact tags
INSERT INTO contact_tags (
  user_id,
  name,
  color,
  description
) VALUES 
((SELECT user_id FROM demo_user_context), 'VIP', '#10B981', 'High-value contacts and key relationships'),
((SELECT user_id FROM demo_user_context), 'Influencer', '#8B5CF6', 'Content creators and social media influencers'),
((SELECT user_id FROM demo_user_context), 'Business', '#3B82F6', 'Business contacts and potential partners'),
((SELECT user_id FROM demo_user_context), 'Fashion', '#EC4899', 'Fashion industry contacts'),
((SELECT user_id FROM demo_user_context), 'Tech', '#6366F1', 'Technology industry professionals'),
((SELECT user_id FROM demo_user_context), 'Creative', '#F59E0B', 'Creative professionals and artists'),
((SELECT user_id FROM demo_user_context), 'Startup', '#EF4444', 'Startup founders and entrepreneurs'),
((SELECT user_id FROM demo_user_context), 'Developer', '#06B6D4', 'Software developers and engineers'),
((SELECT user_id FROM demo_user_context), 'Marketing', '#F97316', 'Marketing professionals'),
((SELECT user_id FROM demo_user_context), 'Partnership', '#84CC16', 'Potential business partnerships'),
((SELECT user_id FROM demo_user_context), 'Lifestyle', '#EC4899', 'Lifestyle and wellness content creators'),
((SELECT user_id FROM demo_user_context), 'Video', '#DC2626', 'Video content creators and producers'),
((SELECT user_id FROM demo_user_context), 'Production', '#7C3AED', 'Production and media professionals'),
((SELECT user_id FROM demo_user_context), 'Entrepreneur', '#059669', 'Entrepreneurs and business owners'),
((SELECT user_id FROM demo_user_context), 'Follower', '#0EA5E9', 'Social media followers and fans');

-- Clean up temporary table
DROP TABLE IF EXISTS demo_user_context;