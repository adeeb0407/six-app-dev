import { Post } from '@/src/constants/types/post.types.';
import { PostTabs } from '@/src/constants/types/postTabs.types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedPosts {
  [key: number]: {
    posts: Post[];
    lastCursor: string | null;
    lastUpdated: number;
    hasMore: boolean;
  };
}

interface PostStore {
  // Current posts shown in the feed
  posts: Post[];
  
  // Cache system by degree
  cachedPosts: CachedPosts;
  lastCursor: string | null;
  hasMore: boolean;
  
  // Actions
  setPosts: (posts: Post[], degree: number) => void;
  addPosts: (newPosts: Post[], degree: number, cursor: string | null, hasMore: boolean) => void;
  addPostOnTop: (newPost: Post) => void;
  removeUserPost: (userId: string) => void;
  clearPosts: () => void;
  clearCache: () => void;
  getCachedPostsByDegree: (degree: number) => {
    posts: Post[];
    lastCursor: string | null;
    hasMore: boolean;
    isCacheValid: boolean;
  };
}

export const usePostStore = create(
  persist<PostStore>(
    (set, get) => ({
      posts: [],
      cachedPosts: {},
      lastCursor: null,
      hasMore: true,
      
      setPosts: (posts: Post[], degree: number) => set(state => {
        // Update cache
        const updatedCache = {
          ...state.cachedPosts,
          [degree]: {
            posts,
            lastCursor: null, // Reset cursor on full replace
            lastUpdated: Date.now(),
            hasMore: true,
          }
        };
        
        return { 
          posts, 
          cachedPosts: updatedCache,
          lastCursor: null,
          hasMore: true
        };
      }),
      
      addPosts: (newPosts: Post[], degree: number, cursor: string | null, hasMore: boolean) => set(state => {
        // Get existing posts for this degree
        const existingDegreeCache = state.cachedPosts[degree] || { posts: [], lastCursor: null, lastUpdated: 0, hasMore: true };
        const updatedPosts = [...state.posts, ...newPosts];
        
        // Deduplicate posts based on id
        const uniquePosts = Array.from(
          new Map(updatedPosts.map(post => [post.id, post]))
        ).map(([_, post]) => post);
        
        // Update cache
        const updatedCache = {
          ...state.cachedPosts,
          [degree]: {
            posts: [...existingDegreeCache.posts, ...newPosts],
            lastCursor: cursor,
            lastUpdated: Date.now(),
            hasMore,
          }
        };
        
        return { 
          posts: uniquePosts, 
          cachedPosts: updatedCache,
          lastCursor: cursor,
          hasMore
        };
      }),
      
      addPostOnTop: (newPost: Post) => set(state => {
        const updatedPosts = [newPost, ...state.posts];
        return { posts: updatedPosts };
      }),
      
      removeUserPost: (userId: string) => set(state => {
        // Remove from current posts
        const filteredPosts = state.posts.filter(post => post.user_id !== userId);
        
        // Remove from all cached posts
        const updatedCache = { ...state.cachedPosts };
        Object.keys(updatedCache).forEach(degreeKey => {
          const degree = Number(degreeKey);
          const degreePosts = updatedCache[degree];
          updatedCache[degree] = {
            ...degreePosts,
            posts: degreePosts.posts.filter(post => post.user_id !== userId)
          };
        });
        
        return { 
          posts: filteredPosts,
          cachedPosts: updatedCache
        };
      }),
      
      clearPosts: () => set({ posts: [] }),
      
      clearCache: () => set({ cachedPosts: {}, lastCursor: null, hasMore: true }),
      
      getCachedPostsByDegree: (degree: number) => {
        const state = get();
        const cachedData = state.cachedPosts[degree];
        
        if (!cachedData) {
          return {
            posts: [],
            lastCursor: null,
            hasMore: true,
            isCacheValid: false
          };
        }
        
        // Check if cache is still valid (less than 5 minutes old)
        const isCacheValid = (Date.now() - cachedData.lastUpdated) < 5 * 60 * 1000;
        
        return {
          posts: cachedData.posts,
          lastCursor: cachedData.lastCursor,
          hasMore: cachedData.hasMore,
          isCacheValid
        };
      }
    }),
    {
      name: 'six-posts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
