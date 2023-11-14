import { configureStore } from '@reduxjs/toolkit'
import waypointsReducer from './waypoints'

export const store = configureStore({
  reducer: {
    waypoints: waypointsReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
