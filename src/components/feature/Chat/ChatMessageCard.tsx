import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProfileImage from '../Profile/ProfileImage';

interface MessageType {
    id: string;
    name: string;
    profile_photo?: string;
    message: string;
    timestamp: Date;
    isOwnMessage?: boolean;
    other_user_id?: string;
}

const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
};

const ChatMessageCard = ({ message }: { message: MessageType }) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            key={message.id}
            style={styles.messageCard}
            onPress={() => router.push({
                pathname: '/chat/[id]',
                params: {
                    id: message.id,
                    name: message.name,
                    profile_photo: message.profile_photo,
                    connectionType: '3'
                }
            })}
        >
            <ProfileImage
                imageUrl={message.profile_photo}
                name={message.name || 'User'}
                size={60}
            />
            <View style={styles.messageContent}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{message.name}</Text>
                    <Text style={styles.timeText}>
                        {getTimeAgo(message.timestamp)}
                    </Text>
                </View>
                <Text style={styles.messageText} numberOfLines={1}>
                    {message.isOwnMessage ? 'You: ' : ''}{message.message}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    name: {
        fontSize: 18,
        fontWeight: '500',
        marginRight: 5,
    },
    messageContent: {
        flex: 1,
        marginLeft: 15,
    },
    messageText: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 'auto',
    },
});

export default ChatMessageCard;