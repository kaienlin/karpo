import { forwardRef, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, ScrollView, StyleSheet, View } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet'
import { decode as decodePolyline } from '@mapbox/polyline'
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
import { Controller, useForm } from 'react-hook-form'
import MapView, { Polyline } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import { InputCounterModal, InputDateTimeModal } from '../components/InputModals'
import { type RootState } from '../redux/store'
import { clearWaypoints } from '../redux/waypoints'
import { MapsAPI } from '../services/maps'
import { type PlanRideScreenProps } from '../types/screens'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

const parseDatetime = (date: Date) => {
  const today = new Date()

  const dateStr =
    date.toLocaleDateString() === today.toLocaleDateString()
      ? '今天'
      : date.toLocaleDateString('zh-TW', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('zh-TW', { hour: 'numeric', minute: 'numeric' })

  return `${dateStr} ${timeStr}`
}

export default function PassengerPlanRideScreen({ navigation }: PlanRideScreenProps) {
  const theme = useTheme()
  const waypoints = useSelector((state: RootState) => state.waypoints)
  const dispatch = useDispatch()

  const mapRef = useRef<MapView>(null)
  const timeModalRef = useRef<BottomSheetModal>(null)
  const seatsModalRef = useRef<BottomSheetModal>(null)

  const [tempNumPeople, setTempNumPeople] = useState(0)
  const [tempDepartTime, setTempDepartTime] = useState<Date | null>(new Date())
  const [route, setRoute] = useState<string | null>(null)

  const { control, handleSubmit } = useForm<RidePlan>({
    defaultValues: {
      time: null,
      numPeople: 0
    }
  })

  const routeCoordinates = useMemo(
    () =>
      route === null
        ? []
        : decodePolyline(route).map(([lat, lng]: number[]) => ({
            latitude: lat,
            longitude: lng
          })),
    [route]
  )

  useEffect(() => {
    for (let i = 0; i < waypoints.length; i++) {
      if (waypoints[i].latitude === null) {
        return
      }
    }

    void (async () => {
      const { polyline } = await MapsAPI.getRoute(waypoints)
      setRoute(polyline)
    })()
  }, [waypoints])

  useEffect(() => {
    mapRef.current?.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 50, right: 50, left: 50, bottom: 100 }
    })
  }, [routeCoordinates])

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
        <View style={{ width: 15, height: 15, justifyContent: 'center', alignItems: 'center' }}>
          <Icon style={{ width: 18, height: 18 }} name="pin" />
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
    </View>
  )

  const onSubmit = async (data: RidePlan) => {
    // TODO:
    navigation.navigate('SelectRideScreen')
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
                dispatch(clearWaypoints())
                navigation.goBack()
              }}
            />
          )}
        />

        <View style={styles.panelContainer}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              columnGap: 10
            }}
            style={{ paddingBottom: 10 }}
          >
            <Controller
              name="time"
              control={control}
              rules={{ required: true, validate: (value) => value !== null && value > new Date() }}
              render={({ field: { onChange, value }, fieldState: { invalid } }) => (
                <>
                  <Button
                    onPress={() => {
                      timeModalRef.current?.present()
                    }}
                    size="small"
                    appearance={value === null ? 'filled' : 'outline'}
                    status={invalid ? 'danger' : value === null ? 'input' : 'primary'}
                    style={{ borderRadius: 8, gap: -10, paddingHorizontal: 0 }}
                    accessoryLeft={(props) => <Icon {...props} name="clock" />}
                    accessoryRight={(props) => (
                      <Icon {...props} name={value === null ? 'arrow-ios-downward' : 'checkmark'} />
                    )}
                  >
                    {value === null ? '立即出發' : `${parseDatetime(value)} 出發`}
                  </Button>
                  <InputDateTimeModal
                    ref={timeModalRef}
                    title="選擇出發時間"
                    onConfirm={onChange}
                  />
                </>
              )}
            />
            <Controller
              name="numPeople"
              control={control}
              rules={{ required: true, validate: (value) => value > 0 }}
              render={({ field: { onChange, value }, fieldState: { invalid } }) => (
                <>
                  <Button
                    onPress={() => {
                      seatsModalRef.current?.present()
                    }}
                    size="small"
                    appearance={value === 0 ? 'filled' : 'outline'}
                    status={invalid ? 'danger' : value === 0 ? 'input' : 'primary'}
                    style={{ borderRadius: 8, gap: -10, paddingHorizontal: 0 }}
                    accessoryLeft={(props) => <Icon {...props} name="person" />}
                    accessoryRight={(props) => (
                      <Icon {...props} name={value === 0 ? 'arrow-ios-downward' : 'checkmark'} />
                    )}
                  >
                    {value === 0 ? '搭乘人數' : `搭乘 ${value} 人`}
                  </Button>
                  <InputCounterModal ref={seatsModalRef} title="搭乘人數" onConfirm={onChange} />
                </>
              )}
            />
          </ScrollView>
          <FlatList
            data={waypoints}
            scrollEnabled={false}
            renderItem={renderInputItem}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={() => <View style={styles.waypointInputSeparator} />}
          />
        </View>
        <MapView
          ref={mapRef}
          style={{ flex: 1, width: '100%', height: '100%' }}
          provider="google"
          showsUserLocation={true}
        >
          {routeCoordinates && <Polyline coordinates={routeCoordinates} strokeWidth={5} />}
        </MapView>
        <View style={styles.submitButtonContainer}>
          <Button onPress={handleSubmit(onSubmit)} size="large" style={{ borderRadius: 12 }}>
            搜尋
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
  waypointInputSeparator: {
    left: 7,
    width: 1.25,
    height: 15,
    marginVertical: -5,
    backgroundColor: '#D8D8D8'
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: '5%',
    width: '100%',
    paddingHorizontal: 20
  }
})
