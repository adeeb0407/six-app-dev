import HeaderText from '@/src/components/common/HeaderText';
import CategoryTabSelector from '@/src/components/feature/Home/CategoryTabSelector';
import PostTabSelector from '@/src/components/feature/Home/PostTabSelector';
import PostCard from '@/src/components/feature/Post/PostCard';
import FlexiblePostComponent from '@/src/components/feature/Post/PostModal';
import { CategoryTabs } from '@/src/constants/types/categoryTabs';
import { PostType } from '@/src/constants/types/post';
import { PostTabs } from '@/src/constants/types/postTabs';
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
    username: `NYU'26`,
    age: '26',
    title: 'Grabbing coffee in SoHo - anyone free to join?',
    description: 'Econ | Loves matcha and dogs',
    timeAgo: '2h ago',
  },
  {
    id: '2',
    username: `NYU'26`,
    age: '26',
    title: 'Grabbing coffee in SoHo - anyone free to join?',
    description: 'Econ | Loves matcha and dogs',
    timeAgo: '2h ago',
  },
  {
    id: '3',
    username: `Columbia'24`,
    age: '28',
    title: 'Working on a startup idea - looking for tech co-founders',
    description: 'MBA | Tech enthusiast',
    timeAgo: '3h ago',
  },
  {
    id: '4',
    username: `Hunter'25`,
    age: '27',
    title: 'Study group for LSAT prep this weekend?',
    description: 'Pre-Law | Coffee addict',
    timeAgo: '4h ago',
  },
];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { showPostModal } = useLocalSearchParams<{ showPostModal?: string }>();
  const [postTabs, setPostTabs] = useState<PostTabs>(PostTabs.AllPosts);
  const [categoryTabs, setCategoryTabs] = useState<CategoryTabs[]>([]);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const modalScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setPostModalVisible(true);
  }, [showPostModal]);

  const toggleCategoryTab = (tab: CategoryTabs) => {
    setCategoryTabs(prev =>
      prev.includes(tab)
        ? prev.filter(t => t !== tab) // remove if selected
        : [...prev, tab]              // add if not selected
    );
  };

  const showModal = () => {
    setPostModalVisible(true);
    Animated.spring(modalScaleAnim, {
      toValue: 0.95, // Scale down to 95%
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalScaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setPostModalVisible(false);
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
      
     { !postModalVisible &&
       <TouchableOpacity 
        style={styles.shareContainer}
        onPress={showModal}
      >
        <Text style={styles.shareInput}>
          + Share something
        </Text>
      </TouchableOpacity>
     }

      {postModalVisible && (
        <TouchableWithoutFeedback onPress={hideModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
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
                  visible={postModalVisible}
                  onClose={hideModal}
                  onPost={() => {
                    // handle post
                    hideModal();
                  }}
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

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

      {/* Posts */}
      <ScrollView style={styles.postsContainer}>
        {posts.map(post => (
          <PostCard post={post}/>
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
    textAlign: 'center'
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
  },
});

export default HomeScreen;