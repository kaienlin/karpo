import { combineReducers, configureStore, type PreloadedState } from '@reduxjs/toolkit'

import authReducer from './auth'
import waypointsReducer from './waypoints'
import rideReducer from './ride'

export const rootReducer = combineReducers({
  auth: authReducer,
  waypoints: waypointsReducer,
  rides: rideReducer
})

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  })
}

export const store = setupStore()

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
