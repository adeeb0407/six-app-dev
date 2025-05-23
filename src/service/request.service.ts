import { supabase } from "../db/supabase";

interface RequestUser {
  id: string;
  name: string;
  profile_photo: string | null;
}

interface RequestPost {
  id: string;
  content: string;
}

interface PostRequest {
  id: string;
  user_id: string;
  post_id: string;
  interest: boolean;
  accepted: boolean;
  users: RequestUser;
  posts: RequestPost;
}

interface RequestResponse {
  success: boolean;
  data: PostRequest[];
  error?: string;
}

 export const fetchPostRequests = async (userId: string): Promise<any> => {
  try {
    // Step 1: Get all your post IDs
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId);

    if (postsError) throw postsError;

    const postIds = posts.map(post => post.id);

    // Step 2: Get all post reactions on your posts
    const { data, error } = await supabase
      .from('post_reactions')
      .select(`
        id,
        interest,
        accepted,
        created_at,
        users:user_id (
          id,
          name,
          profile_photo
        ),
        posts (
          id,
          content
        )
      `)
      .in('post_id', postIds)
      .eq('interest', true)
      .eq('accepted', false);

    if (error) throw error;

    return {
      success: true,
      data: data,
    };

  } catch (error) {
    console.error('Error fetching post requests:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch requests'
    };
  }
};


interface ReactionResponse {
  success: boolean;
  error?: string;
}

export const reactToPost = async (
  postId: string,
  userId: string,
): Promise<ReactionResponse> => {
  try {
    const { error } = await supabase
      .from("post_reactions")
      .upsert(
        {
          post_id: postId,
          user_id: userId,
          interest: true
        },
        {
          onConflict: 'post_id,user_id'
        }
      );

    if (error) throw error;

    return {
      success: true
    };
  } catch (error) {
    console.error("Error reacting to post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to react to post'
    };
  }
};

interface DeleteReactionResponse {
  success: boolean;
  error?: string;
}

export const deleteReaction = async (reactionId: string): Promise<DeleteReactionResponse> => {
  try {
    const { error } = await supabase
      .from('post_reactions')
      .delete()
      .eq('id', reactionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete reaction'
    };
  }
};


