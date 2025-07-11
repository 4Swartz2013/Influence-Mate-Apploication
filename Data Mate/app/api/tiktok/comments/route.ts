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
    const postId = searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const topLevelOnly = searchParams.get('topLevelOnly') === 'true';

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Verify post belongs to user
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .select('id')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (postError) {
      return NextResponse.json({ error: 'Post not found or access denied' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('social_comments')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .order('created_at_platform', { ascending: false });
    
    if (topLevelOnly) {
      query = query.eq('is_reply', false);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: comments, error: commentsError, count } = await query;

    if (commentsError) {
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // If we have top-level comments, we may need to fetch their replies
    if (topLevelOnly && comments.length > 0) {
      const topLevelIds = comments.map(c => c.comment_id);
      
      // Get replies for these top-level comments
      const { data: replies } = await supabase
        .from('social_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('is_reply', true)
        .in('parent_comment_id', topLevelIds)
        .order('created_at_platform', { ascending: true });
      
      // Group replies by parent comment
      const repliesByParent: Record<string, any[]> = {};
      
      if (replies) {
        for (const reply of replies) {
          if (!repliesByParent[reply.parent_comment_id]) {
            repliesByParent[reply.parent_comment_id] = [];
          }
          repliesByParent[reply.parent_comment_id].push(reply);
        }
      }
      
      // Add replies to their parent comments
      for (const comment of comments) {
        comment.replies = repliesByParent[comment.comment_id] || [];
      }
    }

    return NextResponse.json({
      comments,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: count ? offset + limit < count : false
      }
    });
  } catch (error) {
    console.error('TikTok comments error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get TikTok comments' },
      { status: 500 }
    );
  }
}