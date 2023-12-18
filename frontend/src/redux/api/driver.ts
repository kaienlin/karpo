import { createSelector } from '@reduxjs/toolkit'

import type {
  ActivityItems,
  Join,
  JoinDetailed,
  RideRequest,
  RideResponse,
  Schedule
} from '~/types/data'

import { apiSlice } from './index'
import { mapsSlice } from './maps'
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

interface RespondJoinsRequest {
  rideId: string
  action: 'accept' | 'reject'
  joinIds: string[]
}

interface UpdateDriverStatusRequest {
  rideId: string
  position: LatLng
  phase: number
}

export const driverSlice = apiSlice
  .enhanceEndpoints({ addTagTypes: ['Joins', 'Schedule', 'RidePhase'] })
  .injectEndpoints({
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
              const { data: passengerInfo } = await api.dispatch(
                usersSlice.endpoints.getUserProfile.initiate(join.passengerId)
              )
              const { data: pickUpLocationDescription } = await api.dispatch(
                mapsSlice.endpoints.getPlaceDescription.initiate(join.pickUpLocation)
              )
              const { data: dropOffLocationDescription } = await api.dispatch(
                mapsSlice.endpoints.getPlaceDescription.initiate(join.dropOffLocation)
              )

              join.pickUpLocation.description = pickUpLocationDescription
              join.dropOffLocation.description = dropOffLocationDescription

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
        providesTags: ['Schedule'],
        queryFn: async (arg, api, extraOptions, baseQuery) => {
          const rideId = arg
          const scheduleResult = await baseQuery(`rides/${rideId}/schedule`)
          if (scheduleResult.error) return { error: scheduleResult.error }

          const { schedule } = scheduleResult.data as Schedule
          const scheduleWithDescription = await Promise.all(
            schedule.map(async step => {
              const { data: passengerInfo } = await api.dispatch(
                usersSlice.endpoints.getUserProfile.initiate(step.passengerId)
              )
              const { data: description } = await api.dispatch(
                mapsSlice.endpoints.getPlaceDescription.initiate(step.location)
              )

              return {
                ...step,
                passengerInfo,
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
      /* @deprecated: prefer respondJoins that support multiple joins */
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
      respondJoins: builder.mutation<string, RespondJoinsRequest>({
        invalidatesTags: ['Joins', 'Schedule'],
        queryFn: async (arg, api, extraOptions, baseQuery) => {
          const { rideId, action, joinIds } = arg
          try {
            await Promise.all(
              joinIds.map(async joinId => {
                await baseQuery({
                  url: `/rides/${rideId}/joins/${joinId}/status`,
                  method: 'PUT',
                  body: { action }
                })
              })
            )
            return { data: 'success' }
          } catch (error) {
            return { error }
          }
        },
        onQueryStarted: async ({ rideId, action, joinIds }, { dispatch, queryFulfilled }) => {
          const patchResult = dispatch(
            driverSlice.util.updateQueryData('getJoins', { rideId, status: 'pending' }, draft => {
              draft.joins = draft.joins.filter(({ joinId }) => !joinIds.includes(joinId))
            })
          )
          queryFulfilled.catch(patchResult.undo)
        }
      }),
      updateStatus: builder.mutation<string, UpdateDriverStatusRequest>({
        invalidatesTags: ['RidePhase'],
        query: ({ rideId, position, phase }) => ({
          url: `/rides/${rideId}/status`,
          method: 'PATCH',
          body: {
            driverPosition: position,
            phase
          }
        })
        // onQueryStarted: async ({ rideId, phase }, { dispatch, queryFulfilled }) => {
        //   const patchResult = dispatch(
        //     passengerSlice.util.updateQueryData('getRideStatus', { rideId }, draft => {
        //       draft.phase = phase
        //     })
        //   )
        //   queryFulfilled.catch(patchResult.undo)
        // }
      })
    })
  })

export const {
  useCreateRideMutation,
  useGetRideQuery,
  useGetJoinsQuery,
  useGetScheduleQuery,
  useRespondJoinMutation,
  useRespondJoinsMutation,
  useUpdateStatusMutation
} = driverSlice

export const selectDriverState = createSelector(
  (res: { data: ActivityItems }) => res.data,
  data => data?.driverState
)

export const selectRideRoute = createSelector(
  (res: { data: { ride: RideResponse } }) => res.data,
  // note: backend uses [longitude, latitude]
  data => data?.ride?.routeWithTime?.route.map(([longitude, latitude]) => ({ latitude, longitude }))
)

export const selectAcceptedPassengers = createSelector(
  (res: { data: GetJoinsResponse<JoinDetailed> }) => res.data,
  data => ({
    ...data,
    passengers: data?.joins.map(join => ({
      ...join.passengerInfo,
      numPassengers: join.numPassengers
    }))
  })
)
