import ChatMessageCard from '@/src/components/feature/Chat/ChatMessageCard';
import FlexiblePostComponent from '@/src/components/feature/Post/PostModal';
import { MessageType } from '@/src/constants/types/chat';
import { usePostModalStore } from '@/src/store/postModalStore';
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



const ChatsScreen = () => {
  const { showPostModal } = useLocalSearchParams<{ showPostModal?: string }>();
  const { isChatPostModalVisible, setChatPostModalVisible } = usePostModalStore();

  useEffect(() => {
    if (showPostModal)
      setChatPostModalVisible(true);
  }, [showPostModal]);

  const messages: MessageType[] = [
    {
      id: '1',
      name: 'Peter',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      message: 'Chat over text?',
    },
    {
      id: '2',
      name: 'Mike',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      message: 'Are you sure?',
    },
    {
      id: '3',
      name: 'Rahul',
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
      message: `Let's do drinks June 3rd at 7!`,
    },
    {
      id: '4',
      name: 'Javi',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      message: 'Do I double text again 🙄',
      hasDuplicate: true,
    },
    {
      id: '5',
      name: 'Javi',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      message: 'Do I double text again 🙄',
    },
    {
      id: '6',
      name: 'Cole',
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
      message: 'Ugh I am failing to answer your question...',
    },
    {
      id: '7',
      name: 'Neil',
      avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
      message: '',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mutuals</Text>
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

      {/* Message Tabs */}
      {/* <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabButtonText}>Direct Messages</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={['#ff66c4', '#5170ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tabButtonActive}
        >
          <Text style={styles.tabButtonActiveText}>Group Chats</Text>
        </LinearGradient>
      </View> */}

      {
        isChatPostModalVisible &&
        <FlexiblePostComponent
          isModal={true}
          visible={isChatPostModalVisible}
          onClose={() => setChatPostModalVisible(false)}
          onPost={() => { }}
        />

      }

      {/* Messages List */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map(message => (
         <ChatMessageCard key={message.id} message={message} />
        ))}
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
  }
});

export default ChatsScreen;
