import { Message } from '@/src/constants/types/chat.types';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type MessageItemProps = {
  message: Message;
  profile_pic: string;
};

const MessageItem: React.FC<MessageItemProps> = ({ message, profile_pic }) => {
  // Function to format message text with any links
  const formatMessageText = (text: string) => {
    // Simple regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[^\s]+)/g;
    
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part && urlRegex.test(part)) {
        return <Text key={index} style={styles.linkText}>{part}</Text>;
      }
      return part ? <Text key={index}>{part}</Text> : null;
    });
  };

  if (message.sender === 'user') {
    return (
      <View style={styles.sentMessageContainer}>
        <View style={styles.sentMessage}>
          <Text style={[styles.messageText, styles.sentMessageText]}>
            {formatMessageText(message.text)}
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.receivedMessageContainer}>
        {message.showAvatar ? (
          <Image
            source={{ uri: profile_pic }}
            style={styles.messageProfilePic}
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={message.showAvatar ? styles.receivedMessage : styles.receivedMessageNoAvatar}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  sentMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  receivedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sentMessage: {
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    maxWidth: '70%',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessage: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    maxWidth: '70%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
  },
  receivedMessageNoAvatar: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    maxWidth: '70%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 50, // Align with messages that have avatar
  },
  messageText: {
    fontSize: 16,
  },
  sentStatus: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  messageProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    marginRight: 5,
    opacity: 0, // Invisible but takes up space
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#3B82F6',
  },
});

export default MessageItem;