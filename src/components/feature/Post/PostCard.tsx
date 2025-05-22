import { ConnectionLevel, Post } from '@/src/constants/types/post.types.';
import { useAuth } from '@/src/context/AuthContext';
import { reactToPost } from '@/src/service/request.service';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

type props = {
  post: Post;
};

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return postDate.toLocaleDateString();
};

const PostCard = ({ post }: props) => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isReplied, setIsReplied] = useState(false);

  const handleShowDetailsToggle = () => {
    setShowDetails(s => !s);
  };

  const handleInterestedClick = async () => {
    if (user) {
      const response = await reactToPost(post.id, user.id);
      if (!response.success) {
        console.error('Failed to react:', response.error);
      } else console.log('Reacted on post successfully')
      setIsReplied(true);
    }
  };

  const connectionText =
    post.connectiontype === ConnectionLevel.First
      ? '1st connection'
      : post.connectiontype === ConnectionLevel.Second
        ? '2nd connection'
        : post.connectiontype === ConnectionLevel.Third
          ? '3rd connection' : 'your post'

  return (
    <TouchableWithoutFeedback onPress={handleShowDetailsToggle}>
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.subPostHeader}>

            <Text style={styles.postConnectionText}>{connectionText}</Text>
          </View>
          <Text style={styles.postTimeText}>{getTimeAgo(post.created_at)}</Text>
        </View>

        <Text style={styles.postTitle}>{post.content}</Text>
        {/* {post.category !== CategoryTabs.General && */}

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.meetButton}>
            <Text style={styles.meetButtonText}>{post.category}</Text>
          </TouchableOpacity>
        </View>
        {/* } */}

        {showDetails && user && post.user_id != user.id && (
          <View>
            {!isReplied ? (
              <View>
                {post.keyword_summary &&
                  <View style={styles.keywordContainer}>
                    {post.keyword_summary.map((info, index) => (
                      <Text key={index} style={styles.postDescription}>
                        {info}
                        {index < post.keyword_summary.length - 1 && " • "}
                      </Text>
                    ))}
                  </View>
                }

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
    marginBottom: 2,
    fontFamily: 'TimesNewRomanRegular',
  },
  postDescription: {
    color: '#555',
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
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
    marginTop: 2,
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
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    alignItems: 'center',
  },
});

export default PostCard;
