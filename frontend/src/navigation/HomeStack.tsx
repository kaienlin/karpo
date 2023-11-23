import { createNativeStackNavigator } from '@react-navigation/native-stack'

import BottomTab from './BottomTab'
import HomeScreen from '../screens/Home'
import SelectLocation from '../screens/SelectLocation'
import SelectRide from '../screens/SelectRide'
import RideInfo from '../screens/RideInfo'

const Stack = createNativeStackNavigator<HomeStackParamList>()

export default function HomeStack () {
  return (
    <Stack.Navigator initialRouteName="BottomTab">
      <Stack.Screen
        name="BottomTab"
        component={BottomTab}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectLocationScreen"
        component={SelectLocation}
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
    </Stack.Navigator>
  )
}
