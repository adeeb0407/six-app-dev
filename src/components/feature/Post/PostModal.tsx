import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { CategoryTabs } from '@/src/constants/types/categoryTabs';
import {
  ConnectionLevel,
  PostComponentProps,
  PostInput,
} from '@/src/constants/types/post.types.';
import { useAuth } from '@/src/context/AuthContext';
import { log } from '@/src/service/logger.service';
import { createPost } from '@/src/service/post.service';
import CategoryDropdown from './CategoryDropdown';
import ConnectionDropdown from './ConnectionDropdown';
enum PostConnectionVisibility {
  All = 'All connections',
  HideChat = 'Hide chat connections'
}

const FlexiblePostComponent: React.FC<PostComponentProps> = ({
  defaultTab = CategoryTabs.General,
  isModal = false,
  visible = true,
  onClose,
  setDidPost,
  defaultConnectionLevel = ConnectionLevel.First
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CategoryTabs>(defaultTab);
  const [connectionLevel, setConnectionLevel] = useState<ConnectionLevel>(defaultConnectionLevel);
  const [connectionVisibility, setConnectionVisibility] = useState<PostConnectionVisibility>(PostConnectionVisibility.All)
  const [noteText, setNoteText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isModal || !visible) return;
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim, isModal]);

  const handleTabPress = (tab: CategoryTabs) => {
    setActiveTab(tab);
  };

  const handleConnectionLevelChange = (level: ConnectionLevel) => {
    setConnectionLevel(level);
  };

  const handleToggleConnectionVisibility = () => {
    if (connectionVisibility === PostConnectionVisibility.All) {
      setConnectionVisibility(PostConnectionVisibility.HideChat);
    } else
      setConnectionVisibility(PostConnectionVisibility.All)
  }

  const handlePost = async () => {
    if (user) {
      const post: PostInput = {
        user_id: user.id,
        content: noteText,
        category: activeTab,
        connectiontype: connectionLevel,
        hide_from_chat: connectionVisibility === PostConnectionVisibility.All ? false : true
      }

      const data = await createPost(post);
      if (!data) log('handlePost', 'error creating post') 
      else log('handlePost', 'created post successfully')
      if (data && setDidPost && !isModal && onClose) {
        setDidPost(true);
        onClose();
      }

      setNoteText('');
      if (isModal && onClose) {
        onClose();
      }
    }
  };

  const isPostButtonActive = noteText.trim().length > 0;

  const renderContent = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.subHeader}>
          <View style={styles.tagIcon}>
            <Feather name="tag" size={20} color="#666" />
          </View>
          <CategoryDropdown
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </View>

        <View style={styles.subHeader}>
          <ConnectionDropdown
            activeConnectionLevel={connectionLevel}
            onConnectionLevelChange={handleConnectionLevelChange}
          />
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={22} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your note..."
            placeholderTextColor="#A0A0A0"
            multiline
            scrollEnabled={true}
            value={noteText}
            onChangeText={setNoteText}
          />
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.option}
            onPress={handleToggleConnectionVisibility}
          >
            <Text style={styles.optionText}>{connectionVisibility}</Text>
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
  );

  if (!isModal) {
    return (
      <View style={styles.container}>
        {renderContent()}
      </View>
    );
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { }}
          style={styles.centerModalContainer}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {renderContent()}
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>

  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerModalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    justifyContent: 'space-between'
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tagIcon: {
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    minHeight: 120,
  },
  inputWrapper: {
    flex: 1,
    height: '100%',
    padding: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    maxHeight: 130,
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
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    padding: 8,
  },
  optionText: {
    color: '#666',
    fontSize: 14,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    padding: 8,
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
    backgroundColor: '#9191ff'

  },
  postButtonText: {
    color: '#A0A0A0',
    fontWeight: '500',
  },
  postButtonTextActive: {
    color: '#000',
  },
});

export default FlexiblePostComponent;