import { Post } from '@/src/constants/types/post.types.';
import { create } from 'zustand';

interface PostStore {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPosts: (newPosts: Post[]) => void;
  addPostOnTop: (newPost: Post) => void;
  clearPosts: () => void;
}

interface AddPostOnTop {
  (newPost: Post[]): void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  setPosts: (posts: Post[]) => set({ posts }),
  addPosts: (newPosts: Post[]) => set((state) => ({ posts: [...state.posts, ...newPosts] })),
  addPostOnTop: ((newPost: Post) =>
    set((state) => ({ posts: [newPost, ...state.posts] }))),
  clearPosts: () => set({ posts: [] }),
}));
