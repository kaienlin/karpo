import { Match } from "~/types/data";
import { apiSlice } from "./api";

const passengerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRequest: builder.mutation({
      query: (passengerQuery) => ({
        url: `/requests`,
        method: 'POST',
        body: passengerQuery
      })
    }),
    getRequest: builder.query({
      query: (requestId) => ({
        url: `/requests/${requestId}`,
        method: 'GET'
      })
    }),
    getMatches: builder.query({
      query: (requestId) => ({
        url: `/requests/${requestId}/matches`,
        method: 'GET'
      })
    }),
    createJoinRequest: builder.mutation({
      query: ({ rideId, requestId }) => ({
        url: `/rides/${rideId}/joins`,
        method: 'POST',
        body: {requestId}
      }),
      // https://redux.js.org/tutorials/essentials/part-8-rtk-query-advanced#implementing-optimistic-updates
      async onQueryStarted({ rideId, requestId }, { dispatch, queryFulfilled }) {
        // `updateQueryData` requires the endpoint name and cache key arguments,
        // so it knows which piece of cache state to update
        const patchResult = dispatch(
          passengerSlice.util.updateQueryData('getMatches', requestId, matches => {
            // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
            const match = matches.matches.find((match: Match) => match.rideId === rideId)
            if (match) {
              match.status = 'pending'
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      }
    })
  })
})

export const { 
  useCreateRequestMutation, 
  useGetRequestQuery,
  useGetMatchesQuery,
  useCreateJoinRequestMutation
} = passengerSlice