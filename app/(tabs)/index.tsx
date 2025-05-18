import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PostType = {
  id: string;
  username: string;
  age: string;
  title: string;
  description: string;
  timeAgo: string;
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [postModalVisible, setPostModalVisible] = useState(false);

  const posts: PostType[] = [
    {
      id: '1',
      username: `NYU'26`,
      age: '26',
      title: 'Grabbing coffee in SoHo - anyone free to join?',
      description: 'Econ | Loves matcha and dogs',
      timeAgo: '2h ago',
    },
    {
      id: '2',
      username: `NYU'26`,
      age: '26',
      title: 'Grabbing coffee in SoHo - anyone free to join?',
      description: 'Econ | Loves matcha and dogs',
      timeAgo: '2h ago',
    },
    {
      id: '3',
      username: `Columbia'24`,
      age: '28',
      title: 'Working on a startup idea - looking for tech co-founders',
      description: 'MBA | Tech enthusiast',
      timeAgo: '3h ago',
    },
    {
      id: '4',
      username: `Hunter'25`,
      age: '27',
      title: 'Study group for LSAT prep this weekend?',
      description: 'Pre-Law | Coffee addict',
      timeAgo: '4h ago',
    },
  ];

  // Tabs for the filter options
  const tabs = ['General', 'Meet', 'Chat'];
  const degrees = ['1°', '2°', '3°'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Six</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image
            source={require('../../assets/images/pfp.jpg')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Share input */}
      <View style={styles.shareContainer}>
        <TextInput
          style={styles.shareInput}
          placeholder="Share something"
          placeholderTextColor="#000"
          textAlign="center"
          textAlignVertical="center"
        />
      </View>

      {/* Tabs section */}
      <View style={styles.tabsSection}>
        <View style={styles.tabsLeft}>
          <TouchableOpacity>
            <LinearGradient
              colors={['#ff66c4', '#5170ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tabButtonActive}
            >
              <Text style={[styles.tabTextActive]}>Posts</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsRight}>
          {degrees.map((degree, index) => (
            <TouchableOpacity key={index} style={styles.degreeButton}>
              <Text style={styles.degreeText}>{degree}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category tabs */}
      <View style={styles.categoryTabs}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryTab}
            onPress={() => setPostModalVisible(true)}
          >
            <Text style={styles.categoryTabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts */}
      <ScrollView style={styles.postsContainer}>
        {posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postConnectionText}>1st connection</Text>
              <Text style={styles.postTimeText}>{post.timeAgo}</Text>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.meetButton}>
                <Text style={styles.meetButtonText}>meet</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.postDescription}>{post.username} | {post.description}</Text>

            <TouchableOpacity style={styles.interestedButton}>
              <Text style={styles.interestedButtonText}>Interested</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {/* <PostModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
        tabs={tabs}
        defaultTab="General"
      /> */}
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
  headerTitle: {
    fontSize: 42,
    fontFamily: 'TimesNewRomanBold',
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
    fontSize: 18,
    fontStyle: 'italic',
  },
  tabsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  tabsLeft: {
    flexDirection: 'row',
  },
  tabsRight: {
    flexDirection: 'row',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  tabButtonActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tabTextActive: {
    fontFamily: 'TimesNewRomanRegular',
    color: '#fff',
  },
  degreeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  degreeText: {
    fontSize: 16,
    color: '#555',
  },
  categoryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 20,
  },
  categoryTabText: {
    fontSize: 14,
    color: '#333',
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  postConnectionText: {
    color: '#888',
  },
  postTimeText: {
    color: '#888',
  },
  postTitle: {
    fontSize: 26,
    fontWeight: '500',
    marginBottom: 15,
    fontFamily: 'TimesNewRomanRegular',
  },
  postActions: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  meetButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  meetButtonText: {
    fontSize: 14,
    color: '#333',
  },
  postDescription: {
    color: '#555',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  interestedButton: {
    backgroundColor: '#9191ff',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  interestedButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '400',
  },
});

export default HomeScreen;