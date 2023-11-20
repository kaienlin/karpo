import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from '../screens/Home'
import SelectLocation from '../screens/SelectLocation'

export type HomeStackParamList = {
  HomeScreen: undefined
  SelectLocationScreen: { waypointIndex: number }
}

const Stack = createNativeStackNavigator<HomeStackParamList>()

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="SelectLocationScreen" component={SelectLocation} />
    </Stack.Navigator>
  )
}
