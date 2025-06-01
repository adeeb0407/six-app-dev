import { supabase } from "../db/supabase";
import { log } from "./logger.service";
import { addConnection } from "./neo4j.service";

export const syncContactsWithSupabase = async (phoneNumbers: string[]) => {
  console.log('synicing contacts')
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
   if (!matchedUsers || matchedUsers.length === 0) {
      console.log('syncContactsWithSupabase', 'No matching users found');
      return;
    }

    for (const user of matchedUsers) {
      const { contact_user_id, name, phone } = user;

      console.log('Matched contact', `Name: ${name}, Phone: ${phone}, ID: ${contact_user_id}`);

      if (contact_user_id && contact_user_id !== currentUserId) {
        try {
          await addConnection(currentUserId, contact_user_id);
          log('Connection created', `${currentUserId} -> ${contact_user_id}`);
        } catch (neoError) {
          log('syncContactsWithSupabase', `Failed to add Neo4j connection for ${currentUserId} -> ${contact_user_id}`);
        }
      }
    }

  } catch (error) {
    log('syncContactsWithSupabase', 'Unexpected error syncing contacts:', error as string);
  }
};