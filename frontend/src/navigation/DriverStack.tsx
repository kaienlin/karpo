import { createNativeStackNavigator } from '@react-navigation/native-stack'

import DriverDepart from '~/screens/DriverDepart'
import DriverPlanRide from '~/screens/DriverPlanRide'
import DriverSelectJoinScreen from '~/screens/DriverSelectJoin'
import RateScreen from '~/screens/Rate'
import SelectLocation from '~/screens/SelectLocation'

const Stack = createNativeStackNavigator<DriverStackParamList>()

export type DriverStackParamList = {
  DriverPlanRideScreen: undefined
  SelectLocationScreen: { waypointIndex: number; waypoint: Waypoint }
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
      <Stack.Screen name="RideCompleteScreen" component={RateScreen} />
    </Stack.Navigator>
  )
}
