import axios from "axios";
import { supabase } from "../db/supabase";
import { log } from "./logger.service";

interface RequestUser {
  keyword_summary: string[]
}
interface RequestPost {
  id: string;
  content: string;
}

export interface ConnectionRequest {
  id: string;
  reactor_id: string;
  post_owner_id: string;
  posts: RequestPost;
  user: RequestUser
  degree: number
}

interface RequestResponse {
  success: boolean;
  data: ConnectionRequest[];
  error?: string;
}

export const fetchPostRequests = async (userId: string): Promise<any> => {
  console.log(`https://58af-103-185-242-167.ngrok-free.app/api/users/connection-requests/${userId}`);
  try {
    const { data } = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/connection-requests/${userId}`)
    console.log(data)
    return {
      success: true,
      data: data,
    };

  } catch (error) {
    log('fetchPostRequests', 'Error fetching post requests:', error as string);
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
  post_owner_id: string,
  reactor_id: string,
): Promise<ReactionResponse> => {
  try {
    console.log('reactToPost', 'postId:', postId, 'post_owner_id:', post_owner_id, 'reactor_id:', reactor_id);

    const { error } = await supabase
      .from("post_reactions")
      .upsert(
        {
          post_id: postId,
          post_owner_id: post_owner_id,
          reactor_id: reactor_id,
          interest: true
        },
        {
          onConflict: 'post_id,reactor_id'
        }
      );

    if (error) throw error;

    return {
      success: true
    };
  } catch (error) {
    log('reactToPost', 'Error reacting to post:', error as string);
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
    log('deleteReaction', 'Error deleting reaction:', error as string);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete reaction'
    };
  }
};


