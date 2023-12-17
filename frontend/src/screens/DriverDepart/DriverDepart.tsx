import { useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Marker } from 'react-native-maps'
import Animated, { Easing, SlideInDown } from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import { skipToken } from '@reduxjs/toolkit/query'
import { Icon, StyleService, useStyleSheet } from '@ui-kitten/components'

import { Avatar } from '~/components/Avatar'
import MapViewWithRoute from '~/components/MapViewWithRoute'
import { useCurrentLocation } from '~/hooks/useCurrentLocation'
import {
  selectAcceptedPassengers,
  selectDriverState,
  selectRideRoute,
  useGetJoinsQuery,
  useGetRideQuery,
  useGetScheduleQuery,
  useUpdateStatusMutation
} from '~/redux/api/driver'
import { useGetCurrentActivityQuery } from '~/redux/api/users'
import { useGetRideStatusQuery } from '~/redux/passenger'
import { type DriverDepartScreenProps } from '~/types/screens'
import { makePhoneCall } from '~/utils/device'

import { AddonBar, ReadyCard, StageCard } from './DepartCards'

const ReadyInfoSection = ({
  rideId,
  isLoading,
  onProceed
}: {
  rideId: string
  isLoading: boolean
  onProceed: () => void
}) => {
  const navigation = useNavigation()
  const { ride } = useGetRideQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ ride: data?.ride, ...rest })
  })
  const { numAvailableSeat, passengers } = useGetJoinsQuery(
    !rideId ? skipToken : { rideId, status: 'accepted' },
    { selectFromResult: result => ({ ...result, ...selectAcceptedPassengers(result) }) }
  )

  const onPressContinueAccept = () => {
    navigation.goBack()
  }
  const onPressChat = (joinId: string) => {
    navigation.navigate('ChatScreen', { joinId })
  }

  return (
    <Animated.View entering={SlideInDown.duration(500).easing(Easing.out(Easing.exp))}>
      <AddonBar
        text={
          numAvailableSeat > 0 ? `剩餘${numAvailableSeat}座，可與更多乘客共乘` : '已滿車，準備出發'
        }
        buttonText="繼續接單"
        buttonDisabled={numAvailableSeat <= 0}
        buttonOnPress={onPressContinueAccept}
      />
      <ReadyCard
        time={ride?.departureTime}
        origin={ride?.origin.description}
        destination={ride?.destination.description}
        passengers={passengers}
        isLoading={isLoading}
        onDepart={onProceed}
        handleChat={onPressChat}
        handleCall={makePhoneCall}
      />
    </Animated.View>
  )
}

const PhaseInfoSection = ({
  rideId,
  isLoading,
  onProceed
}: {
  rideId: string
  isLoading: boolean
  onProceed: () => void
}) => {
  const navigation = useNavigation()
  const { ridePhase } = useGetRideStatusQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ ridePhase: data?.phase, ...rest })
  })
  const { passengers } = useGetJoinsQuery(!rideId ? skipToken : { rideId, status: 'accepted' }, {
    selectFromResult: result => ({ ...result, ...selectAcceptedPassengers(result) })
  })
  const { schedule } = useGetScheduleQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ schedule: data?.schedule?.[ridePhase], ...rest })
  })
  const passenger = passengers?.find(passenger => passenger.id === schedule?.passengerId)

  const onPressChat = (joinId: string) => {
    navigation.navigate('ChatScreen', { joinId })
  }

  return (
    <Animated.View entering={SlideInDown.duration(500).easing(Easing.out(Easing.exp))}>
      <StageCard
        location={schedule?.location.description}
        status={schedule?.status}
        passenger={passenger}
        isLoading={isLoading}
        onComplete={onProceed}
        handleChat={onPressChat}
        handleCall={makePhoneCall}
      />
    </Animated.View>
  )
}

export default function DriverDepartScreen({ navigation }: DriverDepartScreenProps) {
  const styles = useStyleSheet(themedStyles)
  const [isLoading, setIsLoading] = useState(false)

  const { location: currentLocation } = useCurrentLocation()

  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: result => ({ ...result, ...selectDriverState(result) })
  })
  const { rideRoute } = useGetRideQuery(rideId ?? skipToken, {
    selectFromResult: result => ({ ...result, rideRoute: selectRideRoute(result) })
  })
  const { ridePhase } = useGetRideStatusQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ ridePhase: data?.phase, ...rest })
  })
  const { schedule } = useGetScheduleQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ schedule: data?.schedule, ...rest })
  })
  const [updateStatus] = useUpdateStatusMutation()

  const onSwipeProceed = async () => {
    setIsLoading(true)
    if (!rideId || !currentLocation) {
      return
    }
    await updateStatus({ rideId, position: currentLocation, phase: ridePhase + 1 })
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    // TODO: resume to phase
    if (schedule && ridePhase === schedule.length) {
      navigation.navigate('RideCompleteScreen', {
        userIds: [...new Set(schedule.map(({ passengerId }) => passengerId))]
      })
    }
  }, [ridePhase])

  let content
  if (ridePhase < 0) {
    content = <ReadyInfoSection rideId={rideId} isLoading={isLoading} onProceed={onSwipeProceed} />
  } else if (ridePhase < schedule?.length) {
    content = <PhaseInfoSection rideId={rideId} isLoading={isLoading} onProceed={onSwipeProceed} />
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon style={{ width: 30, height: 30 }} name="arrow-back" />
        </TouchableOpacity>
      </View>
      <MapViewWithRoute route={rideRoute} edgePadding={{ bottom: ridePhase === -1 ? 550 : 300 }}>
        {ridePhase >= 0 && (
          <Marker
            coordinate={{
              latitude: schedule?.[ridePhase]?.location.latitude,
              longitude: schedule?.[ridePhase]?.location.longitude
            }}
          >
            <Avatar base64Uri={schedule?.[ridePhase]?.passengerInfo?.avatar} size="mini" />
          </Marker>
        )}
      </MapViewWithRoute>
      <View style={styles.cardContainer}>{content}</View>
    </View>
  )
}

const themedStyles = StyleService.create({
  topHeader: {
    position: 'absolute',
    top: '6%',
    left: '5%',
    zIndex: 1
  },
  cardContainer: {
    position: 'absolute',
    bottom: '2%',
    width: '100%'
  }
})
