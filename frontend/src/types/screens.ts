import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { AuthStackParamList } from '../navigation/AuthStack'
import type { BottomTabParamList } from '../navigation/BottomTab'
import type { DriverStackParamList } from '../navigation/DriverStack'
import type { MainStackParamList } from '../navigation/MainStack'

// Auth stack
export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'WelcomeScreen'>
export type SignInScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignInScreen'>
export type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUpScreen'>

// Main tab
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'HomeScreen'>,
  NativeStackScreenProps<MainStackParamList>
>
export type HistoryScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'HistoryScreen'>,
  NativeStackScreenProps<MainStackParamList>
>
export type AccountScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'AccountScreen'>,
  NativeStackScreenProps<MainStackParamList>
>

// Driver stack
export type PlanRideScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DriverStackParamList, 'PlanRideScreen'>,
  NativeStackScreenProps<MainStackParamList>
>
export type SelectLocationScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DriverStackParamList, 'SelectLocationScreen'>,
  NativeStackScreenProps<MainStackParamList>
>
export type RideDepartScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DriverStackParamList, 'RideDepartScreen'>,
  NativeStackScreenProps<MainStackParamList>
>

// Passenger stack

// History stack

// Account stack
