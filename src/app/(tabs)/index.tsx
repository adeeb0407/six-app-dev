import HeaderText from '@/src/components/common/HeaderText';
import CategoryTabSelector from '@/src/components/feature/Home/CategoryTabSelector';
import PostTabSelector from '@/src/components/feature/Home/PostTabSelector';
import PostCard from '@/src/components/feature/Post/PostCard';
import FlexiblePostComponent from '@/src/components/feature/Post/PostModal';
import { CategoryTabs } from '@/src/constants/types/categoryTabs';
import { ConnectionLevel, PostType } from '@/src/constants/types/post';
import { PostTabs } from '@/src/constants/types/postTabs';
import { usePostModalStore } from '@/src/store/postModalStore';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const posts: PostType[] = [
  {
    id: '1',
    connectionType: ConnectionLevel.First,
    university: `NYU'26`,
    title: 'Grabbing coffee in SoHo - anyone free to join?',
    description: 'Econ',
    about: 'Loves matcha and dogs',
    category: CategoryTabs.Chat,
    timeAgo: '2h ago',
  },
  {
    id: '2',
    connectionType: ConnectionLevel.Second,
    university: `Columbia'25`,
    title: 'Need to rant about Philosophy 210 - anyone taken it before?',
    description: `Philosophy`,
    about: 'Coffee enthusiast and tennis player',
    category: CategoryTabs.Meet,
    timeAgo: '2h ago',
  }
];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { showPostModal } = useLocalSearchParams<{ showPostModal?: string }>();
  const [postTabs, setPostTabs] = useState<PostTabs>(PostTabs.AllPosts);
  const [categoryTabs, setCategoryTabs] = useState<CategoryTabs[]>([]);
  const { isHomePostModalVisible, setHomePostModalVisible } = usePostModalStore();
  const modalScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if(showPostModal) {
      setHomePostModalVisible(true);
    }
  }, [showPostModal]);

  const toggleCategoryTab = (tab: CategoryTabs) => {
    setCategoryTabs(prev =>
      prev.includes(tab)
        ? prev.filter(t => t !== tab) // remove if selected
        : [...prev, tab]              // add if not selected
    );
  };

  const showModal = () => {
    setHomePostModalVisible(true);
    Animated.spring(modalScaleAnim, {
      toValue: 0.95, 
      useNativeDriver: true,
      tension: 40,
      friction: 10,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalScaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setHomePostModalVisible(false);
    });
  };

  const tabs = Object.values(CategoryTabs);
  const degrees = ['1°', '2°', '3°'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <HeaderText title='Six' />
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image
            source={require('../../assets/images/pfp.jpg')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>



      {/* Share input */}

      {!isHomePostModalVisible &&
        <TouchableOpacity
          style={styles.shareContainer}
          onPress={showModal}
        >
          <Text style={styles.shareInput}>
            Share something
          </Text>
        </TouchableOpacity>
      }

      {isHomePostModalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    transform: [{ scale: modalScaleAnim }]
                  }
                ]}
              >
                <FlexiblePostComponent
                  isModal={false}
                  visible={isHomePostModalVisible}
                  onClose={hideModal}
                  onPost={() => {
                    // handle post
                    hideModal();
                  }}
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
      )}

      <View style={styles.filterContainer}>
        {/* PostTabs section */}
        <PostTabSelector
          degrees={degrees}
          selectedTab={postTabs}
          onSelectTab={setPostTabs}
        />

        {/* Category tabs */}
        <CategoryTabSelector
          onToggle={toggleCategoryTab}
          selectedTabs={categoryTabs}
          tabs={tabs}
        />
      </View>

      {/* Posts */}
      <ScrollView style={styles.postsContainer}>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  shareContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  shareInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 20,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  filterContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    paddingVertical: 16
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
  },
});

export default HomeScreen;