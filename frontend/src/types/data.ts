// Users
export interface User {
  id: string
  email: string
  isActive?: boolean
  isSuperuser?: boolean
  isVerified?: boolean
  name: string
  phoneNumber: string
  rating: number
  avatar: string
  
}

export interface UserProfile {
  name: string
  rating: number
  avatar: string
  createdAt: string
  numRequests: number
  numRides: number
  
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
export interface RideBase {
  departureTime: Date
  origin: Waypoint
  destination: Waypoint
  intermediates?: Waypoint[]
  numSeats: number
}

export interface RideRequest extends RideBase {
  route: {
    steps: Array<Array<[number, number]>>
    durations: number[]
  }
}

export interface RideResponse extends RideBase {
  routeWithTime: {
    route: Array<[number, number]>
    timestamps: number[]
  }
}

export interface SavedRide extends RideBase {
  label: string
}

export interface ScheduleStep {
  joinId: string
  requestId: string
  passengerId: string
  time: Date
  location: Waypoint
  status: 'pick_up' | 'drop_off'
}

export interface Schedule {
  schedule: ScheduleStep[]
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
  
  driverInfo: User
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

  status: 'pending' | 'accepted' | 'rejected'
}

export interface JoinDetailed extends Join {
  passengerInfo: User
}


export interface RideStatus {
  driverPosition: {
    latitude: number
    longitude: number
  }
  phase: number
}
=======
// Comments
export interface Comments {
  userId: string,
  rate: number,
  comment: string
}

// Messages
export interface Message {
  userId: string
  content: string
  time: Date
}