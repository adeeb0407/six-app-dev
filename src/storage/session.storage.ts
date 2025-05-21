import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_SESSION: '@user_session',
  USER_DATA: '@user_data',
} as const;

export const storage = {
  async setSession(session: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(session);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, jsonValue);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  },

  async getSession(): Promise<any | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  async setUserData(userData: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  async getUserData(): Promise<any | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_SESSION,
        STORAGE_KEYS.USER_DATA
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
};