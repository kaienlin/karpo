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
import { useDriverState } from '~/hooks/useDriverState'
import { useGetScheduleQuery, useUpdateStatusMutation } from '~/redux/api/driver'
import { type DriverDepartScreenProps } from '~/types/screens'

import { AddonBar, ReadyCard, StageCard } from './DepartCards'

const ReadyInfoSection = ({
  isLoading,
  onProceed
}: {
  isLoading: boolean
  onProceed: () => void
}) => {
  const navigation = useNavigation()
  const { ride, passengers, numAvailableSeat } = useDriverState()

  return (
    <Animated.View entering={SlideInDown.duration(500).easing(Easing.out(Easing.exp))}>
      <AddonBar
        text={
          numAvailableSeat > 0
            ? `剩餘 ${numAvailableSeat} 座，可與更多乘客共乘`
            : '已滿車，準備出發'
        }
        buttonText="繼續接單"
        buttonDisabled={numAvailableSeat <= 0}
        buttonOnPress={navigation.goBack}
      />
      <ReadyCard
        time={ride?.departureTime}
        origin={ride?.origin.description}
        destination={ride?.destination.description}
        passengers={passengers}
        isLoading={isLoading}
        onDepart={onProceed}
      />
    </Animated.View>
  )
}

const PhaseInfoSection = ({
  isLoading,
  onProceed
}: {
  isLoading: boolean
  onProceed: () => void
}) => {
  const { rideId, ridePhase, passengers } = useDriverState()
  const { schedule } = useGetScheduleQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ schedule: data?.schedule?.[ridePhase], ...rest })
  })
  const passenger = passengers?.find(passenger => passenger.id === schedule?.passengerId)

  return (
    <Animated.View entering={SlideInDown.duration(500).easing(Easing.out(Easing.exp))}>
      <StageCard
        location={schedule?.location.description}
        status={schedule?.status}
        passenger={passenger}
        isLoading={isLoading}
        onComplete={onProceed}
      />
    </Animated.View>
  )
}

export default function DriverDepartScreen({ navigation }: DriverDepartScreenProps) {
  const styles = useStyleSheet(themedStyles)
  const [isLoading, setIsLoading] = useState(false)
  const { location: currentLocation } = useCurrentLocation()
  const { rideId, rideRoute, rideSchedule, ridePhase } = useDriverState()
  const [updateStatus] = useUpdateStatusMutation()

  const ridePhaseInfo = rideSchedule?.[ridePhase]

  useEffect(() => {
    if (rideSchedule && ridePhase === rideSchedule.length) {
      navigation.navigate('RideCompleteScreen', {
        userIds: [...new Set(rideSchedule.map(({ passengerId }) => passengerId))]
      })
    }
  }, [ridePhase])

  const onSwipeProceed = async () => {
    setIsLoading(true)
    if (!rideId || !currentLocation) {
      return
    }
    await updateStatus({ rideId, position: currentLocation, phase: Math.max(0, ridePhase + 1) })
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  let content
  if (ridePhase < 0) {
    content = <ReadyInfoSection isLoading={isLoading} onProceed={onSwipeProceed} />
  } else if (ridePhase < rideSchedule?.length) {
    content = <PhaseInfoSection isLoading={isLoading} onProceed={onSwipeProceed} />
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon style={{ width: 30, height: 30 }} name="arrow-back" />
        </TouchableOpacity>
      </View>
      <MapViewWithRoute route={rideRoute} edgePadding={{ bottom: ridePhase === -1 ? 550 : 300 }}>
        {ridePhaseInfo && (
          <Marker
            coordinate={{
              latitude: ridePhaseInfo.location.latitude,
              longitude: ridePhaseInfo.location.longitude
            }}
          >
            <Avatar base64Uri={ridePhaseInfo.passengerInfo.avatar} size="mini" />
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
