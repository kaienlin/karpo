/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import type { DriverActivity, SavedRide, User, Comments } from '~/types/data'

import { apiSlice } from './api'

interface postComments {
    rideId: string
    userId: string,
    rate: number,
    comment: string
  }

const commentsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation<string, postComments>({
      query: ({rideId, userId, rate, comment}) => ({
        url: `/rides/${rideId}/comments`,
        method: 'POST',
        body: {
            userId,
            rate,
            comment,
        }
      })
    }),

  })
})

export const {
  useCreateCommentMutation,
} = commentsSlice
