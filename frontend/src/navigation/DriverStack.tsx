import { createNativeStackNavigator } from '@react-navigation/native-stack'

import DriverDepart from '~/screens/driver/DriverDepart'
import DriverPlanRide from '~/screens/driver/DriverPlanRide'
import DriverSelectJoinScreen from '~/screens/driver/DriverSelectJoin'
import SelectLocation from '~/screens/SelectLocation'

const Stack = createNativeStackNavigator<DriverStackParamList>()

export type DriverStackParamList = {
  DriverPlanRideScreen: undefined
  SelectLocationScreen: { waypointIndex: number }
  DriverSelectJoinScreen: undefined
  DriverDepartScreen: undefined
  RideCompleteScreen: undefined
}

export default function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverPlanRideScreen" component={DriverPlanRide} />
      <Stack.Screen name="SelectLocationScreen" component={SelectLocation} />
      <Stack.Screen name="DriverSelectJoinScreen" component={DriverSelectJoinScreen} />
      <Stack.Screen name="DriverDepartScreen" component={DriverDepart} />
    </Stack.Navigator>
  )
}
