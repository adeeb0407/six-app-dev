import HeaderText from '@/src/components/common/HeaderText';
import ChatMessageCard from '@/src/components/feature/Chat/ChatMessageCard';
import { RequestType } from '@/src/components/feature/Chat/RequestMessageCard';
import FlexiblePostComponent from '@/src/components/feature/Post/PostModal';
import { UserChat } from '@/src/constants/types/message.types';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/db/supabase';
import { fetchUserChats } from '@/src/service/message.services';
import { fetchPostRequests } from '@/src/service/request.service';
import { usePostModalStore } from '@/src/store/postModalStore';
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatsListScreen = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<UserChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [hasUnreadRequests, setHasUnreadRequests] = useState(false);
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
    checkForRequests();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up chat subscription for user:', user.id);

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
          console.log('New message received:', payload);
          const newMessage = payload.new;

          // Check if this chat involves current user
          const { data: chat } = await supabase
            .from('chats')
            .select('*')
            .eq('chat_id', newMessage.chat_id)
            .single();

          if (chat && (chat.user1 === user.id || chat.user2 === user.id)) {
            console.log('Updating chat list with new message');
            // Reload chats to get latest
            loadChats();
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup subscription
    return () => {
      console.log('Cleaning up chat subscription');
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
        console.log('Chats loaded:', response.data.length);
      } else {
        console.error('Failed to load chats:', response.error);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForRequests = async () => {
    if (!user?.id) return;

    try {
      const response = await fetchPostRequests(user.id);
      if (response.success && response.data.length > 0) {
        setHasUnreadRequests(true);
      }
    } catch (error) {
      console.error('Error checking requests:', error);
    }
  };

  const handleNotificationPress = async () => {
    if (!user?.id) return;

    try {
      setRequestsLoading(true);
      const response = await fetchPostRequests(user.id);

      if (response.success) {
        setRequests(response.data);
        setHasUnreadRequests(false);
        // router.push('/(protected)/requests');
      } else {
        console.error('Failed to load requests:', response.error);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleAccept = (requestId: string) => {
    console.log('Accepted request:', requestId);
  };

  const handleReject = (requestId: string) => {
    console.log('Rejected request:', requestId);
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
        {true && (
          <TouchableOpacity 
            style={styles.sixNotification}
            onPress={handleNotificationPress}
            disabled={requestsLoading}
          >
            <View style={styles.sixNotificationContent}>
              <Image 
                source={require('@/src/assets/images/icon.png')}
                style={styles.sixAvatar}
              />
              <View style={styles.sixMessageContainer}>
                <Text style={styles.sixName}>Six</Text>
                <Text style={styles.sixMessage}>
                  Hey! You have new connection requests waiting for you
                </Text>
              </View>
              {requestsLoading && (
                <ActivityIndicator size="small" color="#666" style={styles.loadingIndicator} />
              )}
            </View>
          </TouchableOpacity>
        )}

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
  sixNotification: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginHorizontal: 1,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sixNotificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sixAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sixMessageContainer: {
    flex: 1,
  },
  sixName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'TimesNewRomanBold',
  },
  sixMessage: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'TimesNewRomanRegular',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
});

export default ChatsListScreen;
