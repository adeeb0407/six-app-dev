import { log } from '@/src/service/logger.service';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../db/supabase';
import { storage } from '../storage/session.storage';
type User = {
  id: string;
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedSession = await storage.getSession();
      const storedUser = await storage.getUserData();

      if (storedSession) {
        setSession(storedSession);
        setUser(storedUser);
      }

      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user ?? null);
        await storage.setSession(session);
        await storage.setUserData(session.user);
      }
    } catch (error) {
      log('loadStoredSession', 'Error loading stored session:', error as string);
    } finally {
      setLoading(false);
    }     
  };

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        await storage.setSession(session);
        await storage.setUserData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    await storage.setUserData(userData);
    router.replace('/');
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await storage.clearAuth();
      setUser(null);
      setSession(null);
      router.replace('/landing');
    } catch (error) {
      log('logout', 'Error logging out:', error as string);
    }
  };

  if (loading) {
    return null; // or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, session, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
