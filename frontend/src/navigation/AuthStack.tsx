import {
  createNativeStackNavigator,
  type NativeStackScreenProps
} from '@react-navigation/native-stack'
import { Icon, TopNavigation, TopNavigationAction, type IconProps } from '@ui-kitten/components'

import SignInScreen from '../screens/SignIn'
import SignUpScreen from '../screens/SignUp'
import WelcomeScreen from '../screens/Welcome'

export type AuthStackParamList = {
  WelcomeScreen: undefined
  SignInScreen: undefined
  SignUpScreen: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />
const TopHeader = ({ navigation }: NativeStackScreenProps<AuthStackParamList>) => {
  return (
    <TopNavigation
      accessoryLeft={() => <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />}
    />
  )
}

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="WelcomeScreen"
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
    </Stack.Navigator>
  )
}
