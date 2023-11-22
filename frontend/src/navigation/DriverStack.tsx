import { createNativeStackNavigator } from '@react-navigation/native-stack'

import PlanRideScreen from '../screens/PlanRide'
import RideDepartScreen from '../screens/RideDepart'
import SelectLocation from '../screens/SelectLocation'

const Stack = createNativeStackNavigator<DriverStackParamList>()

export type DriverStackParamList = {
  PlanRideScreen: undefined
  SelectLocationScreen: { waypointIndex: number }
  WaitRequestScreen: undefined
  RideDepartScreen: undefined
  RideCompleteScreen: undefined
}

export default function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlanRideScreen" component={PlanRideScreen} />
      <Stack.Screen name="SelectLocationScreen" component={SelectLocation} />
      <Stack.Screen name="RideDepartScreen" component={RideDepartScreen} />
    </Stack.Navigator>
  )
}
