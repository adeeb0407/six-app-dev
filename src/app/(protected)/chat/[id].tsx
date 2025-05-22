import ChatHeader from '@/src/components/feature/Chat/ChatHeader';
import ChatTabs from '@/src/components/feature/Chat/ChatTabs';
import MessageInput from '@/src/components/feature/Chat/MessageInput';
import MessageList from '@/src/components/feature/Chat/MessageList';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/db/supabase';
import { fetchChatMessages, sendMessage } from '@/src/service/message.services';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: Date;
  showAvatar: boolean;
}

const ChatScreen: React.FC = () => {
  const { 
    id: chatId,
    name,
    profile_photo,
    connectionType 
  } = useLocalSearchParams<{ 
    id: string;
    name: string;
    profile_photo: string;
    connectionType: string;
  }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'profile'>('chat');
  const supabaseChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [chatId, user?.id]);

  useEffect(() => {
    if (!chatId) return;

    console.log('Setting up subscription for chat:', chatId);

    supabaseChannel.current = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {  
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}` 
        },
        (payload) => {
          console.log('Received new message:', payload);
          const newMessage = payload.new as ChatMessage;

          console.log('Current user:', user?.id);
          console.log('Message sender:', newMessage.sender_id);

          if (newMessage.sender_id !== user?.id) {
            // Only handling messages from others, not our own
            const mappedMessage: Message = { 
              id: newMessage.id,
              text: newMessage.content,
              sender: 'contact',
              timestamp: new Date(newMessage.created_at),
              showAvatar: true
            };
            setMessages(prev => [...prev, mappedMessage]);
          } else {
            console.log('Skipping own message');
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      if (supabaseChannel.current) {
        supabase.removeChannel(supabaseChannel.current);
      }
    };
  }, [chatId, user?.id]);

  const loadMessages = async () => {
    if (!chatId) return;

    try {
      console.log('Loading messages for chat:', chatId);
      setLoading(true);
      const response = await fetchChatMessages(chatId);

      console.log('Messages response:', response);

      if (response.success) {
        const mappedMessages: Message[] = response.data.map((msg: ChatMessage) => {
          console.log('Processing message:', msg.id);
          return {
            id: msg.id,
            text: msg.content,
            sender: msg.sender_id === user?.id ? 'user' : 'contact',
            timestamp: new Date(msg.created_at),
            showAvatar: msg.sender_id !== user?.id
          };
        });

        console.log('Total messages mapped:', mappedMessages.length);
        setMessages(mappedMessages);
      } else {
        console.error('Failed to load messages:', response.error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (messageText: string) => {
    if (!user?.id || !chatId) return;

    try {
      const response = await sendMessage(user.id, chatId, messageText);
      console.log('Send message response:', response);

      if (response.success) {
        const myMsg: Message = {
          id: Date.now().toString(), // temporary ID
          text: messageText,
          sender: 'user',
          timestamp: new Date(),
          showAvatar: false
        };
        setMessages(prev => [...prev, myMsg]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader contact={{id: chatId, name, profile_photo}} />
      <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading messages...</Text>
            </View>
          ) : (
            <>
              <MessageList messages={messages} profile_photo={profile_photo} />
              <MessageInput onSend={handleSend} />
            </>
          )}
        </View>
      )}

      {activeTab === 'profile' && (
        <View style={styles.profileContainer} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  profileContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;