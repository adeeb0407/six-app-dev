import { Post, PostInput } from '../constants/types/post.types.';
import { supabase } from '../db/supabase';

export const fetchPostsByDegree = async (userId: string, degreeLimit?: number): Promise<Post[] | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_posts_by_degree', {
        _input_user_id: userId,
        _input_degree_limit: degreeLimit ?? null,
      });

    if (error) {
      console.error('Error fetching posts:', error);
      return null;
    }

    console.log('posts', data);
    return data ?? [];

  } catch (error) {
    console.error('Error in fetchPostsByDegree:', error);
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
    console.error("Error creating post:", err);
    return null;
  }
};


