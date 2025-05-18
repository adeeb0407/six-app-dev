import NextButton from '@/src/components/common/NextButton';
import SharingCard from '@/src/components/common/SharingCard';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Share = () => {
  const router = useRouter();

  const handleNext = () => {
    router.push('/guide1');  
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Almost There</Text>
          <Text style={styles.subtitle}>
            Refer six contacts to join
          </Text>
        </View>
        <SharingCard />
      </View>

      <NextButton
        onPress={handleNext}
        disabled={false}
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
});

export default Share;