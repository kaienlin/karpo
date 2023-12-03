/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import { MapsAPI } from '~/services/maps'
import { flattenLegs } from '~/utils/maps'

import { apiSlice } from './api'

const mapsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoute: builder.query<{ route: LatLng[]; durations: string[] }, Waypoint[]>({
      async queryFn(arg) {
        const waypoints = arg
        const { legs } = await MapsAPI.getRoute(waypoints)
        const result = flattenLegs(legs)

        return { data: result }
      }
    })
  })
})

export const { useGetRouteQuery } = mapsSlice
