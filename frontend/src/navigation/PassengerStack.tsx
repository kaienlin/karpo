import { createNativeStackNavigator } from '@react-navigation/native-stack'
import RideInfo from '~/screens/PassengerRideInfo'
import SelectRide from '~/screens/PassengerSelectRide'
import WaitingList from '~/screens/PassengerWaitingList'
import { PassengerStackParamList } from '~/types/navigation'
import Arriving from '~/screens/PassengerArriving'


const Stack = createNativeStackNavigator<PassengerStackParamList>()

export default function PassengerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
