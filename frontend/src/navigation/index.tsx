import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import {
  createNativeStackNavigator,
  type NativeStackScreenProps
} from '@react-navigation/native-stack'
import { Icon, TopNavigation, TopNavigationAction, type IconProps } from '@ui-kitten/components'
import * as SecureStore from 'expo-secure-store'

import SignInScreen from '~/screens/SignIn'
import SignUpScreen from '~/screens/SignUp'
import WelcomeScreen from '~/screens/Welcome'
import type { AuthStackParamList, MainStackParamList } from '~/types/navigation'

import { restoreToken } from '../redux/auth'
import { type RootState } from '../redux/store'
import AccountStack from './AccountStack'
import BottomTab from './BottomTab'
import { commonScreens } from './commonScreens'
import DriverStack from './DriverStack'
import PassengerStack from './PassengerStack'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />
const TopHeader = ({ navigation }: NativeStackScreenProps<AuthStackParamList>) => {
  return (
    <TopNavigation
      accessoryLeft={() => <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />}
    />
  )
}

const Stack = createNativeStackNavigator<MainStackParamList>()

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'rgb(255, 255, 255)'
  }
}

export default function AppNavigator() {
  const state = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (state.accessToken) {
      return
    }

    void (async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken')
        dispatch(restoreToken({ accessToken }))
      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

  return (
    <NavigationContainer theme={CustomTheme}>
      <Stack.Navigator>
        {!state.accessToken ? (
          <>
            <Stack.Group
              screenOptions={({ navigation, route }) => ({
                headerLeft: () => <TopHeader navigation={navigation} route={route} />,
                headerShadowVisible: false
              })}
            >
              <Stack.Screen
                name="WelcomeScreen"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="SignInScreen" component={SignInScreen} />
              <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            </Stack.Group>
          </>
        ) : (
          <>
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="BottomTab" component={BottomTab} />
              <Stack.Screen name="DriverStack" component={DriverStack} />
              <Stack.Screen name="PassengerStack" component={PassengerStack} />
              <Stack.Screen name="AccountStack" component={AccountStack} />
              {commonScreens(Stack)}
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
