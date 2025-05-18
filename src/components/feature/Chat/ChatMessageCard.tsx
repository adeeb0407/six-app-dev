import { MessageType } from '@/src/constants/types/chat'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type ChatMessageCardProp = {
    message: MessageType
}

const ChatMessageCard = ({ message }: ChatMessageCardProp) => {
    const router = useRouter();

    return (
        <TouchableOpacity key={message.id} style={styles.messageCard}
            onPress={() => router.push('/chat/123')}
        >
            <Image source={{ uri: message.avatar }} style={styles.avatar} />
            <View style={styles.messageContent}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{message.name}</Text>
                </View>
                <Text style={styles.messageText} numberOfLines={1}>
                    {message.message}
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
        color: '#999',
        marginTop: 3,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

})

export default ChatMessageCard