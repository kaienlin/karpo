import { StyleSheet, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { Marker } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { skipToken } from '@reduxjs/toolkit/query'
import { Button, Text } from '@ui-kitten/components'

import savedRides from '~/assets/templates/savedRides.json'
import RouteMarker from '~/components/maps/RouteMarker'
import MapViewWithRoute from '~/components/MapViewWithRoute'
import TopNavBar from '~/components/nav/TopNavBar'
import { useCurrentLocation } from '~/hooks/useCurrentLocation'
import { useCreateRideMutation } from '~/redux/api/driver'
import { useGetRouteQuery } from '~/redux/api/maps'
import { transformSavedRide } from '~/redux/api/users'
import { type DriverPlanRideScreenProps } from '~/types/screens'
import { isValidWaypoint, isValidWaypoints } from '~/utils/maps'

import PlanPanel, { emptyWaypoint } from './PlanPanel'

interface RidePlan {
  time: Date
  numSeats: number
  waypoints: Waypoint[]
}

const defaultValues: RidePlan = {
  time: null,
  numSeats: 0,
  waypoints: [emptyWaypoint, emptyWaypoint]
}

export default function DriverPlanRideScreen({ navigation, route }: DriverPlanRideScreenProps) {
  const { savedRideIndex } = route?.params
  const { location: currentLocation, isLoading: isCurrentLocationLoading } = useCurrentLocation()

  const savedRide = savedRideIndex >= 0 && transformSavedRide(savedRides[savedRideIndex])

  const { control, watch, handleSubmit } = useForm<RidePlan>({
    defaultValues: savedRide ?? defaultValues
  })

  const waypoints = watch('waypoints')
  const [createRide, { isLoading }] = useCreateRideMutation()
  const { rideRoute, steps, durations } = useGetRouteQuery(
    isValidWaypoints(waypoints) ? waypoints : skipToken,
    {
      selectFromResult: ({ data }) => ({
        rideRoute: data?.route,
        steps: data?.steps,
        durations: data?.durations
      })
    }
  )

  const onSubmit = async (data: RidePlan) => {
    try {
      await createRide({
        label: 'ride',
        departureTime: data.time.toISOString(),
        numSeats: data.numSeats,
        origin: data.waypoints[0],
        destination: data.waypoints[data.waypoints.length - 1],
        intermediates: data.waypoints.slice(1, data.waypoints.length - 1),
        route: {
          // note: backend uses [longitude, latitude]
          steps: steps.map(step => step.map(([lat, lng]) => [lng, lat])),
          durations
        }
      })
      navigation.navigate('DriverSelectJoinScreen')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <TopNavBar title="規劃您的行程" onGoBack={navigation?.goBack} />
        <PlanPanel control={control} />
        {currentLocation && (
          <MapViewWithRoute
            route={rideRoute}
            fitToRouteButtonPosition={{ left: '86%', bottom: '11%' }}
            initialRegion={{ ...currentLocation, latitudeDelta: 0.005, longitudeDelta: 0.002 }}
          >
            {waypoints.map(
              (waypoint, index) =>
                isValidWaypoint(waypoint) && (
                  <Marker key={index} coordinate={waypoint}>
                    {index === 0 ? <RouteMarker.Radio /> : <RouteMarker.Box label={`${index}`} />}
                  </Marker>
                )
            )}
          </MapViewWithRoute>
        )}
        <View style={styles.submitButtonContainer}>
          <Button
            onPress={handleSubmit(onSubmit)}
            size="large"
            style={{ borderRadius: 12 }}
            disabled={isLoading}
          >
            <Text>發布行程</Text>
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
    bottom: '3.5%',
    width: '100%',
    paddingHorizontal: 20
  }
})
