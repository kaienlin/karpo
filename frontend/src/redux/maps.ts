/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import { decode as decodePolyline } from '@mapbox/polyline'

import { MapsAPI } from '~/services/maps'

import { apiSlice } from './api'

const mapsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoute: builder.query<LatLng[], Waypoint[]>({
      async queryFn(arg) {
        const waypoints = arg
        const routeResult = await MapsAPI.getRoute(waypoints)

        const result = decodePolyline(routeResult.polyline).map(([lat, lng]: number[]) => ({
          latitude: lat,
          longitude: lng
        }))

        return { data: result }
      }
    })
  })
})

export const { useGetRouteQuery } = mapsSlice
