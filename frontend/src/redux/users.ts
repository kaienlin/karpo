/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import type { DriverActivity, User } from '~/types/data'

import { apiSlice } from './api'

const usersSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentActivity: builder.query<DriverActivity, void>({
      query: () => `/users/me/active_items`
    }),
    getUserProfile: builder.query<User, string>({
      query: (userId) => `/users/${userId}`
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
    })
  })
})

export const {
  useGetCurrentActivityQuery,
  useGetMyProfileQuery,
  useGetUserProfileQuery,
  useUpdateMyProfileMutation,
  useUpdateUserProfileMutation
} = usersSlice
