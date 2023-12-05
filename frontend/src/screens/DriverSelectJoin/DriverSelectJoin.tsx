import { useRef, useState } from 'react'
import { View } from 'react-native'
import Animated, { CurvedTransition, FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Shadow } from 'react-native-shadow-2'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView
} from '@gorhom/bottom-sheet'
import { skipToken } from '@reduxjs/toolkit/query'
import {
  Button,
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  type IconProps
} from '@ui-kitten/components'

import MapViewWithRoute from '~/components/MapViewWithRoute'
import { useGetJoinsQuery, useGetRideQuery, useRespondJoinMutation } from '~/redux/driver'
import { useGetCurrentActivityQuery } from '~/redux/users'
import { type DriverSelectJoinScreenProps } from '~/types/screens'

import { PassengerAvatarList, PassengerCardList } from './PassengerList'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />
const MoreIcon = (props: IconProps) => <Icon {...props} name="more-horizontal-outline" />

export default function DriverSelectJoinScreen({ navigation }: DriverSelectJoinScreenProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const modalRef = useRef<BottomSheetModal>(null)

  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: ({ data }) => ({ rideId: data?.driverState.rideId })
  })
  const { rideRoute } = useGetRideQuery(rideId ?? skipToken, {
    selectFromResult: ({ data }) => ({ rideRoute: data?.ride.route.route })
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
        {/* <BottomSheetModal
          ref={modalRef}
          snapPoints={['50%', '50%']}
          backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={false}
          handleIndicatorStyle={{ display: 'none' }}
          detached={true}
          bottomInset={400}
          style={{ alignItems: 'center', justifyContent: 'center', margin: 20, height: 180 }}
        >
          <BottomSheetView
            style={{
              flex: 1,
              alignItems: 'center',
              height: 200,
              justifyContent: 'center'
            }}
          >
            <Text category="h5">是否要取消本次行程？</Text>
            <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 20 }}>
              <Button
                size="giant"
                status="danger"
                style={{ borderRadius: 12 }}
                accessoryLeft={(props) => <Icon {...props} name="close-outline" />}
                onPress={navigation.goBack}
              >
                取消行程
              </Button>
              <Button
                size="giant"
                status="basic"
                style={{ borderRadius: 12 }}
                onPress={modalRef.current?.close}
              >
                留在此頁
              </Button>
            </View>
          </BottomSheetView>
        </BottomSheetModal> */}
        <Shadow
          stretch={true}
          startColor="#00000010"
          sides={{ start: false, end: false, top: false, bottom: true }}
        >
          <TopNavigation
            alignment="center"
            title={screenTitle}
            accessoryLeft={() => (
              <TopNavigationAction
                icon={BackIcon}
                onPress={() => {
                  // TODO: confirm cancel ride
                  // modalRef.current?.present()
                  navigation.goBack()
                }}
              />
            )}
            accessoryRight={() => <TopNavigationAction icon={MoreIcon} />}
          />
        </Shadow>

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
          {(acceptedJoins?.length > 0 || selectedJoins?.length > 0) && (
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
