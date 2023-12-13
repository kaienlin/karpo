import { View } from 'react-native'
import { HeaderBackButton } from '@react-navigation/elements'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import RideInfo from '~/screens/PassengerRideInfo'
import SelectRide from '~/screens/PassengerSelectRide'
import WaitingList from '~/screens/PassengerWaitingList'
import { Match } from '~/types/data'
import { PassengerStackParamList } from '~/types/navigation'
import SelectWaypoint from '~/screens/SelectWaypoint'

const Stack = createNativeStackNavigator<PassengerStackParamList>()

export default function PassengerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name='SelectWaypointScreen'
        component={SelectWaypoint}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectRideScreen"
        component={SelectRide}
        options={{ title: '選擇共乘' }}
      />
      <Stack.Screen 
        name="RideInfoScreen" 
        component={RideInfo} 
        options={{ title: '共乘資訊' }} 
      />
      <Stack.Screen
        name="WaitingListScreen"
        component={WaitingList}
        options={({ route, navigation }) => ({
          title: '等待回應',
          headerLeft: () => (
            <View style={{ marginLeft: -12, marginRight: 12 }}>
              <HeaderBackButton onPress={() => navigation.navigate(
                'SelectRideScreen',
                { requestId: route.params.requestId }
              )} />
            </View>
          )
        })}
      />
    </Stack.Navigator>
  )
}
