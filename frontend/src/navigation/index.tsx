import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'

import { restoreToken } from '../redux/auth'
import { type RootState } from '../redux/store'
import AuthStack from './AuthStack'
import MainStack from './MainStack'

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
    void (async () => {
      try {
        const userToken = await SecureStore.getItemAsync('userToken')
        dispatch(restoreToken({ token: userToken }))
      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

  return (
    <NavigationContainer theme={CustomTheme}>
      {state.userToken === null ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  )
}
