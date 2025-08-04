import { CategoryTabs } from '@/src/constants/types/categoryTabs';
import { Post } from '@/src/constants/types/post.types.';
import { PostTabs } from '@/src/constants/types/postTabs.types';
import { logger } from '@/src/service/logger.service';
import { fetchPostsByDegree } from '@/src/service/post.service';
import { usePostStore } from '@/src/store/postStore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import PostCard from './PostCard';

interface PostsListProps {
  userId: string;
  postTabs: PostTabs;
  categoryTabs: CategoryTabs[];
}

interface PaginationState {
  cursor: string | null;
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
  const { posts, setPosts, addPosts, clearPosts, clearCache, getCachedPostsByDegree, lastCursor, hasMore: storeHasMore } = usePostStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    cursor: null,
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

  const loadPosts = useCallback(async (useCursor: string | null = null, isLoadMore: boolean = false) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setPagination(prev => ({ ...prev, isLoading: !isLoadMore, isLoadingMore: isLoadMore }));
    setError(null);

    // Check if we have valid cached data first
    if (!isLoadMore) {
      const cachedData = getCachedPostsByDegree(degreeFilter);
      if (cachedData.isCacheValid && cachedData.posts.length > 0) {
        // Use cached data
        setPosts(cachedData.posts, degreeFilter);
        setPagination(prev => ({
          ...prev,
          cursor: cachedData.lastCursor,
          hasMore: cachedData.hasMore,
          isLoading: false,
          isLoadingMore: false
        }));
        isLoadingRef.current = false;
        return;
      }
    }

    try {
      // Use cursor-based pagination
      const cursor = isLoadMore ? useCursor : null;
      const response = await fetchPostsByDegree(userId, degreeFilter, cursor, 20);

      if (response?.success && response.data) {
        const { posts: newPosts, pagination: paginationInfo } = response.data;
        const newCursor = paginationInfo.nextCursor || null;

        if (isLoadMore) {
          addPosts(newPosts, degreeFilter, newCursor, paginationInfo.hasMore);
        } else {
          setPosts(newPosts, degreeFilter);
        }

        setPagination(prev => ({
          ...prev,
          cursor: newCursor,
          hasMore: paginationInfo.hasMore,
          totalFetched: isLoadMore ? prev.totalFetched + newPosts.length : newPosts.length,
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
  }, [userId, degreeFilter, setPosts, addPosts, getCachedPostsByDegree]);

  const loadMorePosts = useCallback(() => {
    if (pagination.hasMore && !isLoadingRef.current) {
      loadPosts(pagination.cursor, true);
    }
  }, [loadPosts, pagination.hasMore, pagination.cursor]);

  const handleRefresh = useCallback(async () => {
    clearPosts();
    clearCache(); // Clear the cache on manual refresh
    setRefreshing(true);
    try {
      await loadPosts(null, false);
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts, setRefreshing, clearPosts, clearCache]);

  const isNearBottom = useCallback((nativeEvent: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const distanceFromEnd = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    const scrollPercentage = (contentOffset.y + layoutMeasurement.height) / contentSize.height;
    const isScrollingDown = contentOffset.y > lastScrollY.current;

    lastScrollY.current = contentOffset.y;

    return isScrollingDown && (distanceFromEnd < 300 || scrollPercentage >= 0.85);
  }, []);

  const handleScroll = useCallback(({ nativeEvent }: any) => {
    if (isNearBottom(nativeEvent)) {
      loadMorePosts();
    }
  }, [isNearBottom, loadMorePosts]);

  useEffect(() => {
    clearPosts();
    setPagination({
      cursor: null,
      hasMore: true,
      isLoading: false,
      isLoadingMore: false,
      totalFetched: 0
    });
    setError(null);
    isLoadingRef.current = false;
    loadPosts(null, false);
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

  const renderItem = useCallback(({ item: post }: { item: Post }) => (
    <PostCard key={post.id} post={post} />
  ), []);

  const keyExtractor = useCallback((item: Post) => item.id, []);
  
  const ListFooterComponent = useCallback(() => (
    <>
      {pagination.isLoadingMore && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}

      {!pagination.hasMore && filteredPosts.length > 0 && (
        <View style={styles.loadingIndicator}>
          <Text style={styles.endText}>You've reached the end</Text>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </>
  ), [pagination.isLoadingMore, pagination.hasMore, filteredPosts.length]);

  return (
    <FlatList
      data={filteredPosts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
      ListFooterComponent={ListFooterComponent}
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  statusText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ff4444',
  },
  loadingIndicator: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endText: {
    color: '#999',
    fontSize: 14,
  },
  bottomPadding: {
    height: 50,
  },
});
