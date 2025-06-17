import ProfileImage from '@/src/components/feature/Profile/ProfileImage';
import { Contact } from '@/src/constants/types/chat.types';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ConnectionProfile = () => {
  const { contact } = useLocalSearchParams();
  const connectionDetails = JSON.parse(contact as string) as Contact;

  // Ensure keyword_summary is an array of strings
  let keywords: string[] = [];
  if (Array.isArray(connectionDetails.keyword_summary)) {
    keywords = connectionDetails.keyword_summary as string[];
  } else if (typeof connectionDetails.keyword_summary === 'string') {
    keywords = (connectionDetails.keyword_summary as string)
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <ProfileImage
          imageUrl={connectionDetails.profile_photo}
          name={connectionDetails.name}
          size={200}
          borderRadius={20}
        />
        <Text style={styles.name}>{connectionDetails.name}</Text>
        <Text style={styles.degree}>Degree: {connectionDetails.connectionDegree}</Text>
        <Text style={styles.mutual}>{connectionDetails.mutualCount} mutual connections</Text>
        <Text style={styles.keywords}>
          {keywords.join(' | ')}
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  name: {
    fontSize: 28,
    fontFamily: 'TimesNewRomanBold',
    marginTop: 24,
    color: '#222',
  },
  degree: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 2,
  },
  mutual: {   
    fontSize: 15,
    color: '#888',
    marginBottom: 16,
  },
  keywords: {
    fontSize: 24,
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'TimesNewRomanRegular',
  },
});

export default ConnectionProfile