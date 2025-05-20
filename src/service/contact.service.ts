import { supabase } from "../db/supabase";

export const syncContactsWithSupabase = async (phoneNumbers: string[]) => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData?.session?.user?.id) {
      console.error('User session error or no user signed in:', sessionError);
      return;
    }

    const currentUserId = sessionData.session.user.id;

    // Call RPC to match contacts
    const { data: matchedUsers, error: rpcError } = await supabase.rpc('match_contacts_by_last10', {
      contact_last10s: phoneNumbers,
      requesting_user: currentUserId,
    });

    if (rpcError) {
      console.error('Error matching contacts via RPC:', rpcError);
      return;
    }

    console.log('Matched users from Supabase:', matchedUsers);

    if (!matchedUsers || matchedUsers.length === 0) return;

    // Prepare insert objects
    const inserts = matchedUsers.map((u: { contact_user_id: string }) => ({
      owner_id: currentUserId,
      contact_user_id: u.contact_user_id,
    }));

    // Insert matched contacts, ignoring duplicates
    const { error: insertError } = await supabase.from('contacts')
    .upsert(inserts, { ignoreDuplicates: true });

    if (insertError) {
      console.error('Error inserting contacts into Supabase:', insertError);
    }
  } catch (error) {
    console.error('Unexpected error syncing contacts:', error);
  }
};