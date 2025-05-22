import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface RequestType {
  id: string;
  users: {
    id: string;
    name: string;
    profile_photo: string;
  };
  posts: {
    id: string;
    content: string;
  };
}

interface ConnectionRequestStore {
  requests: RequestType[];
  setRequests: (requests: RequestType[]) => void;
  clearRequests: () => void;
}

export const useConnectionRequestStore = create<ConnectionRequestStore>()(
  persist(
    (set) => ({
      requests: [],
      setRequests: (requests) => set({ requests }),
      clearRequests: () => set({ requests: [] }),
    }),
    {
      name: 'connection-requests',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);