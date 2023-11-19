import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Icon,
  TopNavigationAction,
  TopNavigation,
} from "@ui-kitten/components";

import WelcomeScreen from "../screens/Welcome";
import SignInScreen from "../screens/SignIn";
import SignUpScreen from "../screens/SignUp";

const Stack = createNativeStackNavigator();

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

function TopHeader({ navigation }) {
  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );

  return <TopNavigation accessoryLeft={BackAction} />;
}

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={({ navigation }) => ({
        headerLeft: () => <TopHeader navigation={navigation} />,
        headerShadowVisible: false,
      })}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
