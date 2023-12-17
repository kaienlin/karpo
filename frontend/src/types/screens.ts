import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type {
  AccountStackParamList,
  AuthStackParamList,
  BottomTabParamList,
  CommonScreensParamList,
  DriverStackParamList,
  HistoryStackParamList,
  MainStackParamList,
  PassengerStackParamList
} from '~/types/navigation'

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

export type UserProfileScreenProps = NativeStackScreenProps<MainStackParamList, 'UserProfileScreen'>

// Driver stack
export type DriverPlanRideScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DriverStackParamList, 'DriverPlanRideScreen'>,
  NativeStackScreenProps<MainStackParamList>
>
export type SelectWaypointScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CommonScreensParamList, 'SelectWaypointScreen'>,
  NativeStackScreenProps<MainStackParamList>
>
export type DriverSelectJoinScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DriverStackParamList, 'DriverSelectJoinScreen'>,
  NativeStackScreenProps<MainStackParamList>
>
export type DriverDepartScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DriverStackParamList, 'DriverDepartScreen'>,
  NativeStackScreenProps<MainStackParamList>
>

// Passenger stack

// History stack

// Account stack
