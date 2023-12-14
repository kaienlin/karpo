import type { NavigatorScreenParams } from '@react-navigation/native'

/* @deprecated: replaced by MainStackParamList */
type HomeStackParamList = {
  BottomTab: undefined
  HomeScreen: undefined
  SelectLocationScreen: { waypointIndex: number }
  SelectRideScreen: undefined
  RideInfoScreen: {
    rating: number
    vacuumSeat: number
    rideStatus: string
    departTime: string
    arrivalTime: string
    price: number
  }
}

type AuthStackParamList = {
  WelcomeScreen: undefined
  SignInScreen: undefined
  SignUpScreen: undefined
}

type MainStackParamList = {
  BottomTab: NavigatorScreenParams<BottomTabParamList>
  DriverStack: NavigatorScreenParams<DriverStackParamList>
  PassengerStack: NavigatorScreenParams<PassengerStackParamList>
  HistoryStack: NavigatorScreenParams<HistoryStackParamList>
  AccountStack: NavigatorScreenParams<AccountStackParamList>
  UserProfileScreen: { role: 'driver' | 'passenger'; userId: string }
  ChatScreen: { rideId: string }
  SelectWaypointScreen: { waypointIndex: number; waypoint: Waypoint }
  RideCompleteScreen: { userIds: string[] }
}

type BottomTabParamList = {
  HomeScreen: undefined
  HistoryScreen: undefined
  AccountScreen: undefined
}

type DriverStackParamList = {
  DriverPlanRideScreen: { savedRideIndex: number }
  SelectWaypointScreen: { waypointIndex: number; waypoint: Waypoint }
  DriverSelectJoinScreen: undefined
  DriverDepartScreen: undefined
  ChatScreen: { rideId: string }
  RideCompleteScreen: undefined
}

type PassengerStackParamList = {
  SelectRideScreen: {
    requestId: string
  }
  RideInfoScreen: {
    requestId: string
    match: Match
  }
  WaitingListScreen: {
    requestId: string
  }
  ArrivingScreen: {
    ride: Match
  }
}

type HistoryStackParamList = {
  // TODO:
}

type AccountStackParamList = {
  AccountScreen: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
