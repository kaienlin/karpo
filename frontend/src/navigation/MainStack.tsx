import { type NavigatorScreenParams } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import AccountStack, { type AccountStackParamList } from './AccountStack'
import BottomTab, { type BottomTabParamList } from './BottomTab'
import DriverStack, { type DriverStackParamList } from './DriverStack'
import PassengerStack, { type PassengerStackParamList } from './PassengerStack'

export type MainStackParamList = {
  BottomTab: NavigatorScreenParams<BottomTabParamList>
  DriverStack: NavigatorScreenParams<DriverStackParamList>
  PassengerStack: NavigatorScreenParams<PassengerStackParamList>
  HistoryStack: undefined
  AccountStack: NavigatorScreenParams<AccountStackParamList>
}

const Stack = createNativeStackNavigator<MainStackParamList>()

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BottomTab" component={BottomTab} options={{ headerShown: false }} />
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DriverStack" component={DriverStack} />
        <Stack.Screen name="PassengerStack" component={PassengerStack} />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen name="AccountStack" component={AccountStack} />
      </Stack.Group>
    </Stack.Navigator>
  )
}
