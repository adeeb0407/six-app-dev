import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const demoDetails = [
  
]

const ProfileDetails = () => {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.row}>
        <View style={styles.blueBall} />
        <Text style={styles.detailsText}>NYU'26</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  detailsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blueBall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#35c3f0',
    marginRight: 10,
  },
  detailsText: {
    fontSize: 20,
  },
})

export default ProfileDetails
