import { PostType } from '@/src/constants/types/post'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type props = {
    post: PostType
}

const PostCard = ({ post }: props) => {
    return (
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
})

export default PostCard