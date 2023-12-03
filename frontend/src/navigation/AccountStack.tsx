import { createNativeStackNavigator } from '@react-navigation/native-stack'

import AccountScreen from '~/screens/Account'
import type { AccountStackParamList } from '~/types/navigation'

const Stack = createNativeStackNavigator<AccountStackParamList>()

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
    </Stack.Navigator>
  )
}
