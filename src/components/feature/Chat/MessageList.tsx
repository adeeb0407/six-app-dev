import { Message } from '@/src/constants/types/chat.types';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MessageItem from './MessageItem';

type MessageListProps = {
  messages: Message[];
  profile_pic: string;
};

const MessageList: React.FC<MessageListProps> = ({ messages, profile_pic }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer} 
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message} 
            profile_pic={profile_pic} 
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up available space
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 15,
    paddingBottom: 20,
  },
});

export default MessageList;