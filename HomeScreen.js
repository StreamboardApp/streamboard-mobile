import React, { Component } from "react"
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'
import WS from 'react-native-websocket'

class HomeScreen extends Component {
  constructor (props) {
    super(props)
    this.state = {
      board: null
    }

    this.onButtonPress = this.onButtonPress.bind(this)
  }

  onButtonPress (row, column) {
    if (this.ws) {
      this.ws.send(JSON.stringify({
        op: 0,
        data: {
          row,
          column
        }
      }))
    }
  }

  render () {
    return (
      <FlingGestureHandler
        direction={Directions.UP}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            this.props.navigation.navigate('Settings')
          }
        }}
      >
        <View style={styles.container}>
          <WS
            ref={ref => {this.ws = ref}}
            url={`ws://${this.props.ip}:${this.props.port}`}
            onOpen={() => {
              console.log("Connected to Streamboard Desktop")
              activateKeepAwake()
            }}
            onMessage={(event) => {
              const json = JSON.parse(event.data)
              switch (json.op) {
                case 1: {
                  // Hello | Initial server data like version and heartbeat
                  this.heartbeatInterval = setInterval(() => {
                    if (this.ws) {
                      this.ws.send(JSON.stringify({
                        op: 2
                      }))
                    }
                  }, json.data.heartbeat)

                  this.setState({ board: json.data.board })
                  break
                }
                case 2: {
                  this.setState({ board: json.data.board })
                }
              }
            }}
            onError={() => {
              deactivateKeepAwake()
              if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval1)
              }
            }}
            onClose={() => {
              deactivateKeepAwake()
              if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval1)
              }
            }}
            reconnect
          ></WS>
          
          {this.state.board !== null ? (
            <View style={styles.boardContainer}>
              {Object.entries(this.state.board.structure).map(([rowIndex, row]) => (
                <View style={styles.row} key={rowIndex}>
                  {Object.entries(row).map(([columnIndex, column]) => (
                    <View key={columnIndex}>
                      <TouchableOpacity onPress={() => this.onButtonPress(rowIndex, columnIndex)}>
                        <View style={styles.button}>
                          {!column.state && column.icons.inactive.trim() !== '' && (
                            <Image style={styles.icon} source={{ uri: column.icons.inactive }}></Image>
                          )}
                          {column.state && column.icons.active.trim() !== '' && (
                            <Image style={styles.icon} source={{ uri: column.icons.active }}></Image>
                          )}
                          <Text>{column.label}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <Text>No board available</Text>
          )}
        </View>
      </FlingGestureHandler>
    )
  }

  componentDidMount () {
    if (this.props.firstRun) {
      this.props.navigation.replace('Setup')
    }

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    this.focusListener = this.props.navigation.addListener('focus', () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    })
  }

  componentWillUnmount () {
    this.props.navigation.removeListener(this.focusListener)
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  button: {
    width: 128,
    height: 128,
    margin: 12,
    //margin: '0.75rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FAFAFA',
    borderRadius: 16
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 16
  }
});

const mapStateToProps = state => {
  return {
    firstRun: state.applicationReducer.firstRun,
    ip: state.applicationReducer.ip,
    port: state.applicationReducer.port
  }
}

export default connect(mapStateToProps)(HomeScreen)