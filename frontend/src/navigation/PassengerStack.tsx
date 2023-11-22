import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<PassengerStackParamList>()

export type PassengerStackParamList = {}

export default function PassengerStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}></Stack.Navigator>
}
