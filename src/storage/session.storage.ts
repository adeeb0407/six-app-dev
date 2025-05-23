import { log } from '@/src/service/logger.service';
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
      log('setSession', 'Error saving session:', error as string);
    }
  },  

  async getSession(): Promise<any | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      log('getSession', 'Error getting session:', error as string);
      return null;
    }
  },

  async setUserData(userData: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
    } catch (error) {
      log('setUserData', 'Error saving user data:', error as string);
    }
  },

  async getUserData(): Promise<any | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      log('getUserData', 'Error getting user data:', error as string);
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
      log('clearAuth', 'Error clearing auth data:', error as string);
    }
  }
};