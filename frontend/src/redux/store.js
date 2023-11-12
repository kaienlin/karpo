import { configureStore } from "@reduxjs/toolkit";
import waypointsReducer from "./waypoints";

export const store = configureStore({
  reducer: {
    waypoints: waypointsReducer,
  },
});
