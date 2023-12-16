import { combineReducers, configureStore, type PreloadedState } from '@reduxjs/toolkit'

import Reactotron from '../../ReactotronConfig'
import { apiSlice } from './api'
import authReducer from './auth'
import rideReducer from './ride'
import waypointsReducer from './waypoints'

export const rootReducer = combineReducers({
  auth: authReducer,
  waypoints: waypointsReducer,
  rides: rideReducer,
  [apiSlice.reducerPath]: apiSlice.reducer
})

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    enhancers: [Reactotron.createEnhancer()]
  })
}

export const store = setupStore()

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
