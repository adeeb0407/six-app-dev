import React from 'react'
import { StyleSheet, Text } from 'react-native'

type HeaderTextProps = {
    title: string
}

const HeaderText = ({title}: HeaderTextProps) => {
    return (
        <Text style={styles.headerTitle}>{title}</Text>
    )
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 42,
    fontFamily: 'TimesNewRomanBold',
  },
})

export default HeaderText