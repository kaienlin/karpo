import { createNativeStackNavigator } from '@react-navigation/native-stack'

import type { MainStackParamList } from '~/types/navigation'

import AccountStack from './AccountStack'
import BottomTab from './BottomTab'
import DriverStack from './DriverStack'
import PassengerStack from './PassengerStack'

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
