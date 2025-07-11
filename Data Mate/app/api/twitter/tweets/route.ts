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
    const tweetType = searchParams.get('type'); // 'tweet', 'reply', 'retweet', 'quote'

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

    // Get tweets with pagination
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
      
    // Filter by tweet type if specified
    if (tweetType) {
      query = query.eq('post_type', tweetType);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: tweets, error: tweetsError, count } = await query;

    if (tweetsError) {
      return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 });
    }

    // Get comment counts for each tweet
    const tweetsWithCommentCounts = tweets.map(tweet => ({
      ...tweet,
      comment_count: tweet.social_comments[0]?.count || 0,
      content_media: tweet.content_media || []
    }));

    return NextResponse.json({
      tweets: tweetsWithCommentCounts,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: count ? offset + limit < count : false
      }
    });
  } catch (error) {
    console.error('Twitter tweets error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get Twitter tweets' },
      { status: 500 }
    );
  }
}