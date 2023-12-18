import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { skipToken } from '@reduxjs/toolkit/query'

import { selectDriverState } from '~/redux/api/driver'
import { useGetCurrentActivityQuery } from '~/redux/api/users'
import { useGetRideStatusQuery } from '~/redux/passenger'
import DriverDepart from '~/screens/DriverDepart'
import DriverPlanRide from '~/screens/DriverPlanRide'
import DriverSelectJoinScreen from '~/screens/DriverSelectJoin'
import type { DriverStackParamList } from '~/types/navigation'

import { commonScreens } from './commonScreens'

const Stack = createNativeStackNavigator<DriverStackParamList>()

export default function DriverStack() {
  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: result => ({ ...result, ...selectDriverState(result) })
  })
  const { ridePhase, isLoading } = useGetRideStatusQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ ridePhase: data?.phase, ...rest })
  })

  let initialRouteName = 'DriverPlanRideScreen' as keyof DriverStackParamList
  if (rideId) {
    if (ridePhase < 0) {
      initialRouteName = 'DriverSelectJoinScreen'
    } else {
      initialRouteName = 'DriverDepartScreen'
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
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
