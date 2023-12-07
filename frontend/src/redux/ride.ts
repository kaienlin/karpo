import { createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

const initialState = [
  {
    id: '1',
    responseStatus: 'idle',
    departTime: '10:15',
    arrivalTime: '10:35',
    price: 300,
    rating: 5.0,
    vacuumSeat: 1,
    rideStatus: '很順路',
    driverOrigin: '台積電 12 廠',
    driverDestination: '竹北市光明六路 16 號',
    origin2route: 0.3,
    destination2route: 0.7,
  },
  {
    id: '2',
    responseStatus: 'idle',
    departTime: '10:30',
    arrivalTime: '10:56',
    price: 280,
    rating: 4.8,
    vacuumSeat: 1,
    rideStatus: '非常順路',
    driverOrigin: '園區二路 57 號',
    driverDestination: '竹北市光明六路 116 號',
    origin2route: 0.3,
    destination2route: 0.7
  },
  {
    id: '3',
    responseStatus: 'idle',
    departTime: '10:44',
    arrivalTime: '11:08',
    price: 320,
    rating: 4.5,
    vacuumSeat: 1,
    rideStatus: '有點繞路',
    driverOrigin: '實驗中學',
    driverDestination: '博愛國小',
    origin2route: 0.3,
    destination2route: 0.7
  },
  {
    id: '4',
    responseStatus: 'idle',
    departTime: '10:44',
    arrivalTime: '11:08',
    price: 320,
    rating: 4.5,
    vacuumSeat: 1,
    rideStatus: '有點繞路',
    driverOrigin: '實驗中學',
    driverDestination: '博愛國小',
    origin2route: 0.3,
    destination2route: 0.7
  }
]

const rideSlice = createSlice({
  name: 'rides',
  initialState,
  reducers: {
    changeStatus: (state, action) => {
      const ride = state.find((ride) => ride.id === action.payload.id)
      if(ride !== undefined) {
        if(ride.responseStatus === 'idle') ride['responseStatus'] = 'waiting'
        else ride['responseStatus'] = 'idle'
      }
    }
  }
})

export const { changeStatus } = rideSlice.actions

export default rideSlice.reducer

const rides = (state: RootState) => state.rides
export const IdleRidesSelector = createSelector([rides], (rides) => {
  return rides.filter(ride => ride.responseStatus === 'idle')
})
export const WaitingRidesSelector = createSelector([rides], (rides) => {
  return rides.filter(ride => ride.responseStatus === 'waiting')
})