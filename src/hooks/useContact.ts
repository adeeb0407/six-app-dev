import { syncContactsWithSupabase } from '@/src/service/contact.service';
import { log } from '@/src/service/logger.service';
import * as Contacts from 'expo-contacts';
import { useCallback, useState } from 'react';

export interface UseContactsReturn {
  contacts: Contacts.Contact[];
  permissionStatus: string;
  isLoading: boolean;
  isSyncing: boolean;
  checkAndLoadContacts: () => Promise<void>;
  syncContacts: () => Promise<void>;
  handleReload: () => Promise<void>;
}

export const useContacts = (): UseContactsReturn => {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Extract unique last 10 digits of phone numbers from contact data
  const extractUniqueLast10Digits = useCallback((contacts: Contacts.Contact[]): string[] => {
    const seen = new Set<string>();
    const numbers: string[] = [];

    for (const contact of contacts) {
      if (contact.phoneNumbers) {
        for (const phone of contact.phoneNumbers) {
          if (!phone.number) continue;

          const digitsOnly = phone.number.replace(/\D/g, '');
          const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : null;

          if (last10 && !seen.has(last10)) {
            seen.add(last10);
            numbers.push(last10);
          }
        }
      }
    }

    return numbers;
  }, []);

  // Load contacts from device
  const loadContacts = useCallback(async (): Promise<Contacts.Contact[]> => {
    setIsLoading(true);
    
    try {
      const { status } = await Contacts.getPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        return [];
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (!data || data.length === 0) {
        return [];
      }

      setContacts(data);
      return data;
    } catch (error) {
      log('loadContacts', 'Error loading contacts:', error as string);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync contacts with Supabase
  const syncContacts = useCallback(async (contactsData?: Contacts.Contact[]): Promise<void> => {
    setIsSyncing(true);
    
    try {
      const contactsToSync = contactsData || contacts;
      
      if (contactsToSync.length === 0) {
        throw new Error('No contacts available to sync');
      }

      const phoneNumbers = extractUniqueLast10Digits(contactsToSync);

      if (phoneNumbers.length === 0) {
        throw new Error('No valid phone numbers found in contacts');
      }

      await syncContactsWithSupabase(phoneNumbers);
    } catch (error) {
      log('syncContacts', 'Error syncing contacts:', error as string);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [contacts, extractUniqueLast10Digits]);

  // Check permissions and load contacts
  const checkAndLoadContacts = useCallback(async (): Promise<void> => {
    try {
      let { status } = await Contacts.getPermissionsAsync();

      if (status === 'undetermined') {
        const { status: newStatus } = await Contacts.requestPermissionsAsync();
        status = newStatus;
      }

      setPermissionStatus(status);

      if (status === 'granted') {
        const loadedContacts = await loadContacts();
        if (loadedContacts.length > 0) {
          await syncContacts(loadedContacts);
        }
      }
    } catch (error) {
      setPermissionStatus('error');
    }
  }, [loadContacts, syncContacts]);

  // Handle reload after permission changes
  const handleReload = useCallback(async (): Promise<void> => {
    const { status } = await Contacts.getPermissionsAsync();
    setPermissionStatus(status);

    if (status === 'granted') {
      const loadedContacts = await loadContacts();
      if (loadedContacts.length > 0) {
        await syncContacts(loadedContacts);
      }
    } else {
    }
  }, [loadContacts, syncContacts]);

  return {
    contacts,
    permissionStatus,
    isLoading,
    isSyncing,
    checkAndLoadContacts,
    syncContacts,
    handleReload,
  };
};