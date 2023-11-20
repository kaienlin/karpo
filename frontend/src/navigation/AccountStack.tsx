import { createNativeStackNavigator } from '@react-navigation/native-stack'

import AccountScreen from '../screens/Account'

export type AccountStackParamList = {
  AccountScreen: undefined
}

const Stack = createNativeStackNavigator<AccountStackParamList>()

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
    </Stack.Navigator>
  )
}
