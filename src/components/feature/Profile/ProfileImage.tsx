import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ProfileImageProps {
  imageUrl?: string | null;
  name?: string;
  size?: number;
  borderRadius?: number;
}
  
const ProfileImage: React.FC<ProfileImageProps> = ({ 
  imageUrl, 
  name = '', 
  size = 40,
  borderRadius = 100
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };  

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: borderRadius }]}
      />
    );
  }

  return (
    <View style={[styles.initialsContainer, { 
      width: size, 
      height: size, 
      borderRadius: borderRadius,
      backgroundColor: '#9191ff'
    }]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#f5f5f5',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontFamily: 'TimesNewRomanBold',
  },
});

export default ProfileImage;