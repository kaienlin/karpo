import { createNativeStackNavigator } from '@react-navigation/native-stack'

import DriverDepart from '~/screens/DriverDepart'
import DriverPlanRide from '~/screens/DriverPlanRide'
import DriverSelectJoinScreen from '~/screens/DriverSelectJoin'
import RateScreen from '~/screens/Rate'
import SelectWaypoint from '~/screens/SelectWaypoint'
import type { DriverStackParamList } from '~/types/navigation'

const Stack = createNativeStackNavigator<DriverStackParamList>()

export default function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DriverPlanRideScreen"
        component={DriverPlanRide}
        initialParams={{
          savedRideIndex: -1
        }}
      />
      <Stack.Screen name="SelectWaypointScreen" component={SelectWaypoint} />
      <Stack.Screen name="DriverSelectJoinScreen" component={DriverSelectJoinScreen} />
      <Stack.Screen name="DriverDepartScreen" component={DriverDepart} />
      <Stack.Screen
        name="RideCompleteScreen"
        component={RateScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  )
}
