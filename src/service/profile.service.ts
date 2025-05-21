import { decode } from "base64-arraybuffer";
import { UserProfile } from "../constants/types/user.types";
import { supabase } from "../db/supabase";

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
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user profile'
    };
  }
};


export const updateProfilePicture = async (
  userId: string,
  base64Image: string,
  fileName: string
): Promise<UploadResponse> => {
  try {
    // Remove the data:image/jpeg;base64, prefix if present
   const base64Str = base64Image.includes("base64,")
			? base64Image.substring(
					base64Image.indexOf("base64,") + "base64,".length
			  )
			: base64Image;
		const res = decode(base64Str);

    if (!(res.byteLength > 0)) {
			console.error("[uploadToSupabase] ArrayBuffer is null");
		}


    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('pfp')
      .upload(`${userId}/${fileName}`, res, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('pfp')
      .getPublicUrl(`${userId}/${fileName}`);

    // Update user profile with new photo URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photo: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Profile picture update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile picture'
    };
  }
};