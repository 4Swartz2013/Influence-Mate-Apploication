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
    const tweetId = searchParams.get('tweetId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const topLevelOnly = searchParams.get('topLevelOnly') === 'true';
    const includeMedia = searchParams.get('includeMedia') === 'true';

    if (!tweetId) {
      return NextResponse.json({ error: 'Tweet ID is required' }, { status: 400 });
    }

    // Verify tweet belongs to user
    const { data: tweet, error: tweetError } = await supabase
      .from('social_posts')
      .select('id')
      .eq('id', tweetId)
      .eq('user_id', user.id)
      .single();

    if (tweetError) {
      return NextResponse.json({ error: 'Tweet not found or access denied' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('social_comments')
      .select(`*${includeMedia ? ', content_media(*)' : ''}`, { count: 'exact' })
      .eq('post_id', tweetId)
      .eq('user_id', user.id)
      .order('created_at_platform', { ascending: false });
    
    if (topLevelOnly) {
      query = query.is('parent_comment_id', null);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: comments, error: commentsError, count } = await query;

    if (commentsError) {
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Process comments
    let processedComments = comments.map(comment => {
      // Include media if requested
      if (includeMedia) {
        return {
          ...comment,
          media: comment.content_media || []
        };
      }
      return comment;
    });

    // If we need to group replies for top-level comments
    if (topLevelOnly) {
      // Get all reply comment IDs
      const topLevelIds = processedComments.map(c => c.comment_id);
      
      // Get replies for these top-level comments
      const { data: replies } = await supabase
        .from('social_comments')
        .select(`*${includeMedia ? ', content_media(*)' : ''}`)
        .eq('post_id', tweetId)
        .eq('user_id', user.id)
        .not('parent_comment_id', 'is', null)
        .in('parent_comment_id', topLevelIds)
        .order('created_at_platform', { ascending: true });
      
      // Group replies by parent comment
      const repliesByParent: Record<string, any[]> = {};
      
      if (replies) {
        for (const reply of replies) {
          if (!repliesByParent[reply.parent_comment_id]) {
            repliesByParent[reply.parent_comment_id] = [];
          }

          // Format replies the same way as comments
          if (includeMedia) {
            repliesByParent[reply.parent_comment_id].push({
              ...reply,
              media: reply.content_media || []
            });
          } else {
            repliesByParent[reply.parent_comment_id].push(reply);
          }
        }
      }
      
      // Add replies to their parent comments
      processedComments = processedComments.map(comment => ({
        ...comment,
        replies: repliesByParent[comment.comment_id] || []
      }));
    }

    return NextResponse.json({
      comments: processedComments,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: count ? offset + limit < count : false
      }
    });
  } catch (error) {
    console.error('Twitter comments error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get Twitter comments' },
      { status: 500 }
    );
  }
}