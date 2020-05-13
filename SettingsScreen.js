import React, { Component } from "react"
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'

export default class SettingsScreen extends Component {
  constructor (props) {
    super(props)

    this.onButtonPress = this.onButtonPress.bind(this)
  }

  onButtonPress () {
    this.props.navigation.replace('Setup')
  }
  
  render () {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={this.onButtonPress}>
          <Text>Open Setup</Text>
        </TouchableOpacity>
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
  },
  button: {
    padding: 16,
    backgroundColor: '#eee'
  }
});
