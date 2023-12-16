import { MapsAPI } from '~/services/maps'
import type { Join, JoinDetailed, RideRequest, RideResponse, Schedule } from '~/types/data'

import { apiSlice } from './index'
import { usersSlice } from './users'

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

export const driverSlice = apiSlice.enhanceEndpoints({ addTagTypes: ['Joins'] }).injectEndpoints({
  endpoints: builder => ({
    getRide: builder.query<{ ride: RideResponse }, string>({
      query: rideId => ({
        url: `/rides/${rideId}`,
        method: 'GET'
      })
    }),
    getJoins: builder.query<GetJoinsResponse<JoinDetailed>, { rideId: string; status: string }>({
      providesTags: ['Joins'],
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const { rideId, status } = arg
        const joinsResult = await baseQuery(`rides/${rideId}/joins?status=${status}`)
        if (joinsResult.error) return { error: joinsResult.error }

        const { numAvailableSeat, joins } = joinsResult.data as GetJoinsResponse<Join>
        const result = await Promise.all(
          joins.map(async join => {
            const { data: passengerInfo } = await baseQuery(`users/${join.passengerId}/profile`)
            join.pickUpLocation.description = await MapsAPI.getPlaceTitle(join.pickUpLocation)
            join.dropOffLocation.description = await MapsAPI.getPlaceTitle(join.dropOffLocation)

            return {
              ...join,
              passengerInfo: {
                id: join.passengerId,
                ...passengerInfo
              }
            }
          })
        )

        return { data: { numAvailableSeat, joins: result } }
      }
    }),
    getSchedule: builder.query<Schedule, string>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const rideId = arg
        const scheduleResult = await baseQuery(`rides/${rideId}/schedule`)
        if (scheduleResult.error) return { error: scheduleResult.error }

        const { schedule } = scheduleResult.data as Schedule
        const scheduleWithDescription = await Promise.all(
          schedule.map(async step => {
            const description = await MapsAPI.getPlaceTitle(step.location)

            return {
              ...step,
              location: {
                ...step.location,
                description
              }
            }
          })
        )

        return { data: { schedule: scheduleWithDescription } }
      }
    }),
    createRide: builder.mutation<{ rideId: string }, RideRequest>({
      query: ride => ({
        url: `/rides/`,
        method: 'POST',
        body: ride
      }),
      onQueryStarted: async (ride, { dispatch, queryFulfilled }) => {
        try {
          const {
            data: { rideId }
          } = await queryFulfilled
          const patchResult = dispatch(
            usersSlice.util.upsertQueryData('getCurrentActivity', undefined, {
              driverState: { rideId }
            })
          )
        } catch {}
      }
    }),
    respondJoin: builder.mutation<string, RespondJoinRequest>({
      invalidatesTags: ['Joins'],
      query: ({ rideId, joinId, action }) => ({
        url: `/rides/${rideId}/joins/${joinId}/status`,
        method: 'PUT',
        body: {
          action
        }
      }),
      onQueryStarted: async ({ rideId, joinId, action }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          driverSlice.util.updateQueryData('getJoins', { rideId, status: 'pending' }, draft => {
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
