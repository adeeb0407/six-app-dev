import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types for our chat data
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  showAvatar?: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  connectionDegree: string;
}

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
  },
  {
    id: '5',
    text: 'my startup lol sign up!!',
    sender: 'user',
    timestamp: new Date('2025-05-18T10:27:00'),
    status: 'sent'
  },
  {
    id: '6',
    text: 'Definitely not lol',
    sender: 'contact',
    timestamp: new Date('2025-05-18T10:28:00')
  },
  {
    id: '7',
    text: "I'm here to find dates not to help you raise money",
    sender: 'contact',
    timestamp: new Date('2025-05-18T10:29:00'),
    showAvatar: true
  },
  {
    id: '8',
    text: '"Just when dating in New York couldn\'t get worse"',
    sender: 'contact',
    timestamp: new Date('2025-05-18T10:30:00')
  },
  {
    id: '9',
    text: 'Put that in your pitch deck',
    sender: 'contact',
    timestamp: new Date('2025-05-18T10:31:00'),
    showAvatar: true
  },
  {
    id: '10',
    text: 'Do they wash the melons?',
    sender: 'contact',
    timestamp: new Date('2025-05-18T10:32:00'),
    showAvatar: true
  }
];

const ChatScreen: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [newMessage, setNewMessage] = useState<string>('');
  const [contact] = useState<Contact>(DEMO_CONTACT);
  const scrollViewRef = useRef<ScrollView>(null);

  // Process messages to determine which ones should show avatars
  useEffect(() => {
    const processedMessages = [...messages];
    
    // Go through messages and mark which ones should show avatars
    // We only show avatar when it's the first message in a sequence from the contact
    let prevSender: 'user' | 'contact' | null = null;
    
    processedMessages.forEach((message, index) => {
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

  // Scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
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

  // Function to format message text with any links
  const formatMessageText = (text: string) => {
    // Simple regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[^\s]+)/g;
    
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part && urlRegex.test(part)) {
        return <Text key={index} style={styles.linkText}>{part}</Text>;
      }
      return part ? <Text key={index}>{part}</Text> : null;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Image
          source={{ uri: contact.avatar }}
          style={styles.profileImage}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerName}>{contact.name}</Text>
          <Text style={styles.connectionText}>{contact.connectionDegree}</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>Chat</Text>
          <View style={styles.activeTabIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer} 
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((message, index) => (
            message.sender === 'user' ? (
              // User sent message
              <View key={message.id} style={styles.sentMessageContainer}>
                <View style={styles.sentMessage}>
                  <Text style={[styles.messageText, styles.sentMessageText]}>
                    {formatMessageText(message.text)}
                  </Text>
                </View>
                {message.status === 'sent' && (
                  <Text style={styles.sentStatus}>Sent</Text>
                )}
              </View>
            ) : (
              // Contact sent message
              <View key={message.id} style={styles.receivedMessageContainer}>
                {message.showAvatar ? (
                  <Image
                    source={{ uri: contact.avatar }}
                    style={styles.messageProfilePic}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
                <View style={message.showAvatar ? styles.receivedMessage : styles.receivedMessageNoAvatar}>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              </View>
            )
          ))}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#A0A0A0"
            multiline
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Feather name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 20,
    fontFamily: 'TimesNewRomanBold',
  },
  connectionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    justifyContent: 'space-between',
  },
  activeTab: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    position: 'relative',
    width: '50%',
  },
  inactiveTab: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '50%',
  },
  activeTabText: {
    color: '#7C3AED',
    fontSize: 16,
    textAlign:'center'
  },
  inactiveTabText: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign:'center'
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#7C3AED',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 15,
    paddingBottom: 20,
  },
  sentMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  receivedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sentMessage: {
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    maxWidth: '70%',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessage: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    maxWidth: '70%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
  },
  receivedMessageNoAvatar: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    maxWidth: '70%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 50, // Align with messages that have avatar
  },
  messageText: {
    fontSize: 16,
  },
  sentStatus: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  messageProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    marginRight: 5,
    opacity: 0, // Invisible but takes up space
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#3B82F6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontFamily: 'TimesNewRomanRegular',
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});

export default ChatScreen;