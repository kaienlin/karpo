import type { Join, JoinDetailed, Ride, Schedule } from '~/types/data'

import { apiSlice } from './api'

interface GetJoinsResponse<T extends Join> {
  numAvailableSeat: number
  joins: T[]
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
    getJoins: builder.query<GetJoinsResponse<JoinDetailed>, { rideId: string; status: string }>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const { rideId, status } = arg
        const joinsResult = await baseQuery(`rides/${rideId}/joins?status=${status}`)
        if (joinsResult.error) return { error: joinsResult.error }

        const { numAvailableSeat, joins } = joinsResult.data as GetJoinsResponse<Join>
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
    respondJoin: builder.mutation<
      string,
      { rideId: string; joinId: string; action: 'accept' | 'reject' }
    >({
      query: ({ rideId, joinId, action }) => ({
        url: `/rides/${rideId}/joins/${joinId}/status`,
        method: 'PUT',
        body: {
          action
        }
      }),
      onQueryStarted: async ({ rideId, joinId, action }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          driverSlice.util.updateQueryData('getJoins', { rideId, status: 'pending' }, (draft) => {
            const target = draft.joins.find(({ joinId: id }) => id === joinId)
            target.status = action === 'accept' ? 'accepted' : 'rejected'
          })
        )
        queryFulfilled.catch(patchResult.undo)
      }
    }),
    updateStatus: builder.mutation<string, { rideId: string; position: LatLng; phase: number }>({
      query: ({ rideId, position, phase }) => ({
        url: `/rides/${rideId}/status`,
        method: 'PATCH',
        body: {
          driverPosition: position,
          phase
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
  useRespondJoinMutation,
  useUpdateStatusMutation
} = driverSlice
