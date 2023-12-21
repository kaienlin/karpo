import { useRef, useState } from 'react'
import { Marker } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetModalProvider, type BottomSheetModal } from '@gorhom/bottom-sheet'
import { skipToken } from '@reduxjs/toolkit/query'

import RouteMarker from '~/components/maps/RouteMarker'
import MapViewWithRoute from '~/components/MapViewWithRoute'
import { ConfirmModal } from '~/components/modals/Confirm'
import TopNavBar from '~/components/nav/TopNavBar'
import { useDriverState } from '~/hooks/useDriverState'
import { useGetJoinsQuery, useRespondJoinsMutation } from '~/redux/api/driver'
import { useCancelEventMutation } from '~/redux/api/users'
import { type DriverSelectJoinScreenProps } from '~/types/screens'

import { PassengerAvatarList, PassengerCardList } from './PassengerList'

export default function DriverSelectJoinScreen({ navigation }: DriverSelectJoinScreenProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const modalRef = useRef<BottomSheetModal>(null)

  const { rideId, rideRoute, rideSchedule } = useDriverState()
  const { pendingJoins } = useGetJoinsQuery(!rideId ? skipToken : { rideId, status: 'pending' }, {
    pollingInterval: 3000,
    selectFromResult: ({ data }) => ({ pendingJoins: data?.joins })
  })
  const {
    acceptedJoins,
    numAvailableSeat,
    isSuccess: isAcceptedJoinsSuccess
  } = useGetJoinsQuery(!rideId ? skipToken : { rideId, status: 'accepted' }, {
    selectFromResult: ({ data, ...rest }) => ({
      acceptedJoins: data?.joins,
      numAvailableSeat: data?.numAvailableSeat,
      ...rest
    })
  })

  const [respondJoins] = useRespondJoinsMutation()
  const [cancelRide] = useCancelEventMutation()

  const [selectedJoinIds, setSelectedJoinIds] = useState<string[]>([])
  const selectedJoins = pendingJoins
    ?.filter(({ joinId }) => selectedJoinIds.includes(joinId))
    ?.map(item => ({ ...item, status: 'pending' }))
  const unselectedJoins = pendingJoins?.filter(({ joinId }) => !selectedJoinIds.includes(joinId))
  const numSelectedPassengers = selectedJoins?.reduce((sum, curr) => sum + curr.numPassengers, 0)

  let screenTitle = ''
  if (!isAcceptedJoinsSuccess) {
    screenTitle = '載入中．．．'
  } else {
    screenTitle =
      acceptedJoins?.length === 0
        ? '發布成功，等待乘客邀請．．．'
        : numAvailableSeat >= 0
          ? `剩餘 ${numAvailableSeat} 座，選擇更多乘客．．．`
          : `已滿座，準備出發`
  }

  const onPressConfirm = async () => {
    if (!rideId) return

    if (numSelectedPassengers > numAvailableSeat) {
      // TODO: show error message
      return
    }

    try {
      await respondJoins({ rideId, action: 'accept', joinIds: selectedJoinIds })
      setSelectedJoinIds([])
    } catch (error) {
      console.log(error)
    }

    navigation.navigate('DriverDepartScreen')
  }

  const onPressReject = (joinId: string) => async () => {
    if (!rideId) return
    try {
      await respondJoins({ rideId, action: 'reject', joinIds: [joinId] })
    } catch (error) {
      console.log(error)
    }
  }

  const onPressSelect = (joinId: string) => () => {
    setSelectedJoinIds(prev => [...prev, joinId])
  }

  const onPressDeselect = (joinId: string) => () => {
    setSelectedJoinIds(prev => prev.filter(id => id !== joinId))
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
          onPressConfirm={async () => {
            await cancelRide()
            navigation.goBack()
          }}
          confirmBtnText="取消行程"
          cancelBtnText="留在此頁"
        />

        <MapViewWithRoute route={rideRoute} edgePadding={{ bottom: 170 }}>
          {rideSchedule?.map(({ joinId, status, location, passengerInfo }) => (
            <Marker
              key={`${joinId}-${status}`}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
              description={`${passengerInfo.name} 的 ${status === 'pick_up' ? '上車' : '下車'}地點`}
            >
              {status === 'pick_up' ? <RouteMarker.Radio /> : <RouteMarker.DoubleBox />}
            </Marker>
          ))}
        </MapViewWithRoute>

        <BottomSheet
          ref={bottomSheetRef}
          style={{ zIndex: 1 }}
          index={1}
          snapPoints={['18%', '45%', '75%']}
        >
          {(acceptedJoins?.length > 0 || selectedJoins?.length > 0) && (
            <PassengerAvatarList
              title="已選擇的乘客"
              data={[...(acceptedJoins ?? []), ...(selectedJoins ?? [])]}
              isConfirmDisabled={numSelectedPassengers > numAvailableSeat}
              onDeselect={onPressDeselect}
              onConfirm={onPressConfirm}
            />
          )}
          <PassengerCardList
            title="已發出請求的乘客"
            data={unselectedJoins ?? []}
            onReject={onPressReject}
            onSelect={onPressSelect}
          />
        </BottomSheet>
      </BottomSheetModalProvider>
    </SafeAreaView>
  )
}
