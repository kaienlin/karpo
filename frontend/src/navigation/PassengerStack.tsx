import { HeaderBackButton } from '@react-navigation/elements'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View } from 'react-native'
import { QueryProps } from '~/components/QueryBlock'
import RideInfo from '~/screens/PassengerRideInfo'
import SelectRide from '~/screens/PassengerSelectRide'
import WaitingList from '~/screens/PassengerWaitingList'

const Stack = createNativeStackNavigator<PassengerStackParamList>()

export type PassengerStackParamList = {
  SelectRideScreen: undefined
  RideInfoScreen: {
    rideId: string
    query: QueryProps
  }
  WaitingListScreen: {
    query: QueryProps
  }
}

export default function PassengerStack() {
  return (
    <Stack.Navigator>
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
        options={({ navigation }) => ({
          title: '等待回應',
          headerLeft: () => (
            <View style={{ marginLeft: -12, marginRight: 12 }}>
              <HeaderBackButton 
                onPress={() => navigation.navigate('SelectRideScreen')}
              />
            </View>
          ),
        })}
      />
    </Stack.Navigator>
  )
}
