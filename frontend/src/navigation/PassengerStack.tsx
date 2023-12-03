import { createNativeStackNavigator } from '@react-navigation/native-stack'

import PassengerPlanRideScreen from '~/screens/PassengerPlanRide'
import SelectRideScreen from '~/screens/SelectRide'
import SelectLocationScreen from '~/screens/SelectWaypoint'

const Stack = createNativeStackNavigator<PassengerStackParamList>()

export type PassengerStackParamList = {}

export default function PassengerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PassengerPlanRideScreen" component={PassengerPlanRideScreen} />
      <Stack.Screen name="SelectLocationScreen" component={SelectLocationScreen} />
      <Stack.Screen name="SelectRideScreen" component={SelectRideScreen} />
    </Stack.Navigator>
  )
}
