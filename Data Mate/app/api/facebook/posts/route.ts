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

    // Get query params
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');
    const postType = searchParams.get('type'); // 'photo', 'video', 'reel', etc.

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Verify profile belongs to user
    const { data: profile, error: profileError } = await supabase
      .from('social_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found or access denied' }, { status: 404 });
    }

    // Get posts with pagination
    let query = supabase
      .from('social_posts')
      .select(`
        *,
        content_media(*),
        social_comments(count)
      `, { count: 'exact' })
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .order('created_at_platform', { ascending: false });
      
    // Filter by post type if specified
    if (postType) {
      query = query.eq('post_type', postType);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: posts, error: postsError, count } = await query;

    if (postsError) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Get comment counts for each post
    const postsWithCommentCounts = posts.map(post => ({
      ...post,
      comment_count: post.social_comments[0]?.count || 0,
      content_media: post.content_media || []
    }));

    return NextResponse.json({
      posts: postsWithCommentCounts,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: count ? offset + limit < count : false
      }
    });
  } catch (error) {
    console.error('Facebook posts error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get Facebook posts' },
      { status: 500 }
    );
  }
}