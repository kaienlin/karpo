import { useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Animated, { Easing, SlideInDown } from 'react-native-reanimated'
import { skipToken } from '@reduxjs/toolkit/query'
import { Icon, StyleService, useStyleSheet } from '@ui-kitten/components'

import MapViewWithRoute from '~/components/MapViewWithRoute'
import { useGetJoinsQuery, useGetRideQuery, useGetScheduleQuery } from '~/redux/driver'
import { useGetCurrentActivityQuery } from '~/redux/users'
import { type DriverDepartScreenProps } from '~/types/screens'
import { makePhoneCall } from '~/utils/device'

import { AddonBar, ReadyCard, StageCard } from './DepartCards'

export default function DriverDepartScreen({ navigation }: DriverDepartScreenProps) {
  const styles = useStyleSheet(themedStyles)
  const [stage, setStage] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)

  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: ({ data }) => ({ rideId: data?.driverState.rideId })
  })
  const { data: ride, isSuccess: isRideSuccess } = useGetRideQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ data: data?.ride, ...rest })
  })
  const {
    data: { numAvailableSeat, passengers },
    isSuccess: isJoinsSuccess
  } = useGetJoinsQuery(!rideId ? skipToken : { rideId, status: 'accepted' }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        numAvailableSeat: data?.numAvailableSeat,
        passengers: data?.joins?.map((join) => ({
          ...join.passengerInfo,
          numPassengers: join.numPassengers
        }))
      },
      ...rest
    })
  })
  const { data: schedule, isSuccess: isScheduleSuccess } = useGetScheduleQuery(
    rideId ?? skipToken,
    {
      selectFromResult: ({ data, ...rest }) => ({ data: data?.schedule, ...rest })
    }
  )
  const passenger = passengers?.find((passenger) => passenger.id === schedule?.[stage]?.passengerId)

  const handleSwipe = () => {
    setIsLoading(true)
    setTimeout(() => {
      setStage((prev) => prev + 1)
      setIsLoading(false)
    }, 500)
  }

  const handleContinueAccept = () => {
    navigation.goBack()
  }

  const handleChat = (userId: string) => {
    navigation.navigate('ChatScreen', { rideId })
  }

  useEffect(() => {
    if (stage === schedule?.length) {
      navigation.navigate('RideCompleteScreen')
    }
  }, [stage])

  let content
  if (stage === -1) {
    content = isRideSuccess && isJoinsSuccess && (
      <Animated.View entering={SlideInDown.duration(500).easing(Easing.out(Easing.exp))}>
        <AddonBar
          text={
            numAvailableSeat > 0
              ? `剩餘${numAvailableSeat}座，可與更多乘客共乘`
              : '已滿車，準備出發'
          }
          buttonText="繼續接單"
          buttonDisabled={numAvailableSeat <= 0}
          buttonOnPress={handleContinueAccept}
        />
        <ReadyCard
          time={ride?.time}
          origin={ride?.origin.description}
          destination={ride?.destination.description}
          passengers={passengers}
          isLoading={isLoading}
          onDepart={handleSwipe}
          handleChat={handleChat}
          handleCall={makePhoneCall}
        />
      </Animated.View>
    )
  } else if (stage < schedule.length) {
    content = isScheduleSuccess && (
      <Animated.View entering={SlideInDown.duration(500).easing(Easing.out(Easing.exp))}>
        <StageCard
          location={schedule[stage].location.description}
          status={schedule[stage].status}
          passenger={passenger}
          isLoading={isLoading}
          onComplete={handleSwipe}
          handleChat={handleChat}
          handleCall={makePhoneCall}
        />
      </Animated.View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={handleContinueAccept}>
          <Icon style={{ width: 30, height: 30 }} name="arrow-back" />
        </TouchableOpacity>
      </View>
      <MapViewWithRoute
        route={ride?.route?.route}
        edgePadding={{ bottom: stage === -1 ? 550 : 300 }}
      >
        {/* TODO: mark passenger location */}
      </MapViewWithRoute>

      <View
        style={{
          position: 'absolute',
          bottom: '2%',
          width: '100%'
        }}
      >
        {content}
      </View>
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
  rideInfoContainer: {
    marginHorizontal: 5,
    paddingBottom: 25,
    backgroundColor: 'white',
    borderRadius: 20
  },
  rideInfoAddOnBar: {
    backgroundColor: 'color-primary-default',
    height: 100,
    marginHorizontal: 5,
    marginBottom: -35,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
})
