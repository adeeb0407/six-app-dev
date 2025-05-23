import HeaderText from '@/src/components/common/HeaderText';
import { createChat } from '@/src/service/chat.service';
import { log } from '@/src/service/logger.service';
import { deleteReaction } from '@/src/service/request.service';
import { useConnectionRequestStore } from '@/src/store/connectionRequest';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
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

  const handleAcceptRequest = async (requestUserId: string, requestId: string) => {
    setLoading(true);
    try {
      if (user) {
        const response = await createChat(user.id, requestUserId);
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
        <HeaderText title="Requests" />
      </View>

      <ScrollView style={styles.content}>
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        ) : (
          requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.userInfo}>
                <View style={styles.textContainer}>
                  <Text style={styles.name}>{request.users.name}</Text>
                  <Text style={styles.postContent} numberOfLines={2}>
                    Interested in: {request.posts.content}
                  </Text>
                </View>
              </View>


              {!loading ?
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(request.users.id, request.id)}
                  >
                    <Ionicons name="checkmark" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDeclineRequest(request.id)}
                  >
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                :
                <ActivityIndicator style={styles.actions} />
              }
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'TimesNewRomanBold',
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
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
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
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