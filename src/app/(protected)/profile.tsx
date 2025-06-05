import SharingCard from '@/src/components/common/SharingCard';
import EditProfileModal from '@/src/components/feature/Profile/EditProfileModal';
import { Theme } from '@/src/constants/color';
import { useAuth } from '@/src/context/AuthContext';
import { log } from '@/src/service/logger.service';
import { updateProfilePicture, updateUserProfile } from '@/src/service/profile.service';
import { useUserStore } from '@/src/store/userStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Burnt from "burnt";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
    const { user, logout } = useAuth();
    const { user: userProfile, setUser } = useUserStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

    const handleImageUpload = async (base64Image: string) => {
        if (!user?.id) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateProfilePicture(user.id, base64Image);

            if (result.success && result.url) {
                if (userProfile) {
                    console.log(';result.url', result.url);
                    setUser({ ...userProfile, profile_photo: result.url });
                }
                Burnt.toast({
                    title: "Profile Photo updated",
                    preset: "done",
                });
            } else {
                Burnt.toast({
                    title: "Failed to upload profile photo.",
                    preset: "error",
                });
            }
        } catch (error) {
            log('handleImageUpload', 'Image upload error:', error as string);
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

    const handleEditProfile = async (name: string, traits: string[]) => {
        if (!user?.id) {
            throw new Error('User not found');
        }

        try {
            const userData = {
                id: user.id,
                name: name,
                keyword_summary: traits
            };

            const response = await updateUserProfile(userData);

            if (!response.success) {
                throw new Error(response.error || 'Failed to update profile');
            }

            // Update local user state
            if (userProfile) {
                setUser({ 
                    ...userProfile, 
                    name: name,
                    keyword_summary: traits
                });
            }
        } catch (error) {
            log('handleEditProfile', 'Error updating profile:', error instanceof Error ? error.message : error as string);
            Burnt.toast({
                title: "Failed to update profile",
                preset: "error",
            });
            throw error;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={() => setIsEditModalVisible(true)}
                            disabled={isLoading}
                        >
                            <Feather name="edit-2" size={22} color={Theme.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}
                            onPress={logout}
                            disabled={isLoading}
                        >
                            <Ionicons name="log-out-outline" size={22} color={Theme.secondary} />
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
                    {(userProfile?.keyword_summary ?? []).map((keyword, i, arr) => (
                        <Text key={i} style={styles.infoText}>
                            {keyword} {i === arr.length - 1 ? '' : '| '}
                        </Text>
                    ))}
                </View>

                <View style={styles.sharingCardConatiner}>
                    <SharingCard />
                </View>
            </ScrollView>

            <EditProfileModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                onSave={handleEditProfile}
                initialName={userProfile?.name || ''}
                initialTraits={userProfile?.keyword_summary || ['', '', '']}
            />
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