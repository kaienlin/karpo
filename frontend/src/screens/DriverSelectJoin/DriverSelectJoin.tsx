import { useRef, useState } from 'react'
import Animated, { CurvedTransition, FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetModalProvider, type BottomSheetModal } from '@gorhom/bottom-sheet'
import { skipToken } from '@reduxjs/toolkit/query'

import MapViewWithRoute from '~/components/MapViewWithRoute'
import { ConfirmModal } from '~/components/modals/Confirm'
import TopNavBar from '~/components/nav/TopNavBar'
import { useGetJoinsQuery, useGetRideQuery, useRespondJoinMutation } from '~/redux/api/driver'
import { useGetCurrentActivityQuery } from '~/redux/api/users'
import { type DriverSelectJoinScreenProps } from '~/types/screens'

import { PassengerAvatarList, PassengerCardList } from './PassengerList'

export default function DriverSelectJoinScreen({ navigation }: DriverSelectJoinScreenProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const modalRef = useRef<BottomSheetModal>(null)

  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: ({ data }) => ({ rideId: data?.driverState?.rideId })
  })
  const { rideRoute } = useGetRideQuery(rideId ?? skipToken, {
    selectFromResult: ({ data }) => ({ rideRoute: data?.ride?.route_with_time?.route })
  })
  const { pendingJoins } = useGetJoinsQuery(!rideId ? skipToken : { rideId, status: 'all' }, {
    selectFromResult: ({ data }) => ({
      pendingJoins: data?.joins.filter(({ status }) => status === 'pending')
    })
  })
  const {
    acceptedJoins,
    numAvailableSeat,
    isSuccess: isAcceptedJoinsSuccess
  } = useGetJoinsQuery(!rideId ? skipToken : { rideId, status: 'all' }, {
    selectFromResult: ({ data, ...rest }) => ({
      acceptedJoins: data?.joins.filter(({ status }) => status === 'accepted'),
      numAvailableSeat: data?.numAvailableSeat,
      ...rest
    })
  })

  const [respondJoin] = useRespondJoinMutation()

  const [selectedJoinIds, setSelectedJoinIds] = useState<string[]>([])
  const selectedJoins = pendingJoins?.filter(({ joinId }) => selectedJoinIds.includes(joinId))
  const unselectedJoins = pendingJoins?.filter(({ joinId }) => !selectedJoinIds.includes(joinId))

  const screenTitle = !isAcceptedJoinsSuccess
    ? '載入中．．．'
    : acceptedJoins?.length === 0
      ? '發布成功，等待乘客邀請．．．'
      : numAvailableSeat >= 0
        ? `剩餘 ${numAvailableSeat} 座，選擇更多乘客．．．`
        : `已滿座，準備出發`

  // TODO: implement
  const handleConfirm = async () => {
    if (selectedJoinIds.length > numAvailableSeat) {
      // TODO: show error message
      return
    }

    // TODO: send accept request to server
    try {
      for (const joinId of selectedJoinIds) {
        await respondJoin({ rideId, joinId, action: 'accept' })
      }
    } catch (error) {
      console.log(error)
    }

    navigation.navigate('DriverDepartScreen')
  }

  const handleReject = (joinId: string) => async () => {
    try {
      await respondJoin({ rideId, joinId, action: 'reject' })
    } catch (error) {
      console.log(error)
    }
  }

  const handleSelect = (joinId: string) => () => {
    setSelectedJoinIds((prev) => [...prev, joinId])
  }

  const handleDeselect = (joinId: string) => () => {
    setSelectedJoinIds((prev) => prev.filter((id) => id !== joinId))
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <TopNavBar title={screenTitle} onGoBack={modalRef.current?.present} />

        <ConfirmModal
          ref={modalRef}
          snapPoints={['33%', '33%']}
          title="是否要取消本次行程？"
          message="取消行程後，您的乘客們會馬上收到通知"
          onPressConfirm={navigation.goBack}
          confirmBtnText="取消行程"
          cancelBtnText="留在此頁"
        />

        <MapViewWithRoute route={rideRoute} edgePadding={{ bottom: 170 }}>
          {/* {pendingJoins?.map(({ passengerInfo, ...join }) => (
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
        ))} */}
        </MapViewWithRoute>

        <BottomSheet
          ref={bottomSheetRef}
          style={{ zIndex: 1 }}
          index={1}
          snapPoints={['18%', '45%', '75%']}
        >
          {(acceptedJoins.length > 0 ?? selectedJoins.length > 0) && (
            <Animated.View entering={FadeIn.delay(100)}>
              <PassengerAvatarList
                title="已選擇的乘客"
                data={[...(acceptedJoins ?? []), ...(selectedJoins ?? [])]}
                onDeselect={handleDeselect}
                onConfirm={handleConfirm}
              />
            </Animated.View>
          )}
          <Animated.View style={{ flex: 1 }} layout={CurvedTransition}>
            <PassengerCardList
              title="已發出請求的乘客"
              data={unselectedJoins ?? []}
              onReject={handleReject}
              onSelect={handleSelect}
            />
          </Animated.View>
        </BottomSheet>
      </BottomSheetModalProvider>
    </SafeAreaView>
  )
}
