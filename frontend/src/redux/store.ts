import { combineReducers, configureStore, type PreloadedState } from '@reduxjs/toolkit'

import { apiSlice } from './api'
import authReducer from './auth'
import rideReducer from './ride'
import waypointsReducer from './waypoints'

export const rootReducer = combineReducers({
  auth: authReducer,
  waypoints: waypointsReducer,
  rides: rideReducer
})

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware)
  })
}

export const store = setupStore()

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
