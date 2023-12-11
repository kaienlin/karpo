import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Tab, TabBar } from '@ui-kitten/components'
import { Image } from 'expo-image'
import { useCreateRequestMutation } from '~/redux/passenger'
import type { HomeScreenProps } from '~/types/screens'

import { DriverSubScreen } from './DriverSubScreen'
import { PassengerSubScreen } from './PassengerSubScreen'

const request = {
  time: new Date().toString(),
  origin: {
    latitude: 24.768607823378787,
    longitude: 121.01470454621833,
    description: '台積電 12 廠'
  }, 
  destination: { 
    latitude: 24.824314037354945,
    longitude: 121.02436304972142,
    description: '十興國小'
  },
  numPassengers: 1
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [ createRequest ] = useCreateRequestMutation()

  const handleCreateRequest = async () => {
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
      <ScrollView style={{ marginTop: 15, paddingHorizontal: 20 }}>
        {selectedIndex === 0 ? <DriverSubScreen /> : <PassengerSubScreen />}
      </ScrollView>
      {selectedIndex === 1 && (
        <View style={{ padding: 20 }}>
          <Button size="large" style={{ borderRadius: 12 }} onPress={handleCreateRequest}>
            搜尋
          </Button>
        </View>
      )}
    </SafeAreaView>
  )
}
