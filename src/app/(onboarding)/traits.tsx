import NextButton from '@/src/components/common/NextButton';
import { useAuth } from '@/src/context/AuthContext';
import { updateUserProfile } from '@/src/service/user.service';
import { useUserOnboardingStore } from '@/src/store/userOnboardingStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

const MAX_CHARS = 30; // Maximum characters per trait

const Traits = () => {
  const router = useRouter();
  const {user} = useAuth();
  const setTraits = useUserOnboardingStore(state => state.setTraits);
  const name = useUserOnboardingStore(state => state.name)
  const [traits, setTraitsLocal] = useState(['', '', '']);
  const fadeAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    // Stagger animation for each input
    fadeAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleTraitChange = (text: string, index: number) => {
    // Restrict input length
    if (text.length <= MAX_CHARS) {
      const newTraits = [...traits];
      newTraits[index] = text;
      setTraitsLocal(newTraits);
    }
  };

  const handleNext = async () => {
    try {
      setTraits(traits);

      if (user && user.id) {
        const userData = {
          id: user.id,
          name: name,
          keyword_summary: traits.map(trait => trait.trim()).filter(Boolean)
        };

        console.log('Updating user profile with data:', userData);
        const response = await updateUserProfile(userData);

        if (!response.success) {
          console.error('Failed to update profile:', response.error);
          // Optionally handle error in UI
          return;
        }

        console.log('Profile updated successfully:');
      } else {
        console.error('No user found in context, skipping profile update');
      }

      router.push('/share');
    } catch (error) {
      console.error('Error in handleNext:', error instanceof Error ? error.message : error);
      // Optionally handle error in UI
    }
  };

  // Updated validation - check if all three traits are filled
  const isValid = traits.every(trait => trait.trim().length > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell us about yourself</Text>
      <Text style={styles.subtitle}>Share three interesting things</Text>

      <View style={styles.inputsContainer}>
        {fadeAnims.map((fadeAnim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.inputContainer,
              { opacity: fadeAnim }
            ]}
          >
            <TextInput
              style={styles.input}
              value={traits[index]}
              onChangeText={(text) => handleTraitChange(text, index)}
              placeholder={`${demoDetails[index]}`}
              placeholderTextColor="#666"
              maxLength={MAX_CHARS}
            />
            <Text style={styles.charCount}>
              {traits[index].length}/{MAX_CHARS}
            </Text>
          </Animated.View>
        ))}
      </View>

      <NextButton 
        onPress={handleNext}
        disabled={!isValid}
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
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginTop: 40, 
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputsContainer: {
    maxHeight: 300, 
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#9191ff',
    paddingVertical: 12,
    paddingRight: 45, // Make space for character count
    color: '#000',
  },
  charCount: {
    position: 'absolute',
    right: 0,
    bottom: 15,
    fontSize: 12,
    color: '#666',
  },
});

const demoDetails = [
  `Uni / Work (NYU’24 econ)`,
  'Interests',
  'Free time'
];

export default Traits;