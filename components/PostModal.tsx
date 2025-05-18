import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  tab: 'General' | 'Meet' | 'Chat';
  defaultTab?: string;
}

const PostModal: React.FC<PostModalProps> = ({
  visible,
  onClose,
  tab
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePost = () => {
    // Handle post logic here
    setNoteText('');
    onClose();
  };

  const isPostButtonActive = noteText.trim().length > 0;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.tagIcon}>
                  <Feather name="tag" size={20} color="#666" />
                </View>
                
                
                <View style={styles.connectionCounter}>
                  <Feather name="users" size={18} color="#666" />
                  <Text style={styles.connectionCounterText}>1st</Text>
                </View>
                
                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Feather name="x" size={22} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Note input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your note..."
                  placeholderTextColor="#A0A0A0"
                  multiline
                  value={noteText}
                  onChangeText={setNoteText}
                />
              </View>

              {/* Bottom section */}
              <View style={styles.bottomSection}>
                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.option}>
                    <Text style={styles.optionText}>All connections</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.suggestionButton}>
                    <Feather name="zap" size={18} color="#666" />
                    <Text style={styles.suggestionText}>Suggestion</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.postButton, isPostButtonActive ? styles.postButtonActive : {}]}
                  onPress={handlePost}
                  disabled={!isPostButtonActive}
                >
                  <Text style={[styles.postButtonText, isPostButtonActive ? styles.postButtonTextActive : {}]}>
                    Post
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Scrollable tabs component
interface ScrollableTabsProps {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const ScrollableTabs: React.FC<ScrollableTabsProps> = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab ? styles.activeTab : {}
          ]}
          onPress={() => onTabPress(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab ? styles.activeTabText : {}
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    maxHeight: '80%',
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  tagIcon: {
    marginRight: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  connectionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  connectionCounterText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    padding: 8,
    minHeight: 120,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  bottomSection: {
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: '#666',
    fontSize: 14,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  postButton: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  postButtonText: {
    color: '#A0A0A0',
    fontWeight: '500',
  },
  postButtonTextActive: {
    color: 'white',
  },
});

export default PostModal;