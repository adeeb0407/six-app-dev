import HeaderText from '@/src/components/common/HeaderText';
import CategoryTabSelector from '@/src/components/feature/Home/CategoryTabSelector';
import PostTabSelector from '@/src/components/feature/Home/PostTabSelector';
import PostCard from '@/src/components/feature/Post/PostCard';
import FlexiblePostComponent from '@/src/components/feature/Post/PostModal';
import ProfileImage from '@/src/components/feature/Profile/ProfileImage';
import { CategoryTabs } from '@/src/constants/types/categoryTabs';
import { ConnectionLevel, Post } from '@/src/constants/types/post.types.';
import { PostTabs } from '@/src/constants/types/postTabs.types';
import { useAuth } from '@/src/context/AuthContext';
import { log } from '@/src/service/logger.service';
import { fetchPostsByDegree } from '@/src/service/post.service';
import { fetchUserProfile } from '@/src/service/profile.service';
import { usePostModalStore } from '@/src/store/postModalStore';
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import React, { FC, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const HomeScreen: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { user: userProfile, setUser } = useUserStore();
  const { showPostModal } = useLocalSearchParams<{ showPostModal?: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postTabs, setPostTabs] = useState<PostTabs>(PostTabs.AllPosts);
  const [categoryTabs, setCategoryTabs] = useState<CategoryTabs[]>([]);
  const { isHomePostModalVisible, setHomePostModalVisible } = usePostModalStore();
  const modalScaleAnim = useRef(new Animated.Value(1)).current;
  const [didPost, setDidPost] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    if (showPostModal) {
      setHomePostModalVisible(true);
    }
  }, [showPostModal]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          // Load user profile
          const profileResponse = await fetchUserProfile(user.id);
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
          }

          loadPosts();
        }
      } catch (e) {
        log('loadData useEffect: Index.tsx', 'Error loading data:', e as string);
      }
    };

    loadData();
  }, [user]);

  const loadPosts = async () => {
    if (user) {
      setPostsLoading(true);
      try {
        const postsData = await fetchPostsByDegree(user.id);
        setPosts(postsData ?? []);
      } finally {
        setPostsLoading(false);
      }
    }
  }

  const toggleCategoryTab = (tab: CategoryTabs) => {
    setCategoryTabs(prev =>
      prev.includes(tab)
        ? prev.filter(t => t !== tab)
        : [...prev, tab]
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
      if (didPost) {
        loadPosts();
        setDidPost(false)
      }
    });
  };

  const getFilteredPosts = () => {
    let filteredPosts = [...posts];

    // Filter by PostTabs (connection degree)
    if (postTabs !== PostTabs.AllPosts) {
      filteredPosts = filteredPosts.filter(post => {

        switch (postTabs) {
          case PostTabs.FirstDegree:
            return post.connectiontype == ConnectionLevel.First;
          case PostTabs.SecondDegree:
            return post.connectiontype == ConnectionLevel.Second;
          case PostTabs.ThirdDegree:
            return post.connectiontype == ConnectionLevel.Third;
          default:
            return true;
        }
      });
    }

    // Filter by CategoryTabs if any categories are selected
    if (categoryTabs.length > 0) {
      filteredPosts = filteredPosts.filter(post =>
        categoryTabs.includes(post.category)
      );
    }

    return filteredPosts;
  };

  const tabs = Object.values(CategoryTabs);
  const degrees = ['1°', '2°', '3°'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <HeaderText title='Six' />
        <TouchableOpacity onPress={() => router.push('/(protected)/profile')}>
          <ProfileImage
            imageUrl={userProfile?.profile_photo}
            name={userProfile?.name || 'User'}
            size={40}
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
                setDidPost={setDidPost}
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
        {postsLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#333" />
          </View>
        ) : getFilteredPosts().length === 0 && !postsLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts found</Text>
          </View>
        ) : (
          getFilteredPosts().map(post => (
            <PostCard key={post.id} post={post} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'TimesNewRomanRegular',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;