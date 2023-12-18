import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { skipToken } from '@reduxjs/toolkit/query'
import { Tab, TabBar } from '@ui-kitten/components'
import { Image } from 'expo-image'

import { selectDriverState } from '~/redux/api/driver'
import { useGetCurrentActivityQuery } from '~/redux/api/users'
import { useGetRideStatusQuery } from '~/redux/passenger'
import type { HomeScreenProps } from '~/types/screens'

import { DriverSubScreen } from './DriverSubScreen'
import { PassengerSubScreen } from './PassengerSubScreen'

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: result => ({ ...result, ...selectDriverState(result) })
  })
  const { ridePhase } = useGetRideStatusQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ ridePhase: data?.phase, ...rest })
  })

  useEffect(() => {
    if (rideId && ridePhase) {
      if (ridePhase < 0) {
        console.log('DriverSelectJoinScreen')
        navigation.navigate('DriverStack', { screen: 'DriverSelectJoinScreen' })
      } else {
        console.log('DriverDepartScreen')
        navigation.navigate('DriverStack', { screen: 'DriverDepartScreen' })
      }
    }
  }, [rideId, ridePhase])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ paddingVertical: 10, paddingHorizontal: 40 }}>
        <TabBar
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          indicatorStyle={{
            width: '83%'
          }}
        >
          <Tab
            title="發起共乘"
            icon={({ style: { height, width } }) => (
              <Image
                style={{ height, width }}
                cachePolicy="memory-disk"
                source={require('~/assets/icons/hatchback.png')}
              />
            )}
            style={{ flexDirection: 'row', gap: 8 }}
          />
          <Tab
            title="尋找共乘"
            icon={({ style: { height, width } }) => (
              <Image
                style={{ height, width }}
                cachePolicy="memory-disk"
                source={require('~/assets/icons/dog.png')}
              />
            )}
            style={{ flexDirection: 'row', gap: 8 }}
          />
        </TabBar>
      </View>
      {selectedIndex === 0 ? (
        <ScrollView style={{ marginTop: 15, paddingHorizontal: 20 }}>
          <DriverSubScreen />
        </ScrollView>
      ) : (
        <PassengerSubScreen />
      )}
    </SafeAreaView>
  )
}
