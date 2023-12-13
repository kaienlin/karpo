/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import { MapsAPI } from '~/services/maps'
import { decodeRoute, type RouteDecoded } from '~/utils/maps'

import { apiSlice } from './api'

const mapsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoute: builder.query<RouteDecoded, Waypoint[]>({
      async queryFn(arg) {
        const waypoints = arg
        const { legs } = await MapsAPI.getRoute(waypoints)

        if (legs) {
          const result = decodeRoute(legs)
          return { data: result }
        }

        return { data: null }
      }
    }),
    getWalkingRoute: builder.query<{ route: LatLng[]; durations: string[] }, Waypoint[]>({
      async queryFn(arg) {
        const waypoints = arg
        const { legs, duration, distanceMeters } = await MapsAPI.getRoute(waypoints, 'WALK')
        if (legs) {
          const result = { route: decodeRoute(legs).route, duration, distanceMeters }
          return { data: result }
        }

        return { data: null }
      }
    })
  })
})

export const { useGetRouteQuery, useGetWalkingRouteQuery } = mapsSlice
