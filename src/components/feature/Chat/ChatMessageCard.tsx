import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConnectionModal from '../../common/ConnectionModal';
import ProfileImage from '../Profile/ProfileImage';

const { width, height } = Dimensions.get('window');

interface MessageType {
    id: string;
    sender_id: string;
    name: string;
    profile_photo?: string;
    message: string;
    timestamp: Date;
    isOwnMessage?: boolean;
    other_user_id?: string;
    keyword_summary?: string[];
}

interface ChatMessageCardProps {
    message: MessageType;
    onRemoveConnection?: (chatId: string, chatUserId: string) => void;
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

const ChatMessageCard: React.FC<ChatMessageCardProps> = ({ message, onRemoveConnection }) => {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef<any>(null);

    const handleLongPress = () => {
        if (cardRef.current) {
            cardRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
                const modalWidth = 200; 
                const modalHeight = 60; 
                const screenWidth = Dimensions.get('window').width;
                const screenHeight = Dimensions.get('window').height;
                
                let modalX = x + width - modalWidth - 10;
                if (modalX < 20) {
                    modalX = x + 20;
                }
                
                if (modalX + modalWidth > screenWidth - 20) {
                    modalX = screenWidth - modalWidth - 20;
                }
                
                let modalY = y + (height / 2) + 10;
                
                if (modalY + modalHeight > screenHeight - 100) {
                    modalY = y - modalHeight - 10;
                }
                
                if (modalY < 50) {
                    modalY = y + height + 5; 
                }
                
                setModalPosition({ x: modalX, y: modalY });
                setModalVisible(true);
            });
        }
    };

    const handleRemoveConnection = () => {
        if (onRemoveConnection) {
            onRemoveConnection(message.id, message.sender_id);
        }
    };

    console.log(message)

    return (
        <>
            <TouchableOpacity
                ref={cardRef}
                style={styles.messageCard}
                onPress={() => router.push({
                    pathname: '/chat/[id]',
                    params: {
                        id: message.id,
                        name: message.name,
                        profile_photo: message.profile_photo,
                        sender_id: message.sender_id,
                        keyword_summary: message.keyword_summary
                    }
                })}
                onLongPress={handleLongPress}
                delayLongPress={500}
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

            <ConnectionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onRemoveConnection={handleRemoveConnection}
                position={modalPosition}
                userName={message.name}
            />
        </>
    );
};

const styles = StyleSheet.create({
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16, // Added horizontal padding for better touch area
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