/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import type { Message } from '~/types/data'

import { apiSlice } from './api'


interface GetMessagesResponse<T extends Message> {
  chatRecords: T[]
}


interface postMessages {
    joinId: string
    userId: string
    content: string
    time: Date
  }

const messagesSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMessage: builder.mutation<string, postMessages>({
      query: ({joinId, userId, content, time}) => ({
        url: `/rides/${joinId}/messages`,
        method: 'POST',
        body: {
          userId,
          content,
          time
        },
      })
    }),

    getMessage: builder.query({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const { joinId } = arg
        const chatResult = await baseQuery(`/rides/${joinId}/messages`)
        if (chatResult.error) return { error: chatResult.error }

        const { chatRecords } = chatResult.data as GetMessagesResponse<Message>

        return { data: chatRecords }
      }

    }),

  })
})

export const {
    useCreateMessageMutation,
    useGetMessageQuery
} = messagesSlice
