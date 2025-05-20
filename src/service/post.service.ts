import { Post } from '../constants/types/post';
import { supabase } from '../db/supabase';

export const fetchPostsByDegree = async (userId: string, degreeLimit?: number): Promise<Post[] | null> => {
  try {
    // Call your Postgres function via supabase.rpc
    const { data, error } = await supabase
      .rpc('get_posts_by_degree', {
        _input_user_id: userId,
        _input_degree_limit: degreeLimit ?? null,
      });

    if (error) {
      throw error;
    }

    // data should be Post[] or null
    return data ?? [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return null;
  }
}
