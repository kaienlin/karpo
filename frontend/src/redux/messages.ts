/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import type { DriverActivity, SavedRide, User, Comments, Messages } from '~/types/data'

import { apiSlice } from './api'

interface postMessages {
    rideId: string
    messages: Messages,
  }

const messagesSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMessage: builder.mutation<string, postMessages>({
      query: ({rideId, messages}) => ({
        url: `/rides/${rideId}/messages`,
        method: 'POST',
        body: messages,
      })
    }),

    getMessage: builder.query<Messages, string>({
      query: (rideId) => ({
        url: `/rides/${rideId}/messages`,
        method: 'GET'
      })
    }),

  })
})

export const {
    useCreateMessageMutation,
} = messagesSlice
