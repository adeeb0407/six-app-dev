import { CategoryTabs } from '@/src/constants/types/categoryTabs';
import { ConnectionLevel, PostType } from '@/src/constants/types/post';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const categoryTabColors: Record<CategoryTabs, { bg: string }> = {
  [CategoryTabs.General]: { bg: '#dbfae6' },
  [CategoryTabs.Hangout]: { bg: '#dbeafe' },
  [CategoryTabs.Opportunity]: { bg: '#fbe7f3' },
  [CategoryTabs.Help]: { bg: '#fef7c3' },
  [CategoryTabs.Chat]: { bg: '#f3f4f6' },
};

type props = {
  post: PostType;
};

const PostCard = ({ post }: props) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isReplied, setIsReplied] = useState(false);

  const handleShowDetailsToggle = () => {
    setShowDetails(s => !s);
  };

  const handleInterestedClick = () => {
    setIsReplied(true);
  };

  const connectionText =
    post.connectionType === ConnectionLevel.First
      ? '1st connection'
      : post.connectionType === ConnectionLevel.Second
        ? '2nd connection'
        : '3rd+ connection';

  const categoryColor = categoryTabColors[post.category]?.bg || '#eee';

  return (
    <TouchableWithoutFeedback onPress={handleShowDetailsToggle}>
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.subPostHeader}>
            <Text style={styles.postConnectionText}>{connectionText}</Text>
            <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryText}>{post.category}</Text>
            </View>
          </View>
          <Text style={styles.postTimeText}>{post.timeAgo}</Text>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>

        {showDetails && (
          <View>
            {!isReplied ? (
              <View>
                <Text style={styles.postDescription}>
                  {post.university} | {post.description} | {post.about}
                </Text>
                <TouchableOpacity
                  style={styles.interestedButton}
                  onPress={handleInterestedClick}
                >
                  <Text style={styles.interestedButtonText}>Interested</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.repliedContaniner}>
                <Text style={styles.repliedText}>Replied</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
    marginBottom: 10,
  },
  subPostHeader: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  postConnectionText: {
    color: '#888',
    fontSize: 12,
  },
  postTimeText: {
    color: '#888',
    fontSize: 12,
  },
  categoryPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
    textTransform: 'capitalize',
  },
  postTitle: {
    fontSize: 26,
    fontWeight: '500',
    marginBottom: 15,
    fontFamily: 'TimesNewRomanRegular',
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
  repliedContaniner: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  repliedText: {
    backgroundColor: '#d0f2fc',
    color: '#35c3f0',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PostCard;
