type HomeStackParamList = {
  BottomTab: undefined
  HomeScreen: undefined
  SelectLocationScreen: { waypointIndex: number }
  SelectRideScreen: undefined
  RideInfoScreen: {
    rating: number,
    vacuumSeat: number,
    rideStatus: string,
    departTime: string,
    arrivalTime: string,
    price: number
  }
}

type BottomTabParamList = {
  HomeScreen: undefined
  HistoryScreen: undefined
  AccountScreen: undefined
}
