/* @deprecated: replaced by MainStack */
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from '../screens/Home'
import RideInfo from '../screens/RideInfo'
import SelectLocation from '../screens/SelectLocation'
import SelectRide from '../screens/SelectRide'
import BottomTab from './BottomTab'

const Stack = createNativeStackNavigator<HomeStackParamList>()

export default function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="BottomTab">
      <Stack.Screen name="BottomTab" component={BottomTab} options={{ headerShown: false }} />
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
      <Stack.Screen name="RideInfoScreen" component={RideInfo} options={{ title: '共乘資訊' }} />
    </Stack.Navigator>
  )
}
