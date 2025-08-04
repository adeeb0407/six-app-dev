import { CategoryTabs } from '@/src/constants/types/categoryTabs';
import { Post } from '@/src/constants/types/post.types.';
import { PostTabs } from '@/src/constants/types/postTabs.types';
import { logger } from '@/src/service/logger.service';
import { fetchPostsByDegree } from '@/src/service/post.service';
import { usePostStore } from '@/src/store/postStore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import PostCard from './PostCard';

// Create a memoized version of PostCard to prevent unnecessary re-renders
const MemoizedPostCard = React.memo(PostCard);

interface PostsListProps {
  userId: string;
  postTabs: PostTabs;
  categoryTabs: CategoryTabs[];
}

interface PaginationState {
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  totalFetched: number;
}

export const PostsList: React.FC<PostsListProps> = ({
  userId,
  postTabs,
  categoryTabs,
}) => {
  const { posts, setPosts, addPosts, clearPosts } = usePostStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    totalFetched: 0
  });
  const [error, setError] = useState<string | null>(null);

  const isLoadingRef = useRef(false);
  const lastScrollY = useRef(0);

  const degreeFilter = useMemo(() => {
    const degreeMap = {
      [PostTabs.FirstDegree]: 1,
      [PostTabs.SecondDegree]: 2,
      [PostTabs.ThirdDegree]: 3,
      [PostTabs.AllPosts]: 0,
    };
    return degreeMap[postTabs] ?? 0;
  }, [postTabs]);

  const filteredPosts = useMemo(() => {
    if (categoryTabs.length === 0) return posts;
    return posts.filter(post => categoryTabs.includes(post.category));
  }, [posts, categoryTabs]);

  const loadPosts = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setPagination(prev => ({ ...prev, isLoading: !isLoadMore, isLoadingMore: isLoadMore }));
    setError(null);

    try {
      const response = await fetchPostsByDegree(userId, degreeFilter, page, 20);

      if (response?.success && response.data) {
        const { posts: newPosts, pagination: paginationInfo } = response.data;

        page === 1 ? setPosts(newPosts) : addPosts(newPosts);

        setPagination(prev => ({
          ...prev,
          currentPage: paginationInfo.currentPage,
          hasMore: paginationInfo.hasMore,
          totalFetched: paginationInfo.totalFetched,
          isLoading: false,
          isLoadingMore: false
        }));
      } else {
        throw new Error('Failed to load posts');
      }
    } catch (err) {
      logger.error('PostsList', 'Error loading posts:', err as string);
      setError('Error loading posts');
      setPagination(prev => ({ ...prev, isLoading: false, isLoadingMore: false, hasMore: false }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [userId, degreeFilter, setPosts, addPosts]);

  const loadMorePosts = useCallback(() => {
    if (pagination.hasMore && !isLoadingRef.current) {
      loadPosts(pagination.currentPage + 1, true);
    }
  }, [loadPosts, pagination.hasMore, pagination.currentPage]);

  const handleRefresh = useCallback(async () => {
    clearPosts();
    setRefreshing(true);
    try {
      await loadPosts(1, false);
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts, setRefreshing, clearPosts]);

  // We don't need the manual scroll handling with FlatList as it provides onEndReached
  // These methods are removed as they're no longer needed

  useEffect(() => {
    clearPosts();
    setPagination({
      currentPage: 1,
      hasMore: true,
      isLoading: false,
      isLoadingMore: false,
      totalFetched: 0
    });
    setError(null);
    isLoadingRef.current = false;
    loadPosts(1, false);
  }, [userId, degreeFilter]);

  if (pagination.isLoading && posts.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={[styles.statusText, styles.errorText]}>
          Failed to load posts. Pull to refresh.
        </Text>
      </View>
    );
  }

  if (filteredPosts.length === 0 && !pagination.isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.statusText}>
          {categoryTabs.length > 0 ? 'No posts found for selected categories' : 'No posts found'}
        </Text>
      </View>
    );
  }

  // Memoized render item function for better performance
  const renderItem = useCallback(({ item }: { item: Post }) => {
    return <MemoizedPostCard post={item} />;
  }, []);

  // Memoized footer component
  const ListFooterComponent = useCallback(() => {
    if (pagination.isLoadingMore) {
      return (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      );
    }
    
    if (!pagination.hasMore && filteredPosts.length > 0) {
      return (
        <View style={styles.loadingIndicator}>
          <Text style={styles.endText}>You've reached the end</Text>
        </View>
      );
    }
    
    return <View style={styles.bottomPadding} />;
  }, [pagination.isLoadingMore, pagination.hasMore, filteredPosts.length]);

  // Memoized empty component
  const ListEmptyComponent = useCallback(() => {
    if (pagination.isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#999" />
        </View>
      );
    }

    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.statusText}>
          {categoryTabs.length > 0 ? 'No posts found for selected categories' : 'No posts found'}
        </Text>
      </View>
    );
  }, [pagination.isLoading, categoryTabs.length]);

  // Optimized extraction of item keys
  const keyExtractor = useCallback((item: Post) => item.id, []);

  return (
    <FlatList
      data={filteredPosts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.container}
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={true}
      onEndReached={loadMorePosts}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#333']}
          tintColor="#333"
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  listContentContainer: {
    paddingTop: 10,
    paddingBottom: 30
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  errorText: {
    color: '#f44336',
  },
  loadingIndicator: {
    padding: 15,
    alignItems: 'center',
  },
  endText: {
    color: '#888',
    fontSize: 14,
  },
  bottomPadding: {
    height: 60,
  },
});
