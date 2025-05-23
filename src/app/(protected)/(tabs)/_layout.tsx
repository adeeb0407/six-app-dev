import { usePostModalStore } from '@/src/store/postModalStore';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';

export default function TabLayout() {
  const [currentTab, setCurrentTab] = useState('index');
  const setHomePostModalVisible = usePostModalStore(state => state.setHomePostModalVisible);
  const setChatPostModalVisible = usePostModalStore(state => state.setChatPostModalVisible);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#552ea1',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64, 
          paddingBottom: 2, 
          paddingTop: 10,
        },
      }}
      screenListeners={{
        state: e => {
          const activeIndex = e.data.state.index;
          const activeTabName = e.data.state.routeNames[activeIndex];
          setCurrentTab(activeTabName);
          if (activeTabName != 'index') setHomePostModalVisible(false)
          if (activeTabName != 'chats') setChatPostModalVisible(false)
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Feather size={30} name="home" color={color} /> // ⬆️ bigger icon
          ),
        }}
      />

      <Tabs.Screen
        name="six"
        options={{
          title: 'Six',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('@/src/assets/images/icon.png')}
              style={[
                styles.icon,
              ]}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate(currentTab, { showPostModal: Date.now().toString() });
          },
        })}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbox-outline" size={32} color={color} /> 
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 36,  
    height: 36,
    resizeMode: 'contain',
  },
});
