import { useState } from 'react'
import { FlatList, View } from 'react-native'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'

import { PassengerStackParamList } from '~/navigation/PassengerStack'
import { InfoCard } from '~/components/InfoCard'
import { QueryBlock } from '~/components/QueryBlock'
import { HeaderProps } from '~/components/CardHeader'
import { shallowEqual, useSelector } from 'react-redux'
import { IdleRidesSelector } from '~/redux/ride'
import { Button } from '@ui-kitten/components'

const query = {
  origin: '台積電 12 廠',
  destination: '十興國小',
  date: '2023/11/21'
}

type SelectRideScreenProps = NativeStackScreenProps<PassengerStackParamList, 'SelectRideScreen'>

export default function SelectRide({ navigation }: SelectRideScreenProps) {

  const rideList = useSelector(IdleRidesSelector)

  return (
    <>
      <QueryBlock {...query} />
      <FlatList
        data={rideList}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          return (
            <InfoCard
              {...item}
              onPress={() => {
                navigation.push('RideInfoScreen', {
                  rideId: item.id,
                  query: query
                })
              }}
            />
          )
        }}
      />
      <View style={{ padding: 20 }}>
        <Button
          size="large" 
          style={{ borderRadius: 12 }}
          onPress={() => navigation.push('WaitingListScreen', { query: query })}
        >
          預  約  清  單
        </Button>
      </View>
    </>
  )
}
