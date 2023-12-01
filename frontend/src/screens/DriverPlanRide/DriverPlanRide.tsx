import { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useForm } from 'react-hook-form'
import MapView, { Polyline } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { skipToken } from '@reduxjs/toolkit/query'
import {
  Button,
  Icon,
  TopNavigation,
  TopNavigationAction,
  type IconProps
} from '@ui-kitten/components'

import { useCurrentLocation } from '~/hooks/useCurrentLocation'
import { useCreateRideMutation } from '~/redux/driver'
import { useGetRouteQuery } from '~/redux/maps'
import { type DriverPlanRideScreenProps } from '~/types/screens'

import PlanPanel, { emptyWaypoint } from './PlanPanel'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

interface RidePlan {
  time: Date | null
  numSeats: number
  waypoints: Waypoint[]
}

const isValidWaypoints = (waypoints: Waypoint[]) =>
  waypoints.every((waypoint) => waypoint.latitude !== null && waypoint.longitude !== null)

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

  const currentLocation = useCurrentLocation()
  const [createRide] = useCreateRideMutation()
  const { data: rideRoute } = useGetRouteQuery(isValidWaypoints(waypoints) ? waypoints : skipToken)

  useEffect(() => {
    if (rideRoute) {
      mapRef.current?.fitToCoordinates(rideRoute, {
        edgePadding: { top: 50, right: 50, left: 50, bottom: 100 }
      })
    }
  }, [rideRoute])

  const onSubmit = async (data: RidePlan) => {
    await createRide(data)
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
        {currentLocation && (
          <MapView
            ref={mapRef}
            style={{ flex: 1, width: '100%', height: '100%' }}
            provider="google"
            showsUserLocation={true}
            initialRegion={{ ...currentLocation, latitudeDelta: 0.002, longitudeDelta: 0.005 }}
          >
            {rideRoute !== null && <Polyline coordinates={rideRoute} strokeWidth={5} />}
          </MapView>
        )}
        <View style={styles.submitButtonContainer}>
          <Button onPress={() => onSubmit({})} size="large" style={{ borderRadius: 12 }}>
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
