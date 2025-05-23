import { supabase } from '../db/supabase';
import { log } from './logger.service';

type CreateUserParams = {
  id: string;
  phone: string;
};

type UpdateUserProfileParams = {
  id: string;
  name: string;
  keyword_summary: string[];
};

// Add this new function to check user existence
export const checkUserExists = async (id: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (error) {
      log('checkUserExists', 'Error checking user existence:', error.message);
      return false;
    }

    return !!data;
  } catch (error) {
    log('checkUserExists', 'Exception checking user existence:', error as string);
    return false;
  }
};  

// Modify createUser to check existence first
export const createUser = async ({ id, phone }: CreateUserParams) => {
  try {
    // Check if user exists first
    const exists = await checkUserExists(id);
    
    if (exists) {
      log('createUser', 'User already exists:', id);
      return {
        success: true,
        exists: true,
        data: null
      };
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id,
          phone,
        },
      ])
      .select()
      .single();

    if (error) {
      log('createUser', 'Error creating user:', error.message);
      return {
        success: false,
        exists: false,
        error: error.message,
      };
    }

    return {
      success: true,
      exists: false,
      data,
    };
  } catch (error) {
    log('createUser', 'Exception creating user:', error as string);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
};

export const updateUserProfile = async ({
  id,
  name,
  keyword_summary,
}: UpdateUserProfileParams) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        keyword_summary,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      log('updateUserProfile', 'Error updating user profile:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    log('updateUserProfile', 'Exception updating user profile:', error as string);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user profile',
    };
  }
};