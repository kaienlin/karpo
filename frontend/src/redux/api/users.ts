/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import type { DriverActivity, SavedRide, User, UserProfile } from '~/types/data'

import { apiSlice } from './index'

export const usersSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentActivity: builder.query<DriverActivity, void>({
      query: () => `/users/me/active_items`
    }),
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => `/users/${userId}/profile`
    }),
    getMyProfile: builder.query<User, void>({
      query: () => `/users/me`
    }),
    updateUserProfile: builder.mutation<User, User>({
      query: (profile) => ({
        url: `/users/me`,
        method: 'PATCH',
        body: profile
      })
    }),
    updateMyProfile: builder.mutation<User, User>({
      query: (profile) => ({
        url: `/users/me`,
        method: 'PATCH',
        body: profile
      })
    }),
    getSavedRides: builder.query<{ savedRides: SavedRide[] }, void>({
      query: () => `/users/me/saved_rides`
    }),
    getUserProfileBatch: builder.query<User[], string[]>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const result = await Promise.all(arg.map((userId) => baseQuery(`/users/${userId}/profile`)))
        const data = result.map((res) => res.data)
        return { data }
      }
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
  useGetUserProfileBatchQuery
} = usersSlice
