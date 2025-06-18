import ChatHeader from '@/src/components/feature/Chat/ChatHeader';
import MessageInput from '@/src/components/feature/Chat/MessageInput';
import MessageList from '@/src/components/feature/Chat/MessageList';
import { Contact, Message } from '@/src/constants/types/chat.types';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/db/supabase';
import { logger } from '@/src/service/logger.service';
import { fetchChatMessages, markMessagesAsRead, sendMessage } from '@/src/service/message.services';
import { getConnectionDetails } from '@/src/service/neo4j.service';
import { useChatStore } from '@/src/store/chat.store';
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
    sender_id,
    keyword_summary
  } = useLocalSearchParams<{
    id: string;
    name: string;
    profile_photo: string;
    sender_id: string;
    keyword_summary: string[];
  }>();
  const { user } = useAuth();
  const { chats, setChats } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionDetails, setConnectionDetails] = useState<Contact>({
    id: '',
    name: '',
    profile_photo: '',
    sender_id: '',
    connectionDegree: '',
    mutualCount: 0,
    keyword_summary: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingConnectionDetails, setLoadingConnectionDetails] = useState(true);
  const supabaseChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (chatId) {
      loadMessages();
      loadConnectionDetails();
      if (user?.id) {
        markMessagesAsReadFunc(chatId, user.id);
      }
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

          if (newMessage.sender_id !== user?.id) {
            // Only handling messages from others, not our own
            const mappedMessage: Message = {
              id: newMessage.id,
              text: newMessage.content,
              sender: newMessage.sender_id === '81dde3f4-d5e5-4686-937c-745a81a21e9a' ? 'sixai' : 'contact',
              timestamp: new Date(newMessage.created_at),
            };
            setMessages(prev => [...prev, mappedMessage]);
            if (user?.id && newMessage.sender_id !== user.id) {
              markMessagesAsReadFunc(chatId, user.id);
            }
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
        logger.error('loadMessages', 'Failed to load messages:', response.error);
      }
    } catch (error) {
      logger.error('loadMessages', 'Error loading messages:', error as string);
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionDetails = async () => {
    if (user?.id) {
      try {
        setLoadingConnectionDetails(true);

        // Set initial contact data with what we have from params
        const initialContact: Contact = {
          id: sender_id,
          name: name || 'Unknown',
          profile_photo: profile_photo || '',
          sender_id: sender_id,
          connectionDegree: '',
          mutualCount: 0,
          keyword_summary: keyword_summary
        };
        setConnectionDetails(initialContact);

        const details = await getConnectionDetails(user.id, sender_id);

        // Update with complete contact object including connection details
        const contact: Contact = {
          id: sender_id,
          name: name || 'Unknown',
          profile_photo: profile_photo || '',
          sender_id: sender_id,
          connectionDegree: details?.connectionDegree ? `${details.connectionDegree}° connection` : 'connection',
          mutualCount: details?.mutualCount || 0,
          keyword_summary: keyword_summary
        };

        setConnectionDetails(contact);
      } catch (error) {
        logger.error('loadConnectionDetails', 'Error fetching connection details:', error as string);
      } finally {
        setLoadingConnectionDetails(false);
      }
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
      logger.error('ChatScreen: handleSend', 'Error sending message:', error as string);
    }
  };

  const markMessagesAsReadFunc = async (chatId: string, userId: string) => {
    if (!user?.id || !chatId) return;
    const response = await markMessagesAsRead(chatId, user.id);
    if (response.success) {
      logger.info('ChatScreen: markMessagesAsRead', 'Messages marked as read');
      setChats(chats.map(chat => chat.chat_id === chatId ? { ...chat, unread_count: 0 } : chat));
    } else {
      logger.error('ChatScreen: markMessagesAsRead', 'Error marking messages as read:', response.error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        contact={connectionDetails}
        isLoadingConnectionDetails={loadingConnectionDetails}
      />

      <View style={styles.chatContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading messages...</Text>
          </View>
        ) : (
          <>
            <MessageList messages={messages}
              contact={connectionDetails} />
            <MessageInput onSend={handleSend} />
          </>
        )}
      </View>

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