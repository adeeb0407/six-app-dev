import SharingCard from '@/src/components/common/SharingCard';
import { Theme } from '@/src/constants/color';
import { useAuth } from '@/src/context/AuthContext';
import { updateProfilePicture } from '@/src/service/profile.service';
import { useUserStore } from '@/src/store/userStore';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
    const { user } = useAuth();
    const { user: userProfile, setUser } = useUserStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleImageUpload = async (base64Image: string) => {
        if (!user?.id) {
            Alert.alert('Error', 'You must be logged in to upload a profile picture');
            return;
        }

        setIsLoading(true);
        try {
            // Generate a unique filename using timestamp
            const fileName = `profile-${Date.now()}.jpeg`;
            
            // Upload the image to Supabase
            const result = await updateProfilePicture(user.id, base64Image, fileName);
            
            if (result.success && result.url) {
                // Update local state with new profile image
                if (userProfile) {
                    setUser({ ...userProfile, profile_photo: result.url });
                }
                Alert.alert('Success', 'Profile picture updated successfully');
            } else {
                Alert.alert('Error', result.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [4, 4],
            quality: 0.7, 
            base64: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            await handleImageUpload(base64Image);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity style={styles.iconButton}
                            onPress={pickImage}
                            disabled={isLoading}
                        >
                            <Feather name="edit-2" size={22} color={Theme.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.profileImageContainer}
                    onPress={pickImage}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={styles.uploadContainer}>
                            <ActivityIndicator size="large" color={Theme.primary} />
                            <Text style={styles.uploadText}>Uploading...</Text>
                        </View>
                    ) : userProfile?.profile_photo ? (
                        <Image
                            source={{ uri: userProfile.profile_photo }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={styles.uploadContainer}>
                            <Feather name="upload" size={50} color="#666" />
                            <Text style={styles.uploadText}>Upload Profile Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{userProfile?.name}</Text>
                </View>

                <View style={styles.infoContainer}>
                    {userProfile?.keyword_summary?.map((keyword, i) => (
                        <Text key={i} style={styles.infoText}>
                            {keyword} {i === userProfile.keyword_summary.length - 1 ? '' : '|'} 
                        </Text>
                    ))}
                </View>

                <View style={styles.sharingCardConatiner}>
                    <SharingCard />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 38,
        fontFamily: 'TimesNewRomanBold',
    },
    headerButtons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 15,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginTop: 50,
        width: 350,
        height: 350,
        alignSelf: 'center',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    uploadContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    uploadText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        fontFamily: 'TimesNewRomanRegular',
    },
    nameContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    nameText: {
        fontSize: 28,
        fontFamily: 'TimesNewRomanBoldItalic',
    },
    infoContainer: {
        justifyContent: 'center',
        marginTop: 10,
        flexDirection: 'row'
    },
    infoText: {
        fontSize: 20,
        fontWeight: '400'
    },
    sharingCardConatiner: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 50,
    },
});

export default Profile;