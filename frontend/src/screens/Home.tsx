import { useRef } from 'react'
import { View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { Input } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView from 'react-native-maps'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'

import { GOOGLE_MAPS_API_KEY } from '@env'
import { addWaypoint, updateWaypoint } from '../redux/waypoints'
import Route from '../components/MapViewRoute'
import { type RootState } from '../redux/store'

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>

export default function HomeScreen ({ navigation }: HomeScreenProps) {
  const waypoints = useSelector((state: RootState) => state.waypoints)
  const dispatch = useDispatch()

  const mapRef = useRef<MapView>(null)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 10 }}>
        {waypoints.map((point: Waypoint, index: number) =>
          index === 0
            ? (
            <Input
              key={index}
              placeholder="上車地點"
              value={point.title}
              onFocus={() => {
                navigation.navigate('SelectLocationScreen', {
                  waypointIndex: index
                })
              }}
            />
              )
            : (
            <Input
              key={index}
              placeholder="要去哪裡？"
              value={point.title}
              onFocus={() => {
                navigation.navigate('SelectLocationScreen', {
                  waypointIndex: index
                })
              }}
            />
              )
        )}
      </View>
      <MapView
        ref={mapRef}
        style={{ flex: 1, width: '100%', height: '100%' }}
        provider="google"
        showsMyLocationButton={true}
        showsUserLocation={true}
      >
        <Route
          query={{ key: GOOGLE_MAPS_API_KEY, coordinates: waypoints }}
          polylineStyle={{ strokeWidth: 5 }}
          onRouteChange={(coordinates) => {
            mapRef.current?.fitToCoordinates(coordinates)
          }}
        />
      </MapView>
    </SafeAreaView>
  )
}
