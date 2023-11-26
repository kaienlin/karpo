/**
 * @deprecated Now use route.params to pass data between screens
 */

import { createSlice } from '@reduxjs/toolkit'

const emptyWaypoint: Waypoint = { title: '', latitude: null, longitude: null }

const initialState: Waypoint[] = [emptyWaypoint, emptyWaypoint]

export const waypointSlice = createSlice({
  name: 'waypoints',
  initialState,
  reducers: {
    addWaypoint: (state) => {
      state.push(emptyWaypoint)
    },
    removeWaypoint: (state, action) => {
      const { index } = action.payload
      state.splice(index, 1)
    },
    updateWaypoint: (state, action) => {
      const { index, location } = action.payload
      state[index] = location
    },
    clearWaypoints: () => {
      return initialState
    },
    restoreWaypoints: (state, action) => {
      const { origin, destination, waypoints } = action.payload
      if (waypoints === undefined) {
        return [origin, destination]
      }
      return [origin, ...waypoints, destination]
    }
  }
})

export const { addWaypoint, removeWaypoint, updateWaypoint, clearWaypoints, restoreWaypoints } =
  waypointSlice.actions

export default waypointSlice.reducer
