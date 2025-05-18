import { PostType } from '@/src/constants/types/post'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

type props = {
  post: PostType
}

const PostCard = ({ post }: props) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isReplied, setIsReplied] = useState(false);

  const handleShowDetailsToggle = () => {
    setShowDetails(s => !s);
  }

  const handleInterestedClick = () => {
    setIsReplied(true);
  }

  return (
    <TouchableWithoutFeedback
      onPress={handleShowDetailsToggle}
    >
      <View key={post.id} style={styles.postCard}>

        <View style={styles.postHeader}>
          <Text style={styles.postConnectionText}>1st connection</Text>
          <Text style={styles.postTimeText}>{post.timeAgo}</Text>
        </View>
        <Text style={styles.postTitle}>{post.title}</Text>

        {showDetails &&
          <View>
            {!isReplied ?
              <View>
                <Text style={styles.postDescription}>{post.username} | {post.description}</Text>
                <TouchableOpacity style={styles.interestedButton} onPress={handleInterestedClick}>
                  <Text style={styles.interestedButtonText}>Interested</Text>
                </TouchableOpacity>
              </View>

              : 
              <View style={styles.repliedContaniner}>
                <Text style={styles.repliedText}>Replied</Text>
              </View>
              }
          </View>
        }
      </View>

    </TouchableWithoutFeedback>
  )
}

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
  backgroundColor: '#d0f2fc', // blue
  color: '#35c3f0',
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 20,
  fontSize: 12,
  fontWeight: '500',
},

})

export default PostCard