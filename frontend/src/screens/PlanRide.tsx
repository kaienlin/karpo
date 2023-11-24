import { useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet'
import { decode as decodePolyline } from '@mapbox/polyline'
import DateTimePicker from '@react-native-community/datetimepicker'
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

import { type RootState } from '../redux/store'
import { addWaypoint, clearWaypoints, removeWaypoint } from '../redux/waypoints'
import { MapsAPI } from '../services/maps'
import { type PlanRideScreenProps } from '../types/screens'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />
const CloseIcon = (props: IconProps) => <Icon {...props} name="close" />

const parseDatetime = (date: Date) => {
  const today = new Date()

  const dateStr =
    date.toLocaleDateString() === today.toLocaleDateString()
      ? '今天'
      : date.toLocaleDateString('zh-TW', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('zh-TW', { hour: 'numeric', minute: 'numeric' })

  return `${dateStr} ${timeStr}`
}

function Counter({
  value,
  onValueChange,
  minValue = 0,
  maxValue = 5
}: {
  value: number
  onValueChange: (value: number) => void
  minValue?: number
  maxValue?: number
}) {
  const theme = useTheme()

  const decrease = () => {
    if (value > minValue) {
      onValueChange((prev) => prev - 1)
    }
  }
  const increase = () => {
    if (value < maxValue) {
      onValueChange((prev) => prev + 1)
    }
  }

  const decreaseDisabled = value <= minValue
  const increaseDisabled = value >= maxValue

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
      }}
    >
      <TouchableOpacity onPress={decrease} disabled={decreaseDisabled} activeOpacity={0.5}>
        <Icon
          style={{ width: 40, height: 40 }}
          name="minus-circle-outline"
          fill={decreaseDisabled ? theme['color-basic-disabled'] : theme['color-basic-700']}
        />
      </TouchableOpacity>
      <Text style={{ width: 50, fontSize: 30, fontWeight: '500', textAlign: 'center' }}>
        {value}
      </Text>

      <TouchableOpacity onPress={increase} disabled={increaseDisabled} activeOpacity={0.5}>
        <Icon
          style={{ width: 40, height: 40 }}
          name="plus-circle-outline"
          fill={increaseDisabled ? theme['color-basic-disabled'] : theme['color-basic-700']}
        />
      </TouchableOpacity>
    </View>
  )
}

function TimePicker({ date, setDate }: { date: Date; setDate: (date: Date) => void }) {
  const onChange = (event, selectedDate) => {
    setDate(selectedDate)
  }
  // TODO: validate expired date (and set to nears valid date)
  // TODO: add support for Android

  return (
    <View style={{ flex: 1 }}>
      <DateTimePicker
        value={date}
        mode={'datetime'}
        onChange={onChange}
        display="spinner"
        minuteInterval={5}
        locale="zh-TW"
      />
    </View>
  )
}

interface RidePlan {
  departTime: Date | null
  numSeats: number
  waypoints: Waypoint[]
}

export default function PlanRideScreen({ navigation }: PlanRideScreenProps) {
  const theme = useTheme()
  const waypoints = useSelector((state: RootState) => state.waypoints)
  const dispatch = useDispatch()

  const mapRef = useRef<MapView>(null)
  const timeModalRef = useRef<BottomSheetModal>(null)
  const seatsModalRef = useRef<BottomSheetModal>(null)

  const [tempNumSeats, setTempNumSeats] = useState(0)
  const [tempDepartTime, setTempDepartTime] = useState<Date | null>(new Date())

  const { control, handleSubmit } = useForm<RidePlan>({
    defaultValues: {
      departTime: null,
      numSeats: 0
    }
  })

  const [route, setRoute] = useState<string | null>(null)
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

  const onSubmit = async (data: RidePlan) => {
    // TODO:
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

        <View style={{ paddingLeft: 25, paddingRight: 10, paddingBottom: 15 }}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              columnGap: 10
            }}
            style={{ paddingBottom: 10 }}
          >
            <Controller
              name="departTime"
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
                  <BottomSheetModal
                    ref={timeModalRef}
                    index={1}
                    snapPoints={['55%', '55%']}
                    backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
                    handleIndicatorStyle={{ display: 'none' }}
                  >
                    <View
                      style={{
                        flex: 1,
                        paddingVertical: 20,
                        paddingHorizontal: 40,
                        gap: 20
                      }}
                    >
                      <Text category="h5">選擇出發時間</Text>
                      <TimePicker date={tempDepartTime} setDate={setTempDepartTime} />
                      <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
                        <Button
                          size="giant"
                          style={{ borderRadius: 100 }}
                          onPress={() => {
                            onChange(tempDepartTime)
                            timeModalRef.current?.dismiss()
                          }}
                        >
                          確定
                        </Button>
                      </View>
                    </View>
                  </BottomSheetModal>
                </>
              )}
            />
            <Controller
              name="numSeats"
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
                    {value === 0 ? '可搭載人數' : `可搭載 ${value} 人`}
                  </Button>
                  <BottomSheetModal
                    ref={seatsModalRef}
                    index={1}
                    snapPoints={['40%', '40%']}
                    backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
                    handleIndicatorStyle={{ display: 'none' }}
                  >
                    <View
                      style={{
                        flex: 1,
                        paddingVertical: 20,
                        paddingHorizontal: 40,
                        gap: 20
                      }}
                    >
                      <Text category="h5">可搭載人數</Text>
                      <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
                        <Counter value={tempNumSeats} onValueChange={setTempNumSeats} />
                        <Button
                          size="giant"
                          style={{ borderRadius: 100 }}
                          onPress={() => {
                            onChange(tempNumSeats)
                            seatsModalRef.current?.dismiss()
                          }}
                        >
                          確定
                        </Button>
                      </View>
                    </View>
                  </BottomSheetModal>
                </>
              )}
            />
          </ScrollView>
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
            <View style={{ alignItems: 'flex-end', marginTop: 15, marginRight: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(addWaypoint())
                }}
                style={{
                  flexDirection: 'row',
                  gap: 3,
                  alignItems: 'center'
                }}
              >
                <Text category="label" style={{ fontSize: 14 }}>
                  新增停靠點
                </Text>
                <Icon style={{ width: 15, height: 15 }} name="plus" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <MapView
          ref={mapRef}
          style={{ flex: 1, width: '100%', height: '100%' }}
          provider="google"
          showsUserLocation={true}
        >
          {routeCoordinates && <Polyline coordinates={routeCoordinates} strokeWidth={5} />}
        </MapView>
        <View style={{ position: 'absolute', bottom: '5%', width: '100%', paddingHorizontal: 20 }}>
          <Button onPress={handleSubmit(onSubmit)} size="large" style={{ borderRadius: 12 }}>
            發布行程
          </Button>
        </View>
      </BottomSheetModalProvider>
    </SafeAreaView>
  )
}
