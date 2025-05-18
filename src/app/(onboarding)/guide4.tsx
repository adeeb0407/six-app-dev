import NextButton from '@/src/components/common/NextButton';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Guide2 = () => {
  const router = useRouter();
  const {login} = useAuth();

  const handleNext = () => {
    login({id: '1'})
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Tap “Interested”
        </Text>
        <View style={styles.degreesContainer}>
          <Text style={styles.degreeItem}>
            If you are both interested, both names unlock and a chat opens.
          </Text>
        </View>
      </View>

      <NextButton
        onPress={handleNext}
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
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#000',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 34,
  },
  degreesContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  degreeItem: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    lineHeight: 24,
  },
  degreeHighlight: {
    color: '#9191ff',
    fontWeight: '600',
  }
});

export default Guide2;