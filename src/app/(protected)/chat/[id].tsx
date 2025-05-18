import ChatHeader from '@/src/components/feature/Chat/ChatHeader';
import ChatTabs from '@/src/components/feature/Chat/ChatTabs';
import MessageInput from '@/src/components/feature/Chat/MessageInput';
import MessageList from '@/src/components/feature/Chat/MessageList';
import { Contact, Message } from '@/src/constants/types/chat';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Demo data
const DEMO_CONTACT: Contact = {
  id: '1',
  name: 'Manaas',
  avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
  connectionDegree: '1st° connection'
};

const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'yes',
    sender: 'user',
    timestamp: new Date('2025-05-18T10:24:00'),
    status: 'read'
  },
  {
    id: '2',
    text: 'u and the friend ur w should join sixsocialapp.com',
    sender: 'user',
    timestamp: new Date('2025-05-18T10:24:30'),
    status: 'read'
  },
  // Add more demo messages here
  {
    id: '3',
    text: 'thoughts',
    sender: 'user',
    timestamp: new Date('2025-05-18T10:25:00'),
    status: 'read'
  },
  {
    id: '4',
    text: 'Are you trying to sell me something?',
    sender: 'contact',
    timestamp: new Date('2025-05-18T10:26:00'),
    showAvatar: true
  }
];

const ChatScreen: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [contact] = useState<Contact>(DEMO_CONTACT);
  const [activeTab, setActiveTab] = useState<'chat' | 'profile'>('chat');

  // Process messages to determine which ones should show avatars
  useEffect(() => {
    const processedMessages = [...messages];
    
    // Go through messages and mark which ones should show avatars
    // We only show avatar when it's the first message in a sequence from the contact
    let prevSender: 'user' | 'contact' | null = null;
    
    processedMessages.forEach((message) => {
      if (message.sender === 'contact') {
        if (prevSender !== 'contact' || message.showAvatar === true) {
          message.showAvatar = true;
        } else {
          message.showAvatar = false;
        }
      }
      prevSender = message.sender;
    });
    
    setMessages(processedMessages);
  }, []);

  const handleSend = (messageText: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages([...messages, newMsg]);
    
    // Simulate a reply after 1-2 seconds
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Got your message! This is a simulated response.',
        sender: 'contact',
        timestamp: new Date(),
        showAvatar: true
      };
      
      setMessages(prev => [...prev, reply]);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ChatHeader contact={contact} />

      {/* Navigation Tabs */}
      <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Chat Messages and Input */}
      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          <MessageList messages={messages} contact={contact} />
          <MessageInput onSend={handleSend} />
        </View>
      )}
      
      {activeTab === 'profile' && (
        // Profile content would go here
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
  }
});

export default ChatScreen;