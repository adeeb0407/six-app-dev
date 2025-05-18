import SharingCard from '@/src/components/common/SharingCard';
import { Theme } from '@/src/constants/color';
import { useAuth } from '@/src/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileDetails from '../../components/feature/Profile/ProfileDetails';

const Profile = () => {
    const {logout} = useAuth();
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Feather name="refresh-cw" size={22} color={Theme.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={logout}>
                            <Feather name="edit-2" size={22} color={Theme.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.profileImageContainer}>
                    <Image
                        source={require('@/src/assets/images/pfp.jpg')}
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
                <View style={styles.sharingCardConatiner}>
                    <SharingCard/>
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
    },
    profileImage: {
        width: 350,
        height: 350,
        borderRadius: 50,
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
    sharingCardConatiner: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 50,
    },
});

export default Profile;