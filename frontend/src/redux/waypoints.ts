import { createSlice } from '@reduxjs/toolkit'

const emptyWaypoint: Waypoint = { title: '', latitude: null, longitude: null }

export const waypointSlice = createSlice({
  name: 'waypoints',
  initialState: [emptyWaypoint, emptyWaypoint],
  reducers: {
    addWaypoint: (state) => {
      state.push(emptyWaypoint)
    },
    removeWaypoint: (state, action) => {
      state.splice(action.payload.index, 1)
    },
    updateWaypoint: (state, action) => {
      state[action.payload.index] = action.payload.location
    }
  }
})

export const { addWaypoint, removeWaypoint, updateWaypoint } =
  waypointSlice.actions

export default waypointSlice.reducer
