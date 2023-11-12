import { createSlice } from "@reduxjs/toolkit";

export const waypointSlice = createSlice({
  name: "waypoints",
  initialState: [
    { title: "", lat: null, lng: null },
    { title: "", lat: null, lng: null },
  ],
  reducers: {
    addWaypoint: (state) => {
      state.push({ title: "", lat: null, lng: null });
    },
    removeWaypoint: (state, action) => {
      state.splice(action.payload.index, 1);
    },
    updateWaypoint: (state, action) => {
      state[action.payload.index] = action.payload.location;
    },
  },
});

export const { addWaypoint, removeWaypoint, updateWaypoint } =
  waypointSlice.actions;

export default waypointSlice.reducer;
