import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import HomeStack from "./HomeStack";
import AuthStack from "./AuthStack";

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "rgb(255, 255, 255)",
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={CustomTheme}>
      <AuthStack />
    </NavigationContainer>
  );
}
