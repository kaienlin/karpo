import { useEffect, useRef, useState } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import {
  Avatar,
  Button,
  Divider,
  Icon,
  StyleService,
  Text,
  useStyleSheet,
  useTheme,
  type IconProps
} from '@ui-kitten/components'
import MapView, { Polyline } from 'react-native-maps'
import Animated, { Easing, FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated'
import { Shadow } from 'react-native-shadow-2'

import SwipeButton from '~/components/SwipeButton'
import { type DriverDepartScreenProps } from '~/types/screens'
import { displayDatetime } from '~/utils/format'

enum PassengerStatus {
  Pickup = 'get_on',
  Dropoff = 'get_off'
}

const fakeVacantSeat = 3

const fakeRoute = [
  { latitude: 24.83707, longitude: 121.00403 },
  { latitude: 24.83674, longitude: 121.00498 },
  { latitude: 24.83612, longitude: 121.00497 },
  { latitude: 24.83575, longitude: 121.00492 },
  { latitude: 24.83511, longitude: 121.00472 },
  { latitude: 24.83318, longitude: 121.00403 },
  { latitude: 24.83293, longitude: 121.00387 },
  { latitude: 24.83241, longitude: 121.0035 },
  { latitude: 24.83169, longitude: 121.00274 },
  { latitude: 24.83155, longitude: 121.00259 },
  { latitude: 24.83138, longitude: 121.00279 },
  { latitude: 24.83014, longitude: 121.00463 },
  { latitude: 24.82963, longitude: 121.00534 },
  { latitude: 24.82904, longitude: 121.00625 },
  { latitude: 24.82879, longitude: 121.00659 },
  { latitude: 24.82794, longitude: 121.00781 },
  { latitude: 24.82696, longitude: 121.0097 },
  { latitude: 24.82651, longitude: 121.01063 },
  { latitude: 24.82629, longitude: 121.01116 },
  { latitude: 24.82533, longitude: 121.01306 },
  { latitude: 24.82449, longitude: 121.01481 },
  { latitude: 24.82402, longitude: 121.01582 },
  { latitude: 24.82374, longitude: 121.01608 },
  { latitude: 24.82354, longitude: 121.01618 },
  { latitude: 24.82334, longitude: 121.0162 },
  { latitude: 24.82304, longitude: 121.01617 },
  { latitude: 24.82245, longitude: 121.01597 },
  { latitude: 24.82158, longitude: 121.01563 },
  { latitude: 24.82122, longitude: 121.01545 },
  { latitude: 24.82046, longitude: 121.01498 },
  { latitude: 24.81861, longitude: 121.01396 },
  { latitude: 24.81835, longitude: 121.01389 },
  { latitude: 24.818, longitude: 121.01369 },
  { latitude: 24.81669, longitude: 121.01308 },
  { latitude: 24.81514, longitude: 121.01236 },
  { latitude: 24.81332, longitude: 121.01174 },
  { latitude: 24.81258, longitude: 121.01146 },
  { latitude: 24.81172, longitude: 121.01116 },
  { latitude: 24.81003, longitude: 121.01067 },
  { latitude: 24.80893, longitude: 121.01046 },
  { latitude: 24.80689, longitude: 121.01 },
  { latitude: 24.8026, longitude: 121.00934 },
  { latitude: 24.79954, longitude: 121.0088 },
  { latitude: 24.79903, longitude: 121.00869 },
  { latitude: 24.79775, longitude: 121.00837 },
  { latitude: 24.79631, longitude: 121.00793 },
  { latitude: 24.79547, longitude: 121.00764 },
  { latitude: 24.79498, longitude: 121.00747 },
  { latitude: 24.79324, longitude: 121.00677 },
  { latitude: 24.79307, longitude: 121.00664 },
  { latitude: 24.79228, longitude: 121.00627 },
  { latitude: 24.79097, longitude: 121.00562 },
  { latitude: 24.79038, longitude: 121.00534 },
  { latitude: 24.78954, longitude: 121.00488 },
  { latitude: 24.78911, longitude: 121.00468 },
  { latitude: 24.78789, longitude: 121.00425 },
  { latitude: 24.78747, longitude: 121.00412 },
  { latitude: 24.78537, longitude: 121.00359 },
  { latitude: 24.78461, longitude: 121.00341 },
  { latitude: 24.78352, longitude: 121.00323 },
  { latitude: 24.78273, longitude: 121.00316 },
  { latitude: 24.78203, longitude: 121.00313 },
  { latitude: 24.78157, longitude: 121.00313 },
  { latitude: 24.78065, longitude: 121.00311 },
  { latitude: 24.77984, longitude: 121.00313 },
  { latitude: 24.77867, longitude: 121.00318 },
  { latitude: 24.77791, longitude: 121.00324 },
  { latitude: 24.77663, longitude: 121.00321 },
  { latitude: 24.77633, longitude: 121.00325 },
  { latitude: 24.77597, longitude: 121.00324 },
  { latitude: 24.77581, longitude: 121.00327 },
  { latitude: 24.77552, longitude: 121.00369 },
  { latitude: 24.77543, longitude: 121.00386 },
  { latitude: 24.7752, longitude: 121.00445 },
  { latitude: 24.77434, longitude: 121.00656 },
  { latitude: 24.77403, longitude: 121.00736 },
  { latitude: 24.77384, longitude: 121.00778 },
  { latitude: 24.77307, longitude: 121.0097 },
  { latitude: 24.77294, longitude: 121.01007 },
  { latitude: 24.77145, longitude: 121.00904 },
  { latitude: 24.77135, longitude: 121.00897 },
  { latitude: 24.77137, longitude: 121.00922 },
  { latitude: 24.77101, longitude: 121.00992 },
  { latitude: 24.7706, longitude: 121.01052 }
]

const fakePassengers = [
  {
    avatar: require('../../../assets/icon.png'),
    name: 'Topi',
    rating: 5.0,
    numPassenger: 1
  },
  {
    avatar: require('../../../assets/icon.png'),
    name: 'Chako',
    rating: 4.7,
    numPassenger: 1
  },
  {
    avatar: require('../../../assets/icon.png'),
    name: 'Mayo',
    rating: 4.8,
    numPassenger: 2
  }
]

const fakeRide = {
  time: new Date(),
  origin: {
    latitude: 24.8044,
    longitude: 120.9715,
    description: '台積電12廠'
  },
  destination: {
    latitude: 24.8044,
    longitude: 120.9715,
    description: '國立竹北高級中學'
  },
  passengers: fakePassengers
}

const fakeSchedule = [
  {
    name: 'Chako',
    location: {
      latitude: 24.8044,
      longitude: 120.9715,
      description: '聯合骨科器材股份有限公司新竹廠'
    },
    passenger: fakePassengers[1],
    status: PassengerStatus.Pickup
  },
  {
    name: 'Topi',
    location: {
      latitude: 24.8044,
      longitude: 120.9715,
      description: '光明六路16號'
    },
    passenger: fakePassengers[0],
    status: PassengerStatus.Pickup
  },
  {
    name: 'Chako',
    location: {
      latitude: 24.8044,
      longitude: 120.9715,
      description: '光明六路116號'
    },
    passenger: fakePassengers[1],
    status: PassengerStatus.Dropoff
  },
  {
    name: 'Topi',
    location: {
      latitude: 24.8044,
      longitude: 120.9715,
      description: '光明六路166號'
    },
    passenger: fakePassengers[0],
    status: PassengerStatus.Dropoff
  }
]

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />

interface PassengerItemProps {
  avatar?: string
  name: string
  rating: number
  numPassenger: number
  onChat?: () => void
  onCall?: () => void
}

function PassengerItem({ avatar, name, rating, numPassenger, onChat, onCall }: PassengerItemProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <Avatar source={avatar} />
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <View>
          <Text style={{ paddingVertical: 2 }}>{name}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Icon style={{ width: 15, height: 15 }} name="star" fill={'#F0C414'} />
              <Text category="c1">{rating?.toFixed(1)}</Text>
            </View>
            <Text category="c1">|</Text>
            <Text category="c1">{`${numPassenger}人`}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            accessoryLeft={ChatIcon}
            style={{ borderRadius: 100, width: 40, height: 40 }}
            status="basic"
          />
          <Button
            accessoryLeft={PhoneIcon}
            style={{ borderRadius: 100, width: 40, height: 40 }}
            status="basic"
          />
        </View>
      </View>
    </View>
  )
}

