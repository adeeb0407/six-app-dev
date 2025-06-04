import HeaderText from '@/src/components/common/HeaderText';
import { createChatRequest } from '@/src/service/chat.service';
import { log } from '@/src/service/logger.service';
import { deleteReaction } from '@/src/service/request.service';
import { useConnectionRequestStore } from '@/src/store/connectionRequest';
import { useUserStore } from '@/src/store/userStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RequestScreen = () => {
  const router = useRouter();
  const { requests, setRequests } = useConnectionRequestStore();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);

  const handleAcceptRequest = async (requestUserId: string, requestId: string, postId: string) => {
    setLoading(true);
    try {
      if (user) {
        const response = await createChatRequest(user.id, requestUserId, postId, requestId);
        if (response.success) {
          setRequests(requests.filter(r => r.id !== requestId));
          router.navigate('/(protected)/(tabs)/chats')
        }
      }
    } catch (error) {
      log('handleAcceptRequest', 'Error accepting request:', error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setLoading(true);
    try {
      // Delete from backend
      const response = await deleteReaction(requestId);
      if (response.success) {
        // Remove from local store
        setRequests(requests.filter(r => r.id !== requestId));
        router.navigate('/(protected)/(tabs)/chats');
      }
    } catch (error) {
      log('handleDeclineRequest', 'Error declining request:', error as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <HeaderText title="Six" />
      </View>

      <ScrollView style={styles.content}>
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>AI</Text>
            </View>
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        ) : (
          requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>
                  Your {request.degree}° connection with {request.mutuals} mutuals showed interest in 
                </Text>
                <Text style={styles.postContent} numberOfLines={2}>
                  Post: {request.posts.content}
                </Text>
              </View>

              {!loading ? (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDeclineRequest(request.id)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(request.reactor_id, request.id, request.posts.id)}
                  >
                    <Ionicons name="checkmark" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <ActivityIndicator style={styles.actions} />
              )}
            </View>
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
    paddingTop: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  requestCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'TimesNewRomanBold',
  },
  messageInfo: {
    flex: 1,
  },
  aiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'TimesNewRomanBold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'TimesNewRomanRegular',
  },
  messageBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'TimesNewRomanBold',
    marginBottom: 4,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#8B5CF6',
  },
  declineButton: {
    backgroundColor: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'TimesNewRomanRegular',
  },
});

export default RequestScreen;