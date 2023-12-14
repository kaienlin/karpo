import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { Button, Icon, Input, Text } from '@ui-kitten/components'

import { InputCounter, InputTime, PassengerInputCounter } from '~/components/InputModals'
import { useWaypoints } from '~/hooks/useWaypoints'
import { useGetSavedRidesQuery } from '~/redux/users'
import { displayDatetime } from '~/utils/format'

import { emptyWaypoint } from '../DriverPlanRide/PlanPanel'
import { SavedRideCard } from './components/SavedRideCard'
import { useCreateRequestMutation } from '~/redux/passenger'

export function PassengerSubScreen() {
  const navigation = useNavigation()

  const { control, handleSubmit } = useForm({
    defaultValues: {
      time: null,
      numPassengers: null,
      waypoints: [emptyWaypoint, emptyWaypoint]
    }
  })

  const { fields: waypoints } = useWaypoints(control)

  const { data: savedRides } = useGetSavedRidesQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.savedRides })
  })

  const [ createRequest ] = useCreateRequestMutation()
  const onSubmit = async (
    {time, numPassengers} : {time: string, numPassengers: number}
  ) => {
    const request = {
      time: time,
      numPassengers: numPassengers,
      origin: waypoints[0],
      destination: waypoints[1]
    }

    try {
      const response = await createRequest(request).unwrap()
      navigation.navigate('PassengerStack', {
        screen: 'SelectRideScreen',
        params: { requestId: response.requestId }
      })
    } catch (err) {
      console.error('Failed to create request: ', err)
    }
  }

  const handleSelectWaypoint = (index: number) => {
    navigation.navigate('SelectWaypointScreen', {      
      waypointIndex: index,
      waypoint: waypoints[index] 
    })
  }

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1, gap: 10, padding: 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="radio-button-on" fill={'#F0C414'} style={{ width: 32, height: 32 }} />
          <Input
            placeholder="上車地點"
            value={waypoints[0]?.description}
            onFocus={() => {
              handleSelectWaypoint(0)
            }}
            style={{ flex: 1 }}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="pin" style={{ width: 32, height: 32 }} />
          <Input
            placeholder="要去哪裡"
            value={waypoints[1]?.description}
            onFocus={() => {
              handleSelectWaypoint(1)
            }}
            style={{ flex: 1 }}
          />
        </View>
        <View
          style={{
            marginHorizontal: 6,
            marginVertical: 15,
            gap: 20
          }}
        >
          <Controller
            name="time"
            control={control}
            render={({ field: { onChange, value } }) => (
              <InputTime
                title="選擇上車時間"
                value={value}
                onChange={onChange}
                renderTriggerComponent={({ onOpen, value }) => (
                  <TouchableOpacity onPress={onOpen}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 30
                      }}
                    >
                      <Icon name="clock" style={{ width: 20, height: 20 }} fill={'#C3C3C3'} />
                      <Text style={{ fontSize: 16, color: '#C3C3C3' }}>
                        {value ? displayDatetime(value) : `出發時間`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          />
          <Controller
            name="numPassengers"
            control={control}
            render={({ field: { onChange, value } }) => (
              <PassengerInputCounter
                title="選擇人數"
                value={value}
                onChange={onChange}
                renderTriggerComponent={({ onOpen, value }) => (
                  <TouchableOpacity onPress={onOpen}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 30
                      }}
                    >
                      <Icon name="person" style={{ width: 20, height: 20 }} fill={'#C3C3C3'} />
                      <Text style={{ fontSize: 16, color: '#C3C3C3' }}>{value ?? `人數`}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          />

          <View>
            <Button size="large" style={{ borderRadius: 12 }} onPress={handleSubmit(onSubmit)}>
              搜尋
            </Button>
          </View>
        </View>
        <View style={{ marginTop: 20, gap: 10 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text category="h5">常用行程</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>管理</Text>
              <Icon style={{ width: 15, height: 15 }} name="arrow-ios-forward" />
            </TouchableOpacity>
          </View>
          {savedRides?.map((ride, index) => (
            <SavedRideCard {...ride} key={`${ride.label}-${index}`} />
          ))}
        </View>
      </View>
    </BottomSheetModalProvider>
  )
}