function ReadyBody({
  time,
  origin,
  destination,
  passengers,
  isLoading,
  onSwipe
}: {
  time: Date
  origin: {
    latitude: number
    longitude: number
    description: string
  }
  destination: {
    latitude: number
    longitude: number
    description: string
  }
  passengers: Passenger[]
  isLoading: boolean
  onSwipe: () => void
}) {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)

  return (
    <>
      <View style={styles.rideInfoHeader}>
        <Text category="h5">行程預約成功</Text>
        <TouchableOpacity>
          <Text style={{ color: theme['color-primary-default'] }}>行程詳情</Text>
        </TouchableOpacity>
      </View>
      <Divider />
      <View style={styles.rideInfoBody}>
        <View style={styles.rideInfoBodyItem}>
          <Icon style={styles.rideInfoBodyItemIcon} name="clock" />
          <Text>{displayDatetime(time)}</Text>
        </View>
        <View style={styles.rideInfoBodyItem}>
          <Icon
            style={styles.rideInfoBodyItemIcon}
            name="radio-button-on"
            fill={theme['color-primary-default']}
          />
          <Text>{origin.description}</Text>
        </View>
        <View style={styles.rideInfoBodyItem}>
          <Icon style={styles.rideInfoBodyItemIcon} name="pin" />
          <Text>{destination.description}</Text>
        </View>
      </View>
      <Divider />
      <FlatList
        data={passengers}
        renderItem={({ item }) => <PassengerItem {...item} />}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        style={{ paddingVertical: 15, paddingHorizontal: 25 }}
      />
      <View style={{ alignItems: 'center', paddingTop: 10, height: 70 }}>
        {!isLoading && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <SwipeButton text="出發接乘客" onSwipe={onSwipe} />
          </Animated.View>
        )}
      </View>
    </>
  )
}

