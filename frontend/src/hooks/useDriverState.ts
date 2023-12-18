import { useEffect } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'

import {
  selectDriverState,
  selectRideRoute,
  useGetRideQuery,
  useGetScheduleQuery
} from '~/redux/api/driver'
import { useGetRideStatusQuery } from '~/redux/api/passenger'
import { useGetCurrentActivityQuery } from '~/redux/api/users'

export const useDriverState = () => {
  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: result => ({ ...result, ...selectDriverState(result) })
  })
  const { rideRoute } = useGetRideQuery(rideId ?? skipToken, {
    selectFromResult: result => ({ ...result, rideRoute: selectRideRoute(result) })
  })
  const { ridePhase } = useGetRideStatusQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ ridePhase: data?.phase, ...rest })
  })
  const { rideSchedule } = useGetScheduleQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ rideSchedule: data?.schedule, ...rest })
  })

  return { rideId, rideRoute, ridePhase, rideSchedule }
}
