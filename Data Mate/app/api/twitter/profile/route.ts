import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get handle from query params
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const profileId = searchParams.get('id');

    if (!handle && !profileId) {
      return NextResponse.json({ error: 'Twitter handle or profile ID is required' }, { status: 400 });
    }

    // Query for profile
    let query = supabase
      .from('social_profiles')
      .select('*, social_posts(count)')
      .eq('user_id', user.id)
      .eq('platform', 'twitter');

    if (profileId) {
      query = query.eq('id', profileId);
    } else {
      query = query.eq('handle', handle);
    }

    const { data: profile, error: profileError } = await query.single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get post count from the generated count
    const postCount = profile.social_posts[0]?.count || 0;
    delete profile.social_posts;

    // Get recent posts
    const { data: posts, error: postsError } = await supabase
      .from('social_posts')
      .select(`
        *,
        content_media(*),
        social_comments(count)
      `)
      .eq('profile_id', profile.id)
      .order('created_at_platform', { ascending: false })
      .limit(10);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
    }

    // Get comment counts for each post
    const postsWithCommentCounts = posts?.map(post => ({
      ...post,
      comment_count: post.social_comments[0]?.count || 0,
      content_media: post.content_media || []
    })) || [];

    return NextResponse.json({
      profile: {
        ...profile,
        post_count: postCount
      },
      recent_posts: postsWithCommentCounts,
      post_count: postCount
    });
  } catch (error) {
    console.error('Twitter profile error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get Twitter profile' },
      { status: 500 }
    );
  }
}