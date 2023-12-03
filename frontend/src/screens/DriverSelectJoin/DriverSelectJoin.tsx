import React, { useRef, useState } from 'react'
import { Marker } from 'react-native-maps'
import Animated, { CurvedTransition, FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Shadow } from 'react-native-shadow-2'
import { useDispatch } from 'react-redux'
import BottomSheet from '@gorhom/bottom-sheet'
import { skipToken } from '@reduxjs/toolkit/query'
import { Icon, TopNavigation, TopNavigationAction, type IconProps } from '@ui-kitten/components'
import { Image } from 'expo-image'

import MapViewWithRoute from '~/components/MapViewWithRoute'
import {
  driverSlice,
  useAcceptJoinMutation,
  useGetJoinsQuery,
  useGetRideQuery
} from '~/redux/driver'
import { useGetCurrentActivityQuery } from '~/redux/users'
import { type JoinDetailed } from '~/types/data'
import { type DriverSelectJoinScreenProps } from '~/types/screens'

import { PassengerAvatarList, PassengerCardList } from './PassengerList'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

export default function DriverSelectJoinScreen({ navigation }: DriverSelectJoinScreenProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [selectedJoins, setSelectedJoins] = useState<JoinDetailed[]>([])
  const dispatch = useDispatch()

  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: ({ data }) => ({ rideId: data?.driverState.rideId })
  })
  const { rideRoute } = useGetRideQuery(rideId ?? skipToken, {
    selectFromResult: ({ data }) => ({ rideRoute: data?.ride.route.route })
  })
  const { pendingJoins } = useGetJoinsQuery(!rideId ? skipToken : { rideId, status: 'pending' }, {
    selectFromResult: ({ data }) => ({
      pendingJoins: data?.joins
    })
  })
  const { acceptedJoins, numAvailableSeat } = useGetJoinsQuery(
    !rideId ? skipToken : { rideId, status: 'accepted' },
    {
      selectFromResult: ({ data }) => ({
        acceptedJoins: data?.joins,
        numAvailableSeat: data?.numAvailableSeat
      })
    }
  )

  const [acceptJoin] = useAcceptJoinMutation()

  // TODO: implement
  const handleConfirm = () => {
    if (selectedJoins.length > numAvailableSeat) {
      // TODO: show error message
      return
    }

    // TODO: send accept request to server
    // for (const join of selectedJoins) {
    //   acceptJoin(rideId, join.joinInfo.joinId)
    // }
    // navigate to RideDepartScreen
    navigation.navigate('DriverDepartScreen')
  }

  const handleReject = (index: number) => () => {
    dispatch(
      driverSlice.util.updateQueryData('getJoins', { rideId, status: 'pending' }, (oldData) => ({
        ...oldData,
        joins: [...oldData.joins.slice(0, index), ...oldData.joins.slice(index + 1)]
      }))
    )
  }

  const handleSelect = (index: number) => () => {
    setSelectedJoins((prev) => [...prev, { ...pendingJoins[index] }])
    dispatch(
      driverSlice.util.updateQueryData('getJoins', { rideId, status: 'pending' }, (oldData) => ({
        ...oldData,
        joins: [...oldData.joins.slice(0, index), ...oldData.joins.slice(index + 1)]
      }))
    )
  }

  const handleDeselect = (index: number) => () => {
    dispatch(
      driverSlice.util.updateQueryData('getJoins', { rideId, status: 'pending' }, (oldData) => ({
        ...oldData,
        joins: [...oldData.joins, { ...selectedJoins[index] }]
      }))
    )
    setSelectedJoins((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Shadow
        stretch={true}
        startColor="#00000010"
        sides={{ start: false, end: false, top: false, bottom: true }}
      >
        <TopNavigation
          alignment="center"
          title="發布成功，等待乘客邀請．．．"
          accessoryLeft={() => (
            <TopNavigationAction
              icon={BackIcon}
              onPress={() => {
                // TODO: confirm cancel ride
                navigation.goBack()
              }}
            />
          )}
        />
      </Shadow>

      <MapViewWithRoute route={rideRoute} edgePadding={{ bottom: 170 }}>
        {pendingJoins?.map(({ passengerInfo, ...join }) => (
          <React.Fragment key={join.passengerId}>
            <Marker
              key={`${join.passengerId}-pickUp`}
              coordinate={{
                latitude: join.pickUpLocation.latitude,
                longitude: join.pickUpLocation.longitude
              }}
            >
              <Shadow>
                <Image
                  source={{ uri: passengerInfo.avatar }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              </Shadow>
            </Marker>
            <Marker
              key={`${join.passengerId}-dropOff`}
              coordinate={{
                latitude: join.dropOffLocation.latitude,
                longitude: join.dropOffLocation.longitude
              }}
            >
              <Shadow>
                <Image
                  source={{ uri: passengerInfo.avatar }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              </Shadow>
            </Marker>
          </React.Fragment>
        ))}
      </MapViewWithRoute>

      <BottomSheet
        ref={bottomSheetRef}
        style={{ zIndex: 1 }}
        index={1}
        snapPoints={['18%', '45%', '75%']}
      >
        {(acceptedJoins?.length > 0 || selectedJoins.length > 0) && (
          <Animated.View entering={FadeIn.delay(100)}>
            <PassengerAvatarList
              title="已選擇的乘客"
              data={[...acceptedJoins, ...selectedJoins]}
              onDeselect={handleDeselect}
              onConfirm={handleConfirm}
            />
          </Animated.View>
        )}

        <Animated.View style={{ flex: 1 }} layout={CurvedTransition}>
          <PassengerCardList
            title="已發出請求的乘客"
            data={pendingJoins}
            onReject={handleReject}
            onSelect={handleSelect}
          />
        </Animated.View>
      </BottomSheet>
    </SafeAreaView>
  )
}
