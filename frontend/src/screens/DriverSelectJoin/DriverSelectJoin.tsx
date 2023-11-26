import { useEffect, useRef, useState } from 'react'
import MapView, { Polyline } from 'react-native-maps'
import Animated, { CurvedTransition, FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Shadow } from 'react-native-shadow-2'
import BottomSheet from '@gorhom/bottom-sheet'
import { Icon, TopNavigation, TopNavigationAction, type IconProps } from '@ui-kitten/components'

import { type JoinInfo } from '~/types/data'
import { type DriverSelectJoinScreenProps } from '~/types/screens'

import { fakeRoute } from '../DriverDepart/DriverDepart'
import { PassengerAvatarList, PassengerCardList } from './PassengerList'

const rideInfoList = [
  {
    status: 'pending',
    joinInfo: {
      time: new Date(),
      fare: 300,
      numPassenger: 1,
      origin: '台積電 12 廠',
      destination: '竹北市光明六路 16 號',
      proximity: '很順路'
    },
    passengerProfile: {
      name: 'Topi',
      rating: 5.0,
      phone: '0912345678'
    }
  },
  {
    status: 'pending',
    joinInfo: {
      time: new Date(),
      fare: 280,
      numPassenger: 1,
      origin: '園區二路 57 號',
      destination: '竹北市光明六路 116 號',
      proximity: '非常順路'
    },
    passengerProfile: {
      name: 'Chako',
      rating: 4.8,
      phone: '0912345678'
    }
  }
  //   {
  //     time: new Date(),
  //     price: 320,
  //     rating: 4.5,
  //     numPassenger: 1,
  //     rideStatus: '有點繞路',
  //     origin: '實驗中學',
  //     destination: '博愛國小'
  //   },
  //   {
  //     time: new Date(),
  //     price: 320,
  //     rating: 4.5,
  //     numPassenger: 1,
  //     rideStatus: '有點繞路',
  //     origin: '實驗中學',
  //     destination: '博愛國小'
  //   }
]

const query = {
  origin: '台積電 12 廠',
  destination: '十興國小',
  date: '2023/11/21'
}

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

export default function DriverSelectJoinScreen({ navigation }: DriverSelectJoinScreenProps) {
  const [joins, setJoins] = useState<JoinInfo[]>(rideInfoList)
  const [selectedJoins, setSelectedJoins] = useState<JoinInfo[]>([])

  const mapRef = useRef<MapView>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)

  useEffect(() => {
    mapRef.current?.fitToCoordinates(fakeRoute, {
      edgePadding: { top: 50, right: 50, left: 50, bottom: 350 }
    })
  }, [fakeRoute])

  // TODO: implement
  const handleConfirm = () => {
    // send accept request to server
    // navigate to RideDepartScreen
    navigation.navigate('DriverDepartScreen')
  }

  const handleReject = (index: number) => () => {
    setJoins((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
  }

  const handleSelect = (index: number) => () => {
    setSelectedJoins((prev) => [...prev, { ...joins[index], status: 'pending' }])
    setJoins((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
  }

  const handleDeselect = (index: number) => () => {
    setJoins((prev) => [...prev, { ...selectedJoins[index], status: 'available' }])
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

      <MapView ref={mapRef} style={{ flex: 1, width: '100%', height: '100%' }} provider="google">
        <Polyline coordinates={fakeRoute} strokeWidth={5} />
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        style={{ zIndex: 1 }}
        index={1}
        topInset={30}
        snapPoints={['19%', '45%', '75%']}
        onChange={(index) => {
          if (index === 0) {
            mapRef.current?.fitToCoordinates(fakeRoute, {
              edgePadding: { top: 50, right: 50, left: 50, bottom: 200 }
            })
          } else if (index === 1) {
            mapRef.current?.fitToCoordinates(fakeRoute, {
              edgePadding: { top: 50, right: 50, left: 50, bottom: 350 }
            })
          }
        }}
      >
        {selectedJoins.length > 0 && (
          <Animated.View entering={FadeIn.delay(100)}>
            <PassengerAvatarList
              title="已選擇的乘客"
              data={selectedJoins}
              onDeselect={handleDeselect}
              onConfirm={handleConfirm}
            />
          </Animated.View>
        )}

        <Animated.View style={{ flex: 1 }} layout={CurvedTransition}>
          <PassengerCardList
            title="已發出請求的乘客"
            data={joins}
            onReject={handleReject}
            onSelect={handleSelect}
          />
        </Animated.View>
      </BottomSheet>
    </SafeAreaView>
  )
}
