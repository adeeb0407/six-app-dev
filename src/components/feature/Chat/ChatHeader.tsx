import { Contact } from '@/src/constants/types/chat.types'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type ChatHeaderProp = {
    contact: Contact
}

const ChatHeader = ({contact}: ChatHeaderProp) => {
    const router = useRouter();

  return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Image
          source={{ uri: contact.avatar }}
          style={styles.profileImage}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerName}>{contact.name}</Text>
          <Text style={styles.connectionText}>{contact.connectionDegree}</Text>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
     header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 24,
    fontFamily: 'TimesNewRomanBold',
  },
  connectionText: {
    fontSize: 17,
    color: '#9CA3AF',
  },
})

export default ChatHeader