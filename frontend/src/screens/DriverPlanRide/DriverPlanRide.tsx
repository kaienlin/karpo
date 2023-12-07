import { StyleSheet, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { Marker } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { skipToken } from '@reduxjs/toolkit/query'
import {
  Button,
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
  type IconProps
} from '@ui-kitten/components'

import MapViewWithRoute from '~/components/MapViewWithRoute'
import { useCurrentLocation } from '~/hooks/useCurrentLocation'
import { useCreateRideMutation } from '~/redux/driver'
import { useGetRouteQuery } from '~/redux/maps'
import { useGetSavedRidesQuery } from '~/redux/users'
import { type DriverPlanRideScreenProps } from '~/types/screens'
import { isValidWaypoint, isValidWaypoints } from '~/utils/maps'

import PlanPanel, { emptyWaypoint } from './PlanPanel'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

interface RidePlan {
  time: Date | null
  numSeats: number
  waypoints: Waypoint[]
}

const defaultValues: RidePlan = {
  time: null,
  numSeats: 0,
  waypoints: [emptyWaypoint, emptyWaypoint]
}

export default function DriverPlanRideScreen({ navigation, route }: DriverPlanRideScreenProps) {
  const theme = useTheme()

  const { savedRideIndex } = route?.params
  const { data: savedRide } = useGetSavedRidesQuery(savedRideIndex === -1 ? skipToken : undefined, {
    selectFromResult: ({ data, ...rest }) => {
      const ride = data?.savedRides[savedRideIndex]
      if (!ride) return { data, ...rest }

      const intermediates = ride.intermediates ?? []
      return {
        data: {
          time: new Date(ride.time),
          numSeats: ride.numSeats,
          waypoints: [ride.origin, ...intermediates, ride.destination]
        }
      }
    }
  })

  const { control, watch, handleSubmit } = useForm<RidePlan>({
    defaultValues: (savedRide as RidePlan) ?? defaultValues
  })

  const waypoints = watch('waypoints')

  const { location: currentLocation } = useCurrentLocation()
  const [createRide] = useCreateRideMutation()
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
    await createRide({
      departureTime: data.time.toISOString(),
      numSeats: data.numSeats,
      origin: data.waypoints[0],
      destination: data.waypoints[data.waypoints.length - 1],
      intermediates: data.waypoints.slice(1, data.waypoints.length - 1),
      route: {
        steps,
        durations
      }
    })
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
          <MapViewWithRoute
            route={rideRoute}
            fitToRouteButtonPosition={{ left: '86%', bottom: '11%' }}
            initialRegion={{ ...currentLocation, latitudeDelta: 0.005, longitudeDelta: 0.002 }}
          >
            {waypoints.map(
              (waypoint, index) =>
                isValidWaypoint(waypoint) && (
                  <Marker key={index} coordinate={waypoint}>
                    {index === 0 ? (
                      <>
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: theme['color-primary-default']
                          }}
                        >
                          <View
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 3.5,
                              backgroundColor: 'white'
                            }}
                          />
                        </View>
                      </>
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
                          {index}
                        </Text>
                      </View>
                    )}
                  </Marker>
                )
            )}
          </MapViewWithRoute>
        )}
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
    bottom: '3.5%',
    width: '100%',
    paddingHorizontal: 20
  }
})
