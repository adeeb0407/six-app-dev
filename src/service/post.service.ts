import { Post, PostInput } from '../constants/types/post.types.';
import { supabase } from '../db/supabase';
import { log } from './logger.service';

export const fetchPostsByDegree = async (userId: string, degreeLimit?: number): Promise<Post[] | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_posts_by_degree', {
        _input_user_id: userId,
        _input_degree_limit: degreeLimit ?? null,
      });

    if (error) {
      log('fetchPostsByDegree', 'Error fetching posts:', error.message);
      return null;
    }

    return data ?? [];

  } catch (error) {
    log('fetchPostsByDegree', 'Error fetching posts:', error as string);
    return null;
  }
};

export const createPost = async (input: PostInput) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([{
        user_id: input.user_id,
        content: input.content,
        category: input.category,
        hide_from_chat: input.hide_from_chat ?? false,
        connection_type: input.connectiontype
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    log('createPost', 'Error creating post:', err as string);
    return null;
  }
};


