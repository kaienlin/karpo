import { BACKEND_API_URL } from '@env'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { camelizeKeys, decamelizeKeys } from 'humps'

const baseQuery = fetchBaseQuery({
  baseUrl: `${BACKEND_API_URL}/api`,
  // TODO:
  prepareHeaders: (headers, { getState }) => {
    return headers
  }
})
const baseQueryWithCaseTransforms: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (args.body) {
    args.body = decamelizeKeys(args.body)
  }
  const result = await baseQuery(args, api, extraOptions)

  if (result.data) {
    // TODO: should check is application/json
    result.data = camelizeKeys(result.data)
  }

  return result
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithCaseTransforms,
  endpoints: () => ({})
})
