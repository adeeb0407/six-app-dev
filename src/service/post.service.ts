import axios from 'axios';
import Constants from 'expo-constants';
import { ApiResponse } from '../constants/types/api.types';
import { AppConfigExtra } from '../constants/types/env.types';
import { PaginatedPostsResponse, PostInput } from '../constants/types/post.types.';
import { supabase } from '../db/supabase';
import { log } from './logger.service';

const { BACKEND_URL } = Constants.expoConfig?.extra as AppConfigExtra || 'https://0ad0-103-185-242-167.ngrok-free.app/api'

export const fetchPostsByDegree = async (
  userId: string,
  degreeFilter: number = 0,
  page: number = 1,
  limit: number = 20

): Promise<ApiResponse<PaginatedPostsResponse> | null> => {
    console.log(`${BACKEND_URL}/users/posts/${userId}`)

  try {
    const response = await axios.get(`${BACKEND_URL}/users/posts/${userId}`, {
      params: {
        degreeFilter,
        page,
        limit
      }
    })


    if (response.data) {
      const paginatedData: PaginatedPostsResponse = response.data;
      return {
        success: true,
        data: paginatedData
      };
    }
    return null;

  } catch (error) {
    log('fetchPostsByDegree', 'Error fetching posts:', error as string);
    return {
      success: false,
      error: (error as Error).message || 'Failed to fetch posts'
    };
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


