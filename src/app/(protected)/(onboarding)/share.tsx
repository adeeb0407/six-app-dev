import NextButton from '@/src/components/common/NextButton';
import SharingCard from '@/src/components/common/SharingCard';
import { syncContactsWithSupabase } from '@/src/service/contact.service';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Share = () => {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>('checking'); // Add initial checking state

  // Check permissions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkAndLoadContacts();
    }, [])
  );

  const checkAndLoadContacts = async () => {
    try {
      let { status } = await Contacts.getPermissionsAsync();
      console.log('Initial permission status:', status);

      if (status === 'undetermined') {
        const { status: newStatus } = await Contacts.requestPermissionsAsync();
        console.log('Permission request result:', newStatus);
        status = newStatus;
      }

      setPermissionStatus(status);

      if (status === 'granted') {
        await loadContacts();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionStatus('error');
    }
  };

  // Load contacts from device, extract unique last 10-digit phone numbers, then sync with Supabase
  const loadContacts = async () => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (!data || data.length === 0) return;

      setContacts(data);

      const phoneNumbers = extractUniqueLast10Digits(data);

      if (phoneNumbers.length === 0) return;

      await syncContactsWithSupabase(phoneNumbers);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Extract unique last 10 digits of phone numbers from contact data
  const extractUniqueLast10Digits = (contacts: any[]): string[] => {
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

    console.log('Total unique phone numbers extracted:', numbers.length);
    return numbers;
  };
  const openSettings = async () => {
    await Linking.openSettings();
  };

  const handleReload = async () => {
    const { status } = await Contacts.getPermissionsAsync();
    setPermissionStatus(status);

    if (status === 'granted') {
      loadContacts();
    } else {
      Alert.alert('Permission Required', 'Contact access is still not enabled');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Almost There</Text>
          
          {permissionStatus === 'checking' ? (
            <Text style={styles.subtitle}>Checking permissions...</Text>
          ) : permissionStatus === 'granted' ? (
            <>
              <Text style={styles.subtitle}>
                Refer six contacts to join
              </Text>
              <SharingCard />
            </>
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>
                Please enable contacts access in settings
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={openSettings}
                >
                  <Text style={styles.settingsButtonText}>
                    Enable in Settings
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reloadButton}
                  onPress={handleReload}
                >
                  <Ionicons name="reload-outline" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      <NextButton
        onPress={() => router.push('/guide1')}
        disabled={permissionStatus !== 'granted'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    marginTop: 60,
    alignItems: 'stretch',
    marginBottom: 30
  },
  textContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    color: '#000',
    marginBottom: 8,
    fontFamily: 'TimesNewRomanRegular',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    fontStyle: 'italic'
  },
  permissionText: {
    fontSize: 14,
    color: '#ff6b6b',
    marginTop: 8,
  },
  permissionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 16,
  },
  settingsButton: {
    paddingHorizontal: 16,
  },
  settingsButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  reloadButton: {
    padding: 4,
  },
});

export default Share;