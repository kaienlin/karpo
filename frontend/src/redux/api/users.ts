/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import type { ActivityItems, DriverActivity, SavedRide, User, UserProfile } from '~/types/data'

import { apiSlice } from './index'

export const usersSlice = apiSlice
  .enhanceEndpoints({ addTagTypes: ['ActiveItems', 'RidePhase'] })
  .injectEndpoints({
    endpoints: builder => ({
      getCurrentActivity: builder.query<DriverActivity, void>({
        providesTags: ['ActiveItems'],
        query: () => `/users/me/active_items`
      }),
      getUserProfile: builder.query<UserProfile, string>({
        query: userId => `/users/${userId}/profile`
      }),
      getMyProfile: builder.query<User, void>({
        query: () => `/users/me`
      }),
      updateUserProfile: builder.mutation<User, User>({
        query: profile => ({
          url: `/users/me`,
          method: 'PATCH',
          body: profile
        })
      }),
      updateMyProfile: builder.mutation<User, User>({
        query: profile => ({
          url: `/users/me`,
          method: 'PATCH',
          body: profile
        })
      }),
      /* @deprecated */
      getSavedRides: builder.query<{ savedRides: SavedRide[] }, void>({
        query: () => `/users/me/saved_rides`
      }),
      getUserProfileBatch: builder.query<User[], string[]>({
        queryFn: async (arg, api, extraOptions, baseQuery) => {
          const result = await Promise.all(arg.map(userId => baseQuery(`/users/${userId}/profile`)))
          const data = result.map(res => res.data)
          return { data }
        }
      }),
      cancelEvent: builder.mutation<string, void>({
        invalidatesTags: ['ActiveItems', 'RidePhase'],
        query: () => ({
          url: `/users/me/data`,
          method: 'DELETE'
        })
      })
    })
  })

export const {
  useGetCurrentActivityQuery,
  useGetMyProfileQuery,
  useGetUserProfileQuery,
  useUpdateMyProfileMutation,
  useUpdateUserProfileMutation,
  useGetSavedRidesQuery,
  useGetUserProfileBatchQuery,
  useCancelEventMutation
} = usersSlice

export const transformSavedRide = (savedRide: SavedRide) => {
  const { departureTime, origin, destination, intermediates } = savedRide

  const today = new Date()
  const time = new Date(departureTime)
  const currentTime = new Date(`${today.toDateString()} ${time.toTimeString()}`)

  return {
    ...savedRide,
    time: currentTime,
    waypoints: [origin, ...(intermediates ?? []), destination]
  }
}
