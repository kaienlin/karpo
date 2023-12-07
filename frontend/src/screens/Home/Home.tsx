import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Tab, TabBar } from '@ui-kitten/components'
import { Image } from 'expo-image'

import type { HomeScreenProps } from '~/types/screens'

import { DriverSubScreen } from './DriverSubScreen'
import { PassengerSubScreen } from './PassengerSubScreen'

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

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
    </SafeAreaView>
  )
}
