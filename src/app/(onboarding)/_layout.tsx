import RotatingLogo from '@/src/components/common/RotatingLogo';
import { Slot } from 'expo-router'; // or use `children` if not using Expo Router
import React from 'react';
import { StyleSheet, View } from 'react-native';

const OnboardingLayout = () => {
  return (
    <View style={styles.container}>
      <RotatingLogo />
      <Slot />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
});

export default OnboardingLayout;