function StageBody({
  name,
  location,
  status,
  passenger,
  isLoading,
  onSwipe
}: {
  name: string
  location: {
    latitude: number
    longitude: number
    description: string
  }
  status: PassengerStatus
  passenger: {
    avatar?: string
    name: string
    rating: number
    numPassenger: number
  }
  isLoading: boolean
  onSwipe: () => void
}) {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)

  return (
    <>
      <View style={styles.rideInfoHeader}>
        <View style={{ gap: 5 }}>
          <Text category="h5">
            {status === PassengerStatus.Pickup
              ? `正在前往 ${name} 所在位置`
              : `接近 ${name} 目的地`}
          </Text>
          <Text style={{ fontSize: 14, color: theme['text-hint-color'] }}>
            {location.description}
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={{ color: theme['color-primary-default'] }}>行程詳情</Text>
        </TouchableOpacity>
      </View>
      <Divider />
      <View style={{ paddingVertical: 15, paddingHorizontal: 25 }}>
        <PassengerItem {...fakePassengers[1]} />
      </View>

      <View style={{ alignItems: 'center', paddingTop: 10, height: 70 }}>
        {!isLoading && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <SwipeButton
              text={
                status === PassengerStatus.Pickup ? `到達 ${name} 起點` : `已到達 ${name} 目的地`
              }
              onSwipe={onSwipe}
            />
          </Animated.View>
        )}
      </View>
    </>
  )
}

export default function DriverDepartScreen({ navigation }: DriverDepartScreenProps) {
  const styles = useStyleSheet(themedStyles)
  const mapRef = useRef<MapView>(null)

  const [stage, setStage] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleChat = () => {}

  const handleCall = () => {}

  useEffect(() => {
    mapRef.current?.fitToCoordinates(fakeRoute, {
      edgePadding: { top: 50, right: 50, left: 50, bottom: stage === -1 ? 550 : 300 }
    })
  }, [fakeRoute, stage])

  useEffect(() => {
    if (stage === fakeSchedule.length) {
      navigation.navigate('RideCompleteScreen')
    }
  }, [stage])

  const renderReadyCard = () => (
    <>
      {fakeVacantSeat > 0 && (
        <View style={styles.rideInfoAddOnBar}>
          <Text>{`剩餘${fakeVacantSeat}座，可與更多乘客共乘`}</Text>
          <Button
            onPress={navigation.goBack}
            status="basic"
            size="small"
            style={{ borderRadius: 100 }}
          >
            繼續接單
          </Button>
        </View>
      )}
      <Shadow {...shadowPresets.modal}>
        <View style={styles.rideInfoContainer}>
          <ReadyBody {...fakeRide} isLoading={isLoading} onSwipe={handleSwipe} />
        </View>
      </Shadow>
    </>
  )
  const renderStageCard = () => (
    <Shadow {...shadowPresets.modal}>
      <View style={styles.rideInfoContainer}>
        <StageBody {...fakeSchedule[stage]} isLoading={isLoading} onSwipe={handleSwipe} />
      </View>
    </Shadow>
  )

  return (
    <View style={{ flex: 1 }}>
      <View style={{ position: 'absolute', top: '6%', left: '5%', zIndex: 1 }}>
        <TouchableOpacity onPress={handleContinueAccept}>
          <Icon style={{ width: 30, height: 30 }} name="arrow-back" />
        </TouchableOpacity>
      </View>
      <MapView
        ref={mapRef}
        style={{ flex: 1, width: '100%', height: '100%' }}
        provider="google"
        showsUserLocation={true}
      >
        <Polyline coordinates={fakeRoute} strokeWidth={5} />
      </MapView>

      <View
        style={{
          position: 'absolute',
          bottom: '2%',
          width: '100%'
        }}
      >
        <Animated.View entering={SlideInDown.duration(500).easing(Easing.out(Easing.exp))}>
          {stage < fakeSchedule.length && (stage === -1 ? renderReadyCard() : renderStageCard())}
        </Animated.View>
      </View>
    </View>
  )
}

const themedStyles = StyleService.create({
  rideInfoContainer: {
    marginHorizontal: 5,
    paddingBottom: 25,
    backgroundColor: 'white',
    borderRadius: 20
  },
  rideInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  rideInfoBody: {
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 25
  },
  rideInfoBodyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rideInfoBodyItemIcon: {
    width: 15,
    height: 15
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

const shadowPresets = {
  modal: {
    stretch: true,
    startColor: '#00000025',
    sides: {
      start: true,
      end: true,
      top: false,
      bottom: true
    },
    corners: {
      topStart: false,
      topEnd: false,
      bottomStart: true,
      bottomEnd: true
    }
  }
}
