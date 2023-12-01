import type { Join, JoinDetailed, Ride, Schedule } from '~/types/data'

import { apiSlice } from './api'

interface GetJoinsResponse {
  numAvailableSeat: number
  joins: Join[] | JoinDetailed[]
}

export const driverSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRide: builder.mutation<{ rideId: string }, { ride: Ride }>({
      query: (ride) => ({
        url: `/rides`,
        method: 'POST',
        body: ride
      })
    }),
    getRide: builder.query<{ ride: Ride }, string>({
      query: (rideId) => ({
        url: `/rides/${rideId}`,
        method: 'GET'
      })
    }),
    getJoins: builder.query<GetJoinsResponse, { rideId: string; status: string }>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const { rideId, status } = arg
        const joinsResult = await baseQuery(`rides/${rideId}/joins?status=${status}`)
        if (joinsResult.error) return { error: joinsResult.error }

        const { numAvailableSeat, joins } = joinsResult.data as GetJoinsResponse
        const result = await Promise.all(
          joins.map(async (join) => {
            const { data: passengerInfo } = await baseQuery(`users/${join.passengerId}`)
            return {
              ...join,
              passengerInfo
            }
          })
        )

        return { data: { numAvailableSeat, joins: result } }
      }
    }),
    getSchedule: builder.query<Schedule, string>({
      query: (rideId) => ({
        url: `/rides/${rideId}/schedule`,
        method: 'GET'
      })
    }),
    acceptJoin: builder.mutation<string, { rideId: string; joinId: string }>({
      query: ({ rideId, joinId }) => ({
        url: `/rides${rideId}/joins/${joinId}/accept`,
        method: 'PUT'
      })
    }),
    updatePosition: builder.mutation<string, { rideId: string; position: LatLng }>({
      query: ({ rideId, position }) => ({
        url: `/rides/${rideId}/position`,
        method: 'PUT',
        body: {
          position
        }
      })
    })
  })
})

export const {
  useCreateRideMutation,
  useGetRideQuery,
  useGetJoinsQuery,
  useGetScheduleQuery,
  useAcceptJoinMutation
} = driverSlice
