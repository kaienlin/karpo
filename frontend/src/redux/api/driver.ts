import type { Join, JoinDetailed, Ride, Schedule } from '~/types/data'

import { apiSlice } from './index'

interface GetJoinsResponse<T extends Join> {
  numAvailableSeat: number
  joins: T[]
}

interface RespondJoinRequest {
  rideId: string
  joinId: string
  action: 'accept' | 'reject'
}

interface UpdateDriverStatusRequest {
  rideId: string
  position: LatLng
  phase: number
}

export const driverSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
    createRide: builder.mutation<{ rideId: string }, Ride>({
      query: (ride) => ({
        url: `/rides`,
        method: 'POST',
        body: ride
      })
    }),
    respondJoin: builder.mutation<string, RespondJoinRequest>({
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
    updateStatus: builder.mutation<string, UpdateDriverStatusRequest>({
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
