import { type NavigatorScreenParams } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from '../screens/Home'
import DriverStack, { type DriverStackParamList } from './DriverStack'
import PassengerStack, { type PassengerStackParamList } from './PassengerStack'

export type HomeStackParamList = {
  HomeScreen: undefined
  DriverStack: NavigatorScreenParams<DriverStackParamList>
  PassengerStack: NavigatorScreenParams<PassengerStackParamList>
}

const Stack = createNativeStackNavigator<HomeStackParamList>()

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DriverStack" component={DriverStack} />
      <Stack.Screen name="PassengerStack" component={PassengerStack} />
    </Stack.Navigator>
  )
}
