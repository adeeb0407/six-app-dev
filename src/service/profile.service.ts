import { decode } from "base64-arraybuffer";
import { UserProfile } from "../constants/types/user.types";
import { supabase } from "../db/supabase";
import { log } from "./logger.service";

interface ProfileResponse {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const fetchUserProfile = async (userId: string): Promise<ProfileResponse> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        profile_photo, 
        keyword_summary
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as UserProfile
    };

  } catch (error) {
    log('fetchUserProfile', 'Error fetching user profile:', error as string);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user profile'
    };
  }
};


export const updateProfilePicture = async (
  userId: string,
  base64Image: string,
): Promise<UploadResponse> => {
  try {
    // Remove the data:image/jpeg;base64, prefix if present
    const base64Str = base64Image.includes("base64,")
      ? base64Image.substring(base64Image.indexOf("base64,") + "base64,".length)
      : base64Image;
    const res = decode(base64Str);

    if (!(res.byteLength > 0)) {
      return { success: false, error: 'Invalid image data' };
    }

    // Clean up old profile pictures
    const { data: filesList } = await supabase
      .storage
      .from('pfp')
      .list(`${userId}`);

    if (filesList && filesList.length > 0) {
      const filesToDelete = filesList.map(file => `${userId}/${file.name}`);
      await supabase.storage.from('pfp').remove(filesToDelete);
    }

    // Upload new profile picture
    const timestamp = Date.now();
    const fileName = `${userId}/profile-pic-${timestamp}`;

    const { error: uploadError } = await supabase
      .storage
      .from('pfp')
      .upload(fileName, res, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('pfp')
      .getPublicUrl(fileName);

    const cacheBustedUrl = `${publicUrl}?t=${timestamp}`;

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photo: cacheBustedUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, url: cacheBustedUrl };
  } catch (error) {
    log('updateProfilePicture', 'Profile picture update error:', error as string);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile picture'
    };
  }
};

export const updateUserProfile = async (userData: UserProfile): Promise<ProfileResponse> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: userData.name,
        keyword_summary: userData.keyword_summary,
      })
      .eq('id', userData.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as UserProfile
    };
  } catch (error) {
    log('updateUserProfile', 'Error updating user profile:', error as string);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user profile'
    };
  }
}