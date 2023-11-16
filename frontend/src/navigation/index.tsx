import { NavigationContainer, DefaultTheme } from '@react-navigation/native'

import AuthStack from './AuthStack'
import HomeStack from './HomeStack'

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'rgb(255, 255, 255)'
  }
}

export default function AppNavigator () {
  return (
    <NavigationContainer theme={CustomTheme}>
      {/* <AuthStack /> */}
      <HomeStack />
    </NavigationContainer>
  )
}
