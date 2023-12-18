import { createNativeStackNavigator } from '@react-navigation/native-stack'

import DriverDepart from '~/screens/DriverDepart'
import DriverPlanRide from '~/screens/DriverPlanRide'
import DriverSelectJoinScreen from '~/screens/DriverSelectJoin'
import type { DriverStackParamList } from '~/types/navigation'

import { commonScreens } from './commonScreens'

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
      <Stack.Screen name="DriverSelectJoinScreen" component={DriverSelectJoinScreen} />
      <Stack.Screen name="DriverDepartScreen" component={DriverDepart} />
      {commonScreens(Stack)}
    </Stack.Navigator>
  )
}
