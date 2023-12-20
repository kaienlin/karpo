import { View } from 'react-native'
import { HeaderBackButton } from '@react-navigation/elements'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import RideInfo from '~/screens/PassengerRideInfo'
import SelectRide from '~/screens/PassengerSelectRide'
import WaitingList from '~/screens/PassengerWaitingList'
import { Match } from '~/types/data'
import { PassengerStackParamList } from '~/types/navigation'
import SelectWaypoint from '~/screens/SelectWaypoint'
import Arriving from '~/screens/PassengerArriving'
import UserProfile from '~/screens/UserProfile'

const Stack = createNativeStackNavigator<PassengerStackParamList>()

export default function PassengerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SelectRideScreen"
        component={SelectRide}
      />
      <Stack.Screen 
        name="RideInfoScreen" 
        component={RideInfo} 
      />
      <Stack.Screen
        name="WaitingListScreen"
        component={WaitingList}
      />
      <Stack.Screen 
        name="ArrivingScreen"
        component={Arriving}
      />
    </Stack.Navigator>
  )
}
