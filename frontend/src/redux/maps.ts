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
    })
  })
})

export const { useGetRouteQuery } = mapsSlice
