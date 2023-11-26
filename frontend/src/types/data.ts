export interface JoinInfo {
  joinId: string
  passengerId: string

  pickupTime: Date
  dropoffTime: Date
  pickupLocation: Waypoint
  dropoffLocation: Waypoint
  proximity: number

  numPassenger: number
  fare: number
}
