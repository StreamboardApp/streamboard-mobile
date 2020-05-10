import React from 'react'
import { Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { store, persistor } from './store/store'
import HomeScreen from './HomeScreen'
import SettingsScreen from './SettingsScreen'
import SetupScreen from './SetupScreen'

const Stack = createStackNavigator();
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{
              headerShown: false
            }}></Stack.Screen>
            <Stack.Screen name="Settings" component={SettingsScreen}></Stack.Screen>
            <Stack.Screen name="Setup" component={SetupScreen} options={{
              headerShown: false
            }}></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  )
}