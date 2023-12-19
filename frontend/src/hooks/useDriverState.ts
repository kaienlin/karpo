import { skipToken } from '@reduxjs/toolkit/query'

import {
  selectAcceptedPassengers,
  selectDriverState,
  selectRideRoute,
  useGetJoinsQuery,
  useGetRideQuery,
  useGetScheduleQuery
} from '~/redux/api/driver'
import { useGetRideStatusQuery } from '~/redux/api/passenger'
import { useGetCurrentActivityQuery } from '~/redux/api/users'

export const useDriverState = () => {
  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: result => ({ ...result, ...selectDriverState(result) })
  })
  const { ride } = useGetRideQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ ride: data?.ride, ...rest })
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
  const { numAvailableSeat, passengers } = useGetJoinsQuery(
    !rideId ? skipToken : { rideId, status: 'accepted' },
    { selectFromResult: result => ({ ...result, ...selectAcceptedPassengers(result) }) }
  )

  return { rideId, ride, rideRoute, ridePhase, rideSchedule, numAvailableSeat, passengers }
}
