import { useState } from 'react'
import { View } from 'react-native'
import { Marker } from 'react-native-maps'
import { Shadow } from 'react-native-shadow-2'
import { useDispatch } from 'react-redux'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { skipToken } from '@reduxjs/toolkit/query'
import { Avatar, Button, Text, Toggle, useTheme } from '@ui-kitten/components'

import { Header } from '~/components/CardHeader'
import MapViewWithRoute from '~/components/MapViewWithRoute'
import { type PassengerStackParamList } from '~/navigation/PassengerStack'
import { useAppSelector } from '~/redux/hooks'
import { useGetWalkingRouteQuery } from '~/redux/maps'
import { changeStatus } from '~/redux/ride'

const LocationIcon = () => {
  const theme = useTheme()
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme['color-primary-default']
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: 'white'
        }}
      />
    </View>
  )
}

type RideInfoScreenProps = NativeStackScreenProps<PassengerStackParamList, 'RideInfoScreen'>

export default function RideInfo({ route, navigation }: RideInfoScreenProps) {
  const [checked, setChecked] = useState(false)
  const [toggleNote, setToggleNote] = useState('上車')
  const onCheckedChange = (isChecked: boolean): void => {
    setChecked(isChecked)
    if (isChecked) setToggleNote('下車')
    else setToggleNote('上車')
  }

  const ride = useAppSelector((state) => {
    // https://stackoverflow.com/questions/54496398/typescript-type-string-undefined-is-not-assignable-to-type-string
    // but the ride could be deleted
    return state.rides.find((ride) => ride.id === route.params.rideId)!
  })

  // TODO: use real location from ride endpoint
  const origin = { latitude: 25.017089003707316, longitude: 121.54544438688791 }
  const destination = { latitude: 25.02692426177873, longitude: 121.55453461187718 }
  const pickUpLocation = { latitude: 25.02792426177873, longitude: 121.54453461187718 }
  const dropOffLocation = { latitude: 25.02792426177873, longitude: 121.55453461187718 }

  const { data: walkingRoute } = useGetWalkingRouteQuery(
    !origin || !destination || !pickUpLocation || !dropOffLocation
      ? skipToken
      : toggleNote === '上車'
        ? [origin, pickUpLocation]
        : [dropOffLocation, destination]
  )

  const dispatch = useDispatch()
  const handlePress = () => {
    dispatch(changeStatus({ id: route.params.rideId }))
    navigation.push('WaitingListScreen', { query: route.params.query })
  }

  return (
    <>
      <View style={{ padding: 10 }}>
        <Header {...ride} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignContent: 'center',
          paddingHorizontal: 20,
          paddingVertical: 10
        }}
      >
        <Text style={{ fontSize: 18 }}>行駛路線</Text>
        <Toggle checked={checked} onChange={onCheckedChange}>
          {(evaProps) => <Text {...evaProps}>{toggleNote}</Text>}
        </Toggle>
      </View>

      <MapViewWithRoute
        route={walkingRoute?.route}
        edgePadding={{ top: 80, right: 80, left: 80, bottom: 80 }}
        fitToRouteButtonPosition={{ left: '86%', bottom: '40%' }}
      >
        <Marker coordinate={toggleNote === '上車' ? pickUpLocation : dropOffLocation}>
          <LocationIcon />
        </Marker>
        <Marker
          anchor={{ x: 0.5, y: 2 }}
          coordinate={toggleNote === '上車' ? pickUpLocation : dropOffLocation}
        >
          <Shadow>
            <View
              style={{
                width: 110,
                alignItems: 'center',
                backgroundColor: 'white',
                paddingHorizontal: 10,
                paddingVertical: 5
              }}
            >
              {toggleNote === '上車' ? (
                <Text category="label">{`上車地點 ${ride.departTime}`}</Text>
              ) : (
                <Text category="label">{`下車地點 ${ride.arrivalTime}`}</Text>
              )}

              {/* TODO: indicate duration and distance on polyline <Text category="label">{`步行時間${walkingRoute?.duration}`}</Text> */}
            </View>
          </Shadow>
        </Marker>
      </MapViewWithRoute>

      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18 }}>其他乘客</Text>
        <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
          <View style={{ padding: 10, alignItems: 'center', gap: 5 }}>
            <Avatar source={require('../../assets/yia.jpg')} size="giant" />
            <Text>yia</Text>
          </View>
          <View style={{ padding: 10, alignItems: 'center', gap: 5 }}>
            <Avatar source={require('../../assets/poprice.jpg')} size="giant" />
            <Text>米香</Text>
          </View>
        </View>
      </View>
      <View style={{ paddingVertical: 10 }}>
        <View style={{ padding: 20 }}>
          {ride.responseStatus === 'idle' ? (
            <Button style={{ borderRadius: 12 }} onPress={handlePress}>
              預 約
            </Button>
          ) : (
            <Button style={{ borderRadius: 12 }} disabled={true}>
              已 預 約
            </Button>
          )}
        </View>
      </View>
    </>
  )
}
