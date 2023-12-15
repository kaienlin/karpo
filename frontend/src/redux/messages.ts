/* eslint @typescript-eslint/no-invalid-void-type: 0 */

import type { DriverActivity, SavedRide, User, Comments, Message } from '~/types/data'

import { apiSlice } from './api'

export interface Join {
  passengerId: string
  joinId: string

  pickUpTime: Date
  dropOffTime: Date

  pickUpLocation: Waypoint
  dropOffLocation: Waypoint

  passengerPickUpDistance: number
  passengerDropOffDistance: number

  numPassengers: number
  fare: number
  proximity: number

  status: 'pending' | 'accepted' | 'rejected'
}

export interface JoinDetailed extends Join {
  passengerInfo: User
}


interface GetJoinsResponse<T extends Join> {
  numAvailableSeat: number
  joins: T[]
}

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

    // getJoins: builder.query<GetJoinsResponse<JoinDetailed>, { rideId: string; status: string }>({
    //   async queryFn(arg, api, extraOptions, baseQuery) {
    //     const { rideId, status } = arg
    //     const joinsResult = await baseQuery(`rides/${rideId}/joins?status=${status}`)
    //     if (joinsResult.error) return { error: joinsResult.error }

    //     const { numAvailableSeat, joins } = joinsResult.data as GetJoinsResponse<Join>
    //     const result = await Promise.all(
    //       joins.map(async (join) => {
    //         const { data: passengerInfo } = await baseQuery(`users/${join.passengerId}/profile`)
    //         return {
    //           ...join,
    //           passengerInfo
    //         }
    //       })
    //     )

    //     return { data: { numAvailableSeat, joins: result } }
    //   }
    // }),

  })
})

export const {
    useCreateMessageMutation,
    useGetMessageQuery
} = messagesSlice
