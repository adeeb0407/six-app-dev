import { Theme } from '@/src/constants/color';
import { Feather, Octicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileDetails from '../components/feature/Profile/ProfileDetails';

const Profile = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Feather name="refresh-cw" size={22} color={Theme.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Feather name="edit-2" size={22} color={Theme.secondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.profileImageContainer}>
                <Image
                    source={require('../assets/images/pfp.jpg')}
                    style={styles.profileImage}
                />
            </View>

            <View style={styles.nameContainer}>
                <Text style={styles.nameText}>Lilly Rose, 21</Text>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>LSE | Football | Singing</Text>
            </View>

            <ProfileDetails />

            <View style={styles.inviteContainer}>
                <View style={styles.inviteContent}>
                    <View style={styles.inviteIconContainer}>
                        <Octicons name="person-add" size={24} color="#9191ff" />
                    </View>
                    <View style={styles.inviteTextContainer}>
                        <Text style={styles.inviteTitle}>Invite your contacts</Text>
                        <Text style={styles.inviteSubtitle}>Help your network grow on Six</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
            </View>
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
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 200,
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
        alignItems: 'center',
        marginTop: 10,
    },
    infoText: {
        fontSize: 20,
        fontWeight: '400'
    },
    inviteContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginHorizontal: 20,
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    inviteContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inviteIconContainer: {
        marginRight: 15,
    },
    inviteTextContainer: {
        maxWidth: 200,
        flexDirection: 'column',
    },
    inviteTitle: {
        fontSize: 18,
        fontFamily: 'TimesNewRomanRegular',
    },
    inviteSubtitle: {
        fontSize: 14,
        color: '#888',
        flexWrap: 'wrap',
        lineHeight: 18,
    },
    shareButton: {
        backgroundColor: '#9191ff',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

export default Profile;