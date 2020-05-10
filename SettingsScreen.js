import React, { Component } from "react"
import { StyleSheet, Text, View, Alert } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'

export default class SettingsScreen extends Component {
  render () {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your settings!</Text>
      </View>
    )
  }

  componentDidMount () {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    this.focusListener = this.props.navigation.addListener('focus', () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    })
  }

  componentWillUnmount () {
    this.props.navigation.removeListener(this.focusListener)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
