import React, { Component } from "react"
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'
import WS from 'react-native-websocket'
import { Col, Row, Grid } from 'react-native-easy-grid'
import { vw, vh } from 'react-native-expo-viewport-units'

class HomeScreen extends Component {
  constructor (props) {
    super(props)
    this.state = {
      board: null,
      rows: 0,
      columns: 0
    }

    this.onButtonPress = this.onButtonPress.bind(this)
    this.renderButton = this.renderButton.bind(this)
    this.generateBoardFromStructure = this.generateBoardFromStructure.bind(this)
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

  renderButton (item, index) {
    return <TouchableOpacity onPress={() => this.onButtonPress(item.rowIndex, item.columnIndex)}>
      <View style={styles.button}>
        <View style={styles.content}>
          {!item.column.state && item.column.icons.inactive.trim() !== '' && (
            <Image style={styles.icon} source={{ uri: item.column.icons.inactive }}></Image>
          )}
          {item.column.state && item.column.icons.active.trim() !== '' && (
            <Image style={styles.icon} source={{ uri: item.column.icons.active }}></Image>
          )}
          <Text>{item.column.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  }

  generateBoardFromStructure (structure) {
    var rows = structure.length
    var columns = structure[0].length

    this.setState({ rows })
    this.setState({ columns })
    
    var board = []
    structure.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        board.push({
          column,
          rowIndex,
          columnIndex
        })
      });
    });

    this.setState({ board })
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

                  //this.generateBoardFromStructure(json.data.board.structure)
                  this.setState({ board: json.data.board })
                  break
                }
                case 2: {
                  //this.generateBoardFromStructure(json.data.board.structure)
                  this.setState({ board: json.data.board })
                  break
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
            /*<SquareGrid columns={this.state.columns} rows={this.state.rows} items={this.state.board} renderItem={this.renderButton}></SquareGrid>*/
            <Grid style={styles.grid}>
              {Object.entries(this.state.board.structure).map(([rowIndex, row]) => (
                <Row style={styles.row} key={rowIndex}>
                  {Object.entries(row).map(([columnIndex, column]) => (
                    <Col style={styles.column} key={columnIndex}>
                      <TouchableOpacity style={styles.button} onPress={() => this.onButtonPress(rowIndex, columnIndex)}>
                        <View style={styles.buttonContainer}>
                          {!column.state && column.icons.inactive.trim() !== '' && (
                            <Image style={styles.icon} source={{ uri: column.icons.inactive }}></Image>
                          )}
                          {column.state && column.icons.active.trim() !== '' && (
                            <Image style={styles.icon} source={{ uri: column.icons.active }}></Image>
                          )}
                          <Text>{column.label}</Text>
                        </View>
                      </TouchableOpacity>
                    </Col>
                  ))}
                </Row>
              ))}
            </Grid>
            /*<View style={styles.boardContainer}>
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
            </View>*/
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
    justifyContent: 'center'
  },
  grid: {
    width: vw(100),
    maxWidth: vh(100),
    maxHeight: vh(100)
  },
  row: {
    display: 'flex'
  },
  column: {
    margin: vw(0.75),
    position: 'relative',
    aspectRatio: 1
  },
  button: {
    margin: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FAFAFA',
    borderRadius: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  buttonContainer: {
    width: '100%',
    height: '100%'
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