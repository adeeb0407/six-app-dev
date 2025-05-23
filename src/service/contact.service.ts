import { supabase } from "../db/supabase";
import { log } from "./logger.service";

export const syncContactsWithSupabase = async (phoneNumbers: string[]) => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData?.session?.user?.id) {
      log('syncContactsWithSupabase', 'User session error or no user signed in:');
      return;
    }

    const currentUserId = sessionData.session.user.id;

    // Call RPC to match contacts
    const { data: matchedUsers, error } = await supabase.rpc('match_contacts_by_last10', {
      contact_last10s: phoneNumbers,
      requesting_user: currentUserId,
    });

    if (error) {
      log('syncContactsWithSupabase', 'Error matching contacts via RPC:', error.message);
      return;
    }

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
      log('syncContactsWithSupabase', 'Error inserting contacts into Supabase:', insertError.message);
    }
  } catch (error) {
    log('syncContactsWithSupabase', 'Unexpected error syncing contacts:', error as string);
  }
};