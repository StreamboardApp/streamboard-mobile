import React, { Component } from "react"
import { StyleSheet, Text, View, Button } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { setIP, setPort, setFirstRun } from './store/actions/applicationActions'

class SetupScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showQr: false,
      scanned: false
    }

    this.onPressScanQR = this.onPressScanQR.bind(this)
    this.onCancelScanQR = this.onCancelScanQR.bind(this)
    this.onBarCodeScanned = this.onBarCodeScanned.bind(this)
  }

  async onPressScanQR () {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status === 'granted') {
      this.setState({ showQr: true })
    }
  }

  onCancelScanQR () {
    this.setState({ showQr: false })
  }

  onBarCodeScanned ({ data }) {
    this.setState({ showQr: false, scanned: true })
    const json = JSON.parse(data)
    if (json.service && json.service === "streamboard") {
      this.props.setIP(json.address)
      this.props.setPort(json.port)
      this.props.setFirstRun(false)
      this.props.navigation.replace('Home')
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={[styles.header, { display: this.state.showQr ? 'none' : 'flex' }]}>Welcome to Streamboard!</Text>
        <BarCodeScanner
          onBarCodeScanned={this.state.scanned ? undefined : this.onBarCodeScanned}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          style={{ display: this.state.showQr ? 'flex' : 'none', height: '90%', width: '100%' }}
        />
        <View style={{ display: this.state.showQr ? 'none' : 'flex' }}>
         <Button title="Scan QR Code" onPress={this.onPressScanQR}></Button>
        </View>
        <View style={{ display: this.state.showQr ? 'flex' : 'none' }}>
         <Button title="Cancel" onPress={this.onCancelScanQR}></Button>
        </View>
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
    display: 'flex',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    fontSize: 24
  }
});

const mapStateToProps = state => {
  return {
    firstRun: state.applicationReducer.firstRun
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setIP,
    setPort,
    setFirstRun
  }, dispatch)
};

export default connect(mapStateToProps, mapDispatchToProps)(SetupScreen)