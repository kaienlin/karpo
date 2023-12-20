import type { NavigatorScreenParams } from '@react-navigation/native'

type AuthStackParamList = {
  WelcomeScreen: undefined
  SignInScreen: undefined
  SignUpScreen: undefined
}

type CommonScreensParamList = {
  UserProfileScreen: { role: 'driver' | 'passenger'; userId: string }
  ChatScreen: { joinId: string; user1Id: string }
  RateScreen: { userIds: string[], rideId: string}
  SelectWaypointScreen: { waypointIndex: number; waypoint: Waypoint }
  RideCompleteScreen: { userIds: string[], rideId: string }
  RideDetailScreen: { rideId: string, ridePhase: number, passengers: UserInSchedule[] }
}

type MainStackParamList = AuthStackParamList &
  CommonScreensParamList & {
    BottomTab: NavigatorScreenParams<BottomTabParamList>
    DriverStack: NavigatorScreenParams<DriverStackParamList>
    PassengerStack: NavigatorScreenParams<PassengerStackParamList>
    HistoryStack: NavigatorScreenParams<HistoryStackParamList>
    AccountStack: NavigatorScreenParams<AccountStackParamList>
  }

type BottomTabParamList = {
  HomeScreen: undefined
  HistoryScreen: undefined
  AccountScreen: undefined
}

type DriverStackParamList = {
  DriverPlanRideScreen: {
    savedRideIndex: number
    updatedWaypoint?: { index: number; payload: Waypoint }
  }
  DriverSelectJoinScreen: undefined
  DriverDepartScreen: undefined
  RideDetailScreen: { rideId: string, ridePhase: number, passengers: UserInSchedule[] }
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
