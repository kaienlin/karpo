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
    time: string
  }

const messagesSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMessage: builder.mutation<string, postMessages>({
      query: ({joinId, userId, content, time}) => ({
        url: `/rides/${joinId}/messages`,
        method: 'POST',
        body: {"chat_record":{
          userId,
          content,
          time
        }},
      })
    }),

    getMessage: builder.query({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const { joinId, fromTime } = arg
        const chatResult = await baseQuery(`/rides/${joinId}/messages?from_time=${fromTime}`)
        if (chatResult.error) return { error: chatResult.error }

        const { chatRecords } = chatResult.data as GetMessagesResponse<Message>

        return { data: chatRecords }
      }

    }),

    // getMessage: builder.query({      
    //   query: ({joinId, fromTime}) =>({
    //     url: `/rides/${joinId}/messages?from_time=${fromTime}`,
    //     method: 'GET',
    //   })
    // }),

  })
})

export const {
    useCreateMessageMutation,
    useGetMessageQuery
} = messagesSlice
