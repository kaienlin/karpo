import { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useForm } from 'react-hook-form'
import MapView, { Polyline } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { decode as decodePolyline } from '@mapbox/polyline'
import {
  Button,
  Icon,
  TopNavigation,
  TopNavigationAction,
  type IconProps
} from '@ui-kitten/components'

import { MapsAPI } from '~/services/maps'
import { type DriverPlanRideScreenProps } from '~/types/screens'

import PlanPanel, { emptyWaypoint } from './PlanPanel'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

interface RidePlan {
  time: Date | null
  numSeats: number
  waypoints: Waypoint[]
}

export default function DriverPlanRideScreen({ navigation }: DriverPlanRideScreenProps) {
  const mapRef = useRef<MapView>(null)

  const { control, watch, handleSubmit } = useForm<RidePlan>({
    defaultValues: {
      time: null,
      numSeats: 0,
      waypoints: [emptyWaypoint, emptyWaypoint]
    }
  })

  const waypoints = watch('waypoints')

  const [rideRoute, setRideRoute] = useState<string | null>(null)
  const rideRouteCoordinates = useMemo(
    () =>
      rideRoute === null
        ? []
        : decodePolyline(rideRoute).map(([lat, lng]: number[]) => ({
            latitude: lat,
            longitude: lng
          })),
    [rideRoute]
  )

  useEffect(() => {
    for (let i = 0; i < waypoints.length; i++) {
      if (waypoints[i].latitude === null) {
        return
      }
    }

    void (async () => {
      const { polyline } = await MapsAPI.getRoute(waypoints)
      setRideRoute(polyline)
    })()
  }, [waypoints])

  useEffect(() => {
    mapRef.current?.fitToCoordinates(rideRouteCoordinates, {
      edgePadding: { top: 50, right: 50, left: 50, bottom: 100 }
    })
  }, [rideRouteCoordinates])

  const onSubmit = async (data: RidePlan) => {
    // TODO:
    navigation.navigate('DriverSelectJoinScreen')
  }

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <TopNavigation
          alignment="center"
          title="規劃您的行程"
          accessoryLeft={() => (
            <TopNavigationAction
              icon={BackIcon}
              onPress={() => {
                navigation.goBack()
              }}
            />
          )}
        />
        <PlanPanel control={control} />
        <MapView
          ref={mapRef}
          style={{ flex: 1, width: '100%', height: '100%' }}
          provider="google"
          showsUserLocation={true}
        >
          {rideRouteCoordinates !== null && (
            <Polyline coordinates={rideRouteCoordinates} strokeWidth={5} />
          )}
        </MapView>
        <View style={styles.submitButtonContainer}>
          <Button onPress={handleSubmit(onSubmit)} size="large" style={{ borderRadius: 12 }}>
            發布行程
          </Button>
        </View>
      </BottomSheetModalProvider>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  panelContainer: {
    paddingLeft: 25,
    paddingRight: 10,
    paddingBottom: 15
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: '5%',
    width: '100%',
    paddingHorizontal: 20
  }
})
