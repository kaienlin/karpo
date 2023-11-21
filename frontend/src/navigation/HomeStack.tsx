import { createNativeStackNavigator } from '@react-navigation/native-stack'

import BottomTab from './BottomTab'
import HomeScreen from '../screens/Home'
import SelectLocation from '../screens/SelectLocation'
import SelectRide from '../screens/SelectRide'

// const Stack = createNativeStackNavigator<HomeStackParamList>()
const Stack = createNativeStackNavigator();

export default function HomeStack () {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen
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
      /> */}
      <Stack.Screen 
        name="SelectRideScreen"
        component={SelectRide}
      />
    </Stack.Navigator>
  )
}
