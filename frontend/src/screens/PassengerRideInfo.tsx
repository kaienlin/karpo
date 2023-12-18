import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Marker } from 'react-native-maps'
import { Shadow } from 'react-native-shadow-2'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { skipToken } from '@reduxjs/toolkit/query'
import { Avatar, Button, Spinner, Text, Toggle, useTheme } from '@ui-kitten/components'

import { Header } from '~/components/CardHeader'
import { PassengerStackParamList } from '~/types/navigation'
import { useCreateJoinRequestMutation, useGetRequestQuery } from '~/redux/api/passenger'
import MapViewWithRoute from '~/components/MapViewWithRoute'
import { useGetWalkingRouteQuery } from '~/redux/api/maps'
import { useGetUserProfileQuery } from '~/redux/api/users'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Image } from 'expo-image'
import { useNavigation } from '@react-navigation/native'
import { Match } from '~/types/data'
import { displayTime } from '~/utils/format'
import { MapsAPI } from '~/services/maps'

export const LocationIcon = () => {
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

function PassengerItem({ userId } : { userId: string }) {
  const { data: user } = useGetUserProfileQuery(userId)
  const navigation = useNavigation()

  const handleViewProfile = () => {
    navigation.navigate(
      'UserProfileScreen', 
      { role: 'driver', 'userId': userId }
    )
  }

  if (user) 
    return (
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity onPress={handleViewProfile}>
          <View
            onStartShouldSetResponder={(event) => true}
            onTouchEnd={(e) => {
              e.stopPropagation();
            }} 
            style={{ padding: 10 }}
          >
            <Image 
              source={{ uri: user.avatar }} 
              style={{ width: 56, height: 56, borderRadius: 28 }} 
            />
          </View>  
        </TouchableOpacity> 
        <Text>{user.name}</Text>
      </View>
    )

  return (
    <View style={{
      width: 56,
      height: 56, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 10 
    }}>
      <Spinner />
    </View>
  )
}

function OtherPassegners({ match } : { match: Match }) {
  return (
    <View style={{ 
      alignItems: 'center', 
      flexDirection: 'row',
      paddingVertical: 10,
    }}>
      {match.otherPassengers.map(passenger => 
        <PassengerItem 
          userId={passenger}
          key={passenger}
        />
      )}
    </View>
  )
}

export default function RideInfo({ route, navigation }: RideInfoScreenProps) {
  const [checked, setChecked] = useState(false)
  const [toggleNote, setToggleNote] = useState('上車')
  const onCheckedChange = (isChecked: boolean): void => {
    setChecked(isChecked)
    if (isChecked) setToggleNote('下車')
    else setToggleNote('上車')
  };
  
  const { requestId, match } = route.params
  const { data: request, isLoading } = useGetRequestQuery(requestId)
  const [createJoinRequest] = useCreateJoinRequestMutation()
  const handlePress = async () => {
    await createJoinRequest({
      rideId: match.rideId,
      requestId: requestId
    }).unwrap()
    navigation.push('WaitingListScreen', { requestId: route.params.requestId })
  }

  const { data: walkingRoute } = useGetWalkingRouteQuery(
    !request || !match
      ? skipToken
      : toggleNote === '上車'
        ? [request.origin, match.pickUpLocation]
        : [match.dropOffLocation, request.destination]
  )

  const [pickupDescription, setPickupDescription] = useState('')
  const [dropoffDescription, setDropoffDescription] = useState('')

  useEffect(() => {
    const fetchDescription = async () => {
      if (match.pickUpLocation.latitude 
        && match.pickUpLocation.longitude) {
        const pickup = await MapsAPI.getPlaceTitle({
          latitude: match.pickUpLocation.latitude,
          longitude: match.pickUpLocation.longitude
        })
        setPickupDescription(pickup)
      }

      if (match.dropOffLocation.latitude 
        && match.dropOffLocation.longitude) {
        const dropoff = await MapsAPI.getPlaceTitle({
          latitude: match.dropOffLocation.latitude,
          longitude: match.dropOffLocation.longitude
        })
        setDropoffDescription(dropoff)
      }
    }
    
    fetchDescription()
      .catch(console.error)
  }, [])

  const originStr = () => {
    if (request.origin)
      return `起點：\n${request.origin.description}`
    return '起點'
  }

  const destinationStr = () => {
    if (request.destination)
      return `目的地：\n${request.destination.description}`
    return '目的地'
  }

  const pickupStr = () => {
    return (
      '上車地點：\n'
      + pickupDescription
      + '\n預估上車時間：\n'
      + displayTime(match.pickUpTime.toString(), false)
    )
  }

  const dropoffStr = () => {
    return (
      '下車地點：\n'
      + dropoffDescription
      + '\n預估下車時間：\n'
      + displayTime(match.dropOffTime.toString(), false)
    )
  }

  return (
    <>
      <View style={{ padding: 10 }}>
        <Header 
          rating={match.driverInfo.rating}
          numAvailableSeat={match.numAvailableSeat}
          proximity={match.proximity}
          pickUpTime={match.pickUpTime}
          dropOffTime={match.dropOffTime}
          fare={match.fare}
          userId={match.driverInfo.id}
          avatar={match.driverInfo.avatar}
        />
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
        {request && (
          <>
            <Marker coordinate={toggleNote === '上車' ? request.origin : request.destination}>
              <LocationIcon />
            </Marker>
            <Marker
              anchor={{ x: 0.5, y: 1.5 }}
              coordinate={toggleNote === '上車' ? request.origin : request.destination}
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
                    <Text category="label">{originStr()}</Text>
                  ) : (
                    <Text category="label">{destinationStr()}</Text>
                  )}

                  {/* TODO: indicate duration and distance on polyline <Text category="label">{`步行時間${walkingRoute?.duration}`}</Text> */}
                </View>
              </Shadow>
            </Marker>
          </>
        )}

        <Marker coordinate={toggleNote === '上車' ? match.pickUpLocation : match.dropOffLocation}>
          <LocationIcon />
        </Marker>
        <Marker
          anchor={{ x: 0.5, y: 1.5 }}
          coordinate={toggleNote === '上車' ? match.pickUpLocation : match.dropOffLocation}
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
                <Text category="label">{pickupStr()}</Text>
              ) : (
                <Text category="label">{dropoffStr()}</Text>
              )}

              {/* TODO: indicate duration and distance on polyline <Text category="label">{`步行時間${walkingRoute?.duration}`}</Text> */}
            </View>
          </Shadow>
        </Marker> 
      </MapViewWithRoute>

      <View style={{ padding: 20 }}>
        {match.otherPassengers.length === 0 ? (
          <Text style={{ fontSize: 18 }}>尚無其他乘客</Text>  
        ) : (
          <>
            <Text style={{ fontSize: 18 }}>其他乘客</Text>
            <OtherPassegners match={match} />
          </>
        )}
      </View>
      <View style={{ paddingVertical: 10 }}>
        <View style={{ padding: 20 }}>
          {match.status === 'unasked' ? (
            <Button 
              style={{ borderRadius: 12 }}
              onPress={handlePress}
            >預    約</Button>
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
