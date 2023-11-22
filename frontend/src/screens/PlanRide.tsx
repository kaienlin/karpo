import { useRef } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import { GOOGLE_MAPS_API_KEY } from '@env'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  Button,
  Icon,
  Input,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
  type IconProps
} from '@ui-kitten/components'
import MapView from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import Route from '../components/MapViewRoute'
import { type DriverStackParamList } from '../navigation/DriverStack'
import { type RootState } from '../redux/store'
import { addWaypoint, clearWaypoints, removeWaypoint } from '../redux/waypoints'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />
const CloseIcon = (props: IconProps) => <Icon {...props} name="close" />

export default function PlanRideScreen({
  navigation
}: NativeStackScreenProps<DriverStackParamList, 'PlanRideScreen'>) {
  const theme = useTheme()
  const waypoints = useSelector((state: RootState) => state.waypoints)
  const dispatch = useDispatch()

  const mapRef = useRef<MapView>(null)

  const renderInputItem = ({ item, index }: { item: Waypoint; index: number }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {index === 0 ? (
        <View style={{ width: 15, height: 15, justifyContent: 'center', alignItems: 'center' }}>
          <Icon
            style={{ width: 18, height: 18 }}
            name="radio-button-on"
            fill={theme['color-primary-default']}
          />
        </View>
      ) : (
        <View
          style={{
            width: 15,
            height: 15,
            backgroundColor: '#484848',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Text category="label" style={{ fontSize: 10, color: 'white' }}>
            {index === 0 ? 's' : index}
          </Text>
        </View>
      )}

      <View style={{ flex: 1, paddingLeft: 10, paddingRight: 5 }}>
        <Input
          size="small"
          placeholder={
            index === 0 ? '上車地點' : waypoints.length === 2 ? '下車地點' : '新增停靠點'
          }
          value={item.title}
          onFocus={() => {
            navigation.navigate('SelectLocationScreen', {
              waypointIndex: index
            })
          }}
        />
      </View>
      <View style={{ width: 35 }}>
        {index > 0 && waypoints.length > 2 && (
          <Button
            size="small"
            appearance="ghost"
            status="basic"
            style={{ width: 10 }}
            accessoryLeft={CloseIcon}
            onPress={() => {
              dispatch(removeWaypoint({ index }))
            }}
          />
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopNavigation
        alignment="center"
        title="規劃您的行程"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={BackIcon}
            onPress={() => {
              dispatch(clearWaypoints())
              navigation.goBack()
            }}
          />
        )}
      />
      <View style={{ paddingLeft: 25, paddingRight: 10, paddingBottom: 15 }}>
        <FlatList
          data={waypoints}
          scrollEnabled={false}
          renderItem={renderInputItem}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={() => (
            <View
              style={{
                left: 7,
                width: 1.25,
                height: 15,
                marginVertical: -5,
                backgroundColor: '#D8D8D8'
              }}
            />
          )}
        />
        {waypoints.length < 5 && (
          <TouchableOpacity
            onPress={() => {
              dispatch(addWaypoint())
            }}
            style={{
              flexDirection: 'row',
              gap: 3,
              justifyContent: 'flex-end',
              paddingTop: 10,
              paddingRight: 12,
              alignItems: 'center'
            }}
          >
            <Text category="label" style={{ fontSize: 14 }}>
              新增停靠點
            </Text>
            <Icon style={{ width: 15, height: 15 }} name="plus" />
          </TouchableOpacity>
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
