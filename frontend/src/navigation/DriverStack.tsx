import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from '../screens/Home'
import SelectLocation from '../screens/SelectLocation'
import RideDepartScreen from '../screens/RideDepart'

const Stack = createNativeStackNavigator<DriverStackParamList>()

export type DriverStackParamList = {
  PlanRideScreen: undefined
  SelectLocationScreen: undefined
  WaitRequestScreen: undefined
  RideDepartScreen: undefined
  RideCompleteScreen: undefined
}

export default function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RideDepartScreen" component={RideDepartScreen} />
    </Stack.Navigator>
  )
}
