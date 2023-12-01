// Users
export interface User {
  id: string
  name: string
  email: string
  phoneNumber: string
  avatar: string
  rating: number
  isActive?: boolean
  isSuperuser?: boolean
  isVerified?: boolean
}

export interface UserEditable
  extends Partial<Pick<User, 'name' | 'email' | 'phoneNumber' | 'avatar'>> {}

export interface Activity {
  role: 'driver' | 'passenger'
  rideId: string
}

export interface ActivityItems {
  driverState?: {
    rideId: string
  }
  passengerState?: {
    requestId: string
    joinId?: string
    rideId?: string
  }
}
export interface DriverActivity extends Required<Pick<ActivityItems, 'driverState'>> {}
export interface PassengerActivity extends Required<Pick<ActivityItems, 'passengerState'>> {}

// Drivers
export interface Ride {
  time: Date
  origin: Waypoint
  destination: Waypoint
  numSeats: number
  route: {
    route: LatLng[]
    timestamps: Date[]
  }
}

export interface ScheduleStep {
  requestId: string
  passengerId: string
  time: Date
  location: Waypoint
  status: 'pickup' | 'dropoff'
}

export interface Schedule {
  scheduele: ScheduleStep[]
}

// Passengers
export interface PassengerRequest {
  time: Date
  origin: Waypoint
  destination: Waypoint
  numPassengers: number
}

export type JoinStatus = 'pending' | 'accepted' | 'rejected'
export type MatchStatus = JoinStatus | 'unasked'

export interface Match {
  rideId: string
  pickUpTime: Date
  dropOffTime: Date
  pickUpLocation: Waypoint
  dropOffLocation: Waypoint
  driverId: string
  pickUpDistance: number
  dropOffDistance: number

  driverOrigin: Waypoint
  driverDestination: Waypoint
  numAvailableSeat: number
  otherPassengers: string[]
  fare: number
  driverRoute: {
    route: LatLng[]
    timestamps: Date[]
  }
  proximity: number
  status: MatchStatus

  joinId?: string
}

export interface Join {
  passengerId: string
  joinId: string

  pickUpTime: Date
  dropOffTime: Date

  pickUpLocation: Waypoint
  dropOffLocation: Waypoint

  passengerPickUpDistance: number
  passengerDropOffDistance: number

  numPassengers: number
  fare: number
  proximity: number
}

export interface JoinDetailed extends Join {
  passengerInfo: User
}
