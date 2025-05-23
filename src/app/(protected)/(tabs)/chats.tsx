import HeaderText from '@/src/components/common/HeaderText';
import ChatMessageCard from '@/src/components/feature/Chat/ChatMessageCard';
import ConnectionRequestNotification from '@/src/components/feature/ConnectionRequest/ConnectionRequestNotification';
import FlexiblePostComponent from '@/src/components/feature/Post/PostModal';
import { UserChat } from '@/src/constants/types/message.types';
import { supabase } from '@/src/db/supabase';
import { log } from '@/src/service/logger.service';
import { fetchUserChats } from '@/src/service/message.services';
import { usePostModalStore } from '@/src/store/postModalStore';
import { useUserStore } from '@/src/store/userStore';
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatsListScreen = () => {
  const { user } = useUserStore();
  const [chats, setChats] = useState<UserChat[]>([]);
  const [loading, setLoading] = useState(true);
  const { showPostModal } = useLocalSearchParams<{ showPostModal?: string }>();
  const { isChatPostModalVisible, setChatPostModalVisible } = usePostModalStore();
  const supabaseChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (showPostModal)
      setChatPostModalVisible(true);
  }, [showPostModal]);

  useEffect(() => {
    loadChats();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    supabaseChannel.current = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new;

          // Check if this chat involves current user
          const { data: chat } = await supabase
            .from('chats')
            .select('*')
            .eq('chat_id', newMessage.chat_id)
            .single();

          if (chat && (chat.user1 === user.id || chat.user2 === user.id)) {
            loadChats();
          }
        }
      )
      .subscribe((status) => {
      });

    // Cleanup subscription
    return () => {
      if (supabaseChannel.current) {
        supabase.removeChannel(supabaseChannel.current);
      }
    };
  }, [user?.id]);

  const loadChats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetchUserChats(user.id);

      if (response.success) {
        setChats(response.data);
      } else {
        log('loadChats', 'Failed to load chats:', response.error);
      }
    } catch (error) {
      log('loadChats', 'Error loading chats:', error as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <HeaderText title="Chats" />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {isChatPostModalVisible && (
        <FlexiblePostComponent
          isModal={true}
          visible={isChatPostModalVisible}
          onClose={() => setChatPostModalVisible(false)}
        />
      )}

      {/* Messages List */}
      <ScrollView style={styles.messagesContainer}>

        <ConnectionRequestNotification/>


        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySubText}>Start a conversation to connect!</Text>
          </View>
        ) : (
          chats.map(chat => (
            <ChatMessageCard
              key={chat.chat_id}
              message={{
                id: chat.chat_id,
                name: chat.other_user_name,
                profile_photo: chat.other_user_profile_photo || 'https://picsum.photos/200',
                message: chat.last_message,
                timestamp: new Date(chat.last_message_at),
                isOwnMessage: chat.last_message_sender === user?.id
              }}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 42,
    fontFamily: 'TimesNewRomanBold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    fontFamily: 'Regular'
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    marginRight: 10,
  },
  tabButtonText: {
    color: '#000',
  },
  tabButtonActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tabButtonActiveText: {
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  verificationBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#bc00ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  navButtonIcon: {
    fontSize: 24,
  },
  navButtonActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  hexagonContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagon: {
    width: 24,
    height: 24,
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'TimesNewRomanRegular',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },

});

export default ChatsListScreen;
