import ChatHeader from '@/src/components/feature/Chat/ChatHeader';
import MessageInput from '@/src/components/feature/Chat/MessageInput';
import MessageList from '@/src/components/feature/Chat/MessageList';
import { Message } from '@/src/constants/types/chat.types';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/db/supabase';
import { log } from '@/src/service/logger.service';
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

const ChatScreen: React.FC = () => {
  const {
    id: chatId,
    name,
    profile_photo,
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
          const newMessage = payload.new as ChatMessage;

          console.log('new message received:', newMessage);

          if (newMessage.sender_id !== user?.id) {
            // Only handling messages from others, not our own
            const mappedMessage: Message = {
              id: newMessage.id,
              text: newMessage.content,
              sender: newMessage.sender_id === '81dde3f4-d5e5-4686-937c-745a81a21e9a' ? 'sixai' : 'contact',
              timestamp: new Date(newMessage.created_at),
            };
            setMessages(prev => [...prev, mappedMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabaseChannel.current) {
        supabase.removeChannel(supabaseChannel.current);
      }
    };
  }, [chatId, user?.id]);

  const loadMessages = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const response = await fetchChatMessages(chatId);

      if (response.success) {
        const mappedMessages: Message[] = response.data.map((msg: ChatMessage) => {
          let sender: 'user' | 'contact' | 'sixai';

          if (msg.sender_id === '81dde3f4-d5e5-4686-937c-745a81a21e9a') {
            sender = 'sixai';
          } else if (msg.sender_id === user?.id) {
            sender = 'user';
          } else {
            sender = 'contact';
          }

          return {
            id: msg.id,
            text: msg.content,
            sender,
            sender_name: name,
            profile_photo: profile_photo,
            timestamp: new Date(msg.created_at),
          };
        });

        setMessages(mappedMessages);
      } else {
        log('loadMessages', 'Failed to load messages:', response.error);
      }
    } catch (error) {
      log('loadMessages', 'Error loading messages:', error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (messageText: string) => {
    if (!user?.id || !chatId) return;

    try {
      const response = await sendMessage(user.id, chatId, messageText);

      if (response.success) {
        const myMsg: Message = {
          id: Date.now().toString(), 
          text: messageText,
          sender: 'user',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, myMsg]);
      }
    } catch (error) {
      log('ChatScreen: handleSend', 'Error sending message:', error as string);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader contact={{ id: chatId, name, profile_photo }} />
      {/* <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} /> */}

      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading messages...</Text>
            </View>
          ) : (
            <>
              <MessageList messages={messages} />
              <MessageInput onSend={handleSend} />
            </>
          )}
        </View>
      )}

      {/* {activeTab === 'profile' && (
        <View style={styles.profileContainer}>
          
        </View>
      )} */}
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