import { createNativeStackNavigator } from '@react-navigation/native-stack'

import BottomTab from './BottomTab'
import HomeScreen from '../screens/Home'
import SelectLocation from '../screens/SelectLocation'

const Stack = createNativeStackNavigator<HomeStackParamList>()

export default function HomeStack () {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="BottomTab"
        component={BottomTab}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />
      <Stack.Screen
        name="SelectLocationScreen"
        component={SelectLocation}
      />
    </Stack.Navigator>
  )
}
