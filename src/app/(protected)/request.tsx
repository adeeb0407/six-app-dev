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
      const response = await deleteReaction(requestId);
      if (response.success) {
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
          <Feather name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
        <HeaderText title="Six" />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
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
              
              {!loading && (
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
              )}
              
              {loading && (
                <ActivityIndicator 
                  style={styles.loadingIndicator}
                  color="#666"
                />
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
    backgroundColor: '#ffffff',
  },
  
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  backButton: {
    marginRight: 10,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: '#f5f5f5',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  
  scrollContent: {
    paddingBottom: 32,
  },
  
  requestCard: {
    marginVertical: 6,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  messageBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    lineHeight: 24,
    fontStyle: 'italic'
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  
  acceptButton: {
    backgroundColor: '#9191ff',
  },
  
  declineButton: {
    backgroundColor: '#f5f5f5',
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  
  loadingIndicator: {
    marginTop: 8,
    alignSelf: 'flex-end',
  }
});

export default RequestScreen;