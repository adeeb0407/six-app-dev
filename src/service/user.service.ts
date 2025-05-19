import { supabase } from '../db/supabase';

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
      console.log('Error checking user existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.log('Exception checking user existence:', error);
    return false;
  }
};

// Modify createUser to check existence first
export const createUser = async ({ id, phone }: CreateUserParams) => {
  try {
    // Check if user exists first
    const exists = await checkUserExists(id);
    
    if (exists) {
      console.log('User already exists:', id);
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
      console.log('Error creating user:', error);
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
    console.log('Exception creating user:', error);
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user profile',
    };
  }
};