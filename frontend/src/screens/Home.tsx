import { useRef } from 'react'
import { FlatList, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { Text, Input, Icon, type IconProps, Button, useTheme } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView from 'react-native-maps'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'

import { GOOGLE_MAPS_API_KEY } from '@env'
import { addWaypoint, removeWaypoint } from '../redux/waypoints'
import Route from '../components/MapViewRoute'
import { type RootState } from '../redux/store'

const CloseIcon = (props: IconProps) => <Icon {...props} name="close" />

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>

export default function HomeScreen({ navigation }: HomeScreenProps) {
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
          placeholder={index === 0 ? '上車地點' : '要去哪裡？'}
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
      <View style={{ paddingLeft: 25, paddingRight: 10, paddingBottom: 25 }}>
        <FlatList
          data={waypoints}
          scrollEnabled={false}
          renderItem={renderInputItem}
          keyExtractor={(item, index) => `${index}-${item.title}`}
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
          ListFooterComponent={() =>
            waypoints.length <= 5 && (
              <>
                <View
                  style={{
                    left: 7,
                    width: 1.25,
                    height: 15,
                    marginVertical: -5,
                    backgroundColor: '#D8D8D8'
                  }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Icon style={{ width: 18, height: 18 }} name="plus" fill="#484848" />
                  </View>

                  <View style={{ flex: 1, paddingLeft: 10, paddingRight: 5 }}>
                    <Input
                      size="small"
                      placeholder={'新增停靠點'}
                      onFocus={() => {
                        dispatch(addWaypoint())
                        navigation.navigate('SelectLocationScreen', {
                          waypointIndex: waypoints.length
                        })
                      }}
                    />
                  </View>
                  <View style={{ width: 35 }}></View>
                </View>
              </>
            )
          }
        />
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
