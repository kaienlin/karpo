import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { Tab, TabBar } from '@ui-kitten/components'
import { Image } from 'expo-image'

import { restoreWaypoints } from '~/redux/waypoints'
import type { HomeScreenProps } from '~/types/screens'

import { DriverSubScreen } from './DriverSubScreen'

interface SavedRide {
  label: string
  time: string
  origin: Waypoint
  destination: Waypoint
  waypoints?: Waypoint[]
}

// function PassengerSubScreen({
//   onMainPress,
//   onSelectSavedRide,
//   onManageSavedRide,
//   savedRides
// }: {
//   onMainPress: () => void
//   onSelectSavedRide: (ride: SavedRide) => void
//   onManageSavedRide?: () => void
//   savedRides?: SavedRide[]
// }) {
//   const theme = useTheme()
//   return (
//     <>
//       <View
//         style={{
//           backgroundColor: theme['background-basic-color-2'],
//           borderRadius: 100
//         }}
//       >
//         <TouchableOpacity
//           onPress={onMainPress}
//           activeOpacity={0.7}
//           style={{
//             flex: 1,
//             flexDirection: 'row',
//             alignItems: 'center',
//             gap: 10,
//             paddingVertical: 15,
//             paddingHorizontal: 20
//           }}
//         >
//           <Icon
//             style={{ width: 20, height: 20 }}
//             name="search-outline"
//             fill={theme['text-hint-color']}
//           />
//           <Text category="h5" style={{ color: theme['text-hint-color'] }}>
//             要去哪裡？
//           </Text>
//         </TouchableOpacity>
//       </View>
//       <View style={{ marginTop: 30, gap: 10 }}>
//         <View
//           style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
//         >
//           <Text category="h5">常用行程</Text>
//           <TouchableOpacity
//             onPress={onManageSavedRide}
//             style={{ flexDirection: 'row', alignItems: 'center' }}
//           >
//             <Text>管理</Text>
//             <Icon style={{ width: 15, height: 15 }} name="arrow-ios-forward" />
//           </TouchableOpacity>
//         </View>
//         {savedRides?.map((ride, index) => (
//           <SavedRideCard
//             {...ride}
//             key={`${ride.label}-${index}`}
//             onPress={() => {
//               onSelectSavedRide(ride)
//             }}
//           />
//         ))}
//       </View>
//     </>
//   )
// }

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const dispatch = useDispatch()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const driverHandlers = {
    handleMainPress: () => {
      navigation.navigate('DriverStack', { screen: 'PlanRideScreen' })
    },
    handleSelectSavedRide: (ride: SavedRide) => {
      const { origin, destination, waypoints } = ride
      dispatch(restoreWaypoints({ origin, destination, waypoints }))
      navigation.navigate('DriverStack', { screen: 'PlanRideScreen' })
    },
    handleManageSavedRide: () => {}
  }

  const passengerHandlers = {
    handleMainPress: () => {
      navigation.navigate('PassengerStack', { screen: 'PlanRideScreen' })
    }
    // handleSelectSavedRide: (ride: SavedRide) => {
    //   const { origin, destination, waypoints } = ride
    //   dispatch(restoreWaypoints({ origin, destination, waypoints }))
    //   navigation.navigate('PassengerStack', { screen: 'PlanRideScreen' })
    // },
    // handleManageSavedRide: () => {}
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
        {selectedIndex === 0 ? (
          <DriverSubScreen
            onMainPress={driverHandlers.handleMainPress}
            onSelectSavedRide={driverHandlers.handleSelectSavedRide}
            onManageSavedRide={driverHandlers.handleManageSavedRide}
            // savedRides={savedRides}
          />
        ) : (
          // <PassengerSubScreen onMainPress={passengerHandlers.handleMainPress} />
          <></>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
