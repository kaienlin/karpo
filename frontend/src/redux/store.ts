import {
  combineReducers,
  configureStore,
  type AnyAction,
  type PreloadedState
} from '@reduxjs/toolkit'

import Reactotron from '../../ReactotronConfig'
import { apiSlice } from './api'
import authReducer from './auth'
import waypointsReducer from './waypoints'

export const combinedReducer = combineReducers({
  auth: authReducer,
  waypoints: waypointsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer
})

export const rootReducer = (state: RootState, action: AnyAction) => {
  if (action.type === 'auth/signOut') {
    state = {} as RootState
  }
  return combinedReducer(state, action)
}

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
    ...(__DEV__ && { enhancers: [Reactotron.createEnhancer()] }) // should comment this line when build, otherwise will cause invalid header error in prod build
  })
}

export const store = setupStore()

export type RootState = ReturnType<typeof combinedReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
