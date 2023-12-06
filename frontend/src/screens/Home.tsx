import { useState, useRef } from 'react'
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { 
  Button,
  Card, 
  Icon, 
  Input, 
  Tab, 
  TabBar, 
  Text, 
  useTheme 
} from '@ui-kitten/components'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'

import { restoreWaypoints } from '../redux/waypoints'
import type { HomeScreenProps } from '../types/screens'

interface SavedRide {
  label: string
  time: string
  origin: Waypoint
  destination: Waypoint
  waypoints?: Waypoint[]
}

const savedRides: SavedRide[] = [
  {
    label: '上班',
    time: '09:00',
    origin: { title: '國立竹北高級中學', latitude: 24.837, longitude: 121.004 },
    destination: { title: '台積電12廠', latitude: 24.771, longitude: 121.011 }
  },
  {
    label: '下班',
    time: '18:00',
    origin: { title: '台積電12廠', latitude: 24.771, longitude: 121.011 },
    destination: { title: '國立竹北高級中學', latitude: 24.837, longitude: 121.004 }
  }
]

function SavedRideCard({
  label,
  time,
  origin,
  destination,
  onPress
}: SavedRide & { onPress?: () => void }) {
  const theme = useTheme()

  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                backgroundColor: theme['color-basic-600'],
                borderRadius: 100,
                paddingVertical: 5,
                paddingHorizontal: 10
              }}
            >
              <Text style={{ color: theme['color-basic-100'], fontWeight: 'bold' }}>{label}</Text>
            </View>
            <Text style={{ fontSize: 18 }}>{time}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ width: 130 }}>{origin.title}</Text>
            <Icon style={{ width: 18, height: 18, marginRight: 5 }} name="arrow-forward" />
            <Text>{destination.title}</Text>
          </View>
        </View>
        <Icon
          style={{ width: 20, height: 20 }}
          name="arrow-ios-forward"
          fill={theme['color-basic-500']}
        />
      </View>
    </Card>
  )
}

function DriverSubScreen({
  onMainPress,
  onSelectSavedRide,
  onManageSavedRide,
  savedRides
}: {
  onMainPress: () => void
  onSelectSavedRide: (ride: SavedRide) => void
  onManageSavedRide?: () => void
  savedRides?: SavedRide[]
}) {
  const theme = useTheme()
  return (
    <>
      <View
        style={{
          backgroundColor: theme['background-basic-color-2'],
          borderRadius: 100
        }}
      >
        <TouchableOpacity
          onPress={onMainPress}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 15,
            paddingHorizontal: 20
          }}
        >
          <Icon
            style={{ width: 20, height: 20 }}
            name="search-outline"
            fill={theme['text-hint-color']}
          />
          <Text category="h5" style={{ color: theme['text-hint-color'] }}>
            要去哪裡？
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 30, gap: 10 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text category="h5">常用行程</Text>
          <TouchableOpacity
            onPress={onManageSavedRide}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text>管理</Text>
            <Icon style={{ width: 15, height: 15 }} name="arrow-ios-forward" />
          </TouchableOpacity>
        </View>
        {savedRides?.map((ride, index) => (
          <SavedRideCard
            {...ride}
            key={`${ride.label}-${index}`}
            onPress={() => {
              onSelectSavedRide(ride)
            }}
          />
        ))}
      </View>
    </>
  )
}

function PassengerSubScreen() {
  const theme = useTheme()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon 
          name='radio-button-on' 
          fill={'#F0C414'} 
          style={{ width: 32, height: 32 }}
        />
        <Input 
          placeholder='上車地點'
          value={origin}
          onChangeText={nextOrigin => setOrigin(nextOrigin)}
          style={{ flex: 1 }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon 
          name='pin'  
          style={{ width: 32, height: 32 }}
        />
        <Input 
          placeholder='要去哪裡'
          value={destination}
          onChangeText={nextDestination => setDestination(nextDestination)}
          style={{ flex: 1 }}
        />
      </View>
      <View style={{ 
        marginHorizontal: 6,
        marginVertical: 15,
        gap: 20
      }}>
        <TouchableOpacity>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 30,
          }}>
            <Icon 
              name='clock' 
              style={{ width: 20, height: 20 }}
              fill={'#C3C3C3'}
            />
            <Text style={{ fontSize: 16, color: '#C3C3C3' }}>出發時間</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 30,
          }}>
            <Icon 
              name='person' 
              style={{ width: 20, height: 20 }}
              fill={'#C3C3C3'}
            />
            <Text style={{ fontSize: 16, color: '#C3C3C3' }}>人數</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20, gap: 10 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text category="h5">常用行程</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text>管理</Text>
            <Icon style={{ width: 15, height: 15 }} name="arrow-ios-forward" />
          </TouchableOpacity>
        </View>
        {savedRides?.map((ride, index) => (
          <SavedRideCard
            {...ride}
            key={`${ride.label}-${index}`}
          />
        ))}
      </View>
    </View>
  )
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const dispatch = useDispatch()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const driverHandlers = {
    handleMainPress: () => {
      navigation.navigate('DriverStack', { screen: 'DriverPlanRideScreen' })
    },
    handleSelectSavedRide: (ride: SavedRide) => {
      const { origin, destination, waypoints } = ride
      dispatch(restoreWaypoints({ origin, destination, waypoints }))
      navigation.navigate('DriverStack', { screen: 'DriverPlanRideScreen' })
    },
    handleManageSavedRide: () => {}
  }

  const passengerHandlers = {
    handleMainPress: () => {
      navigation.navigate('PassengerStack', { screen: 'SelectRideScreen' })
    },
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
                source={require('../../assets/icons/hatchback.png')}
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
                source={require('../../assets/icons/dog.png')}
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
            savedRides={savedRides}
          />
        ) : (
          <PassengerSubScreen />
        )}
      </ScrollView>
      {selectedIndex === 1 && 
        <View style={styles.submitButtonContainer}>
          <Button 
            size="large" 
            style={{ borderRadius: 12 }}
            onPress={passengerHandlers.handleMainPress}
          >
            搜尋
          </Button>
        </View>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  submitButtonContainer: {
    width: '100%',
    padding: 20
  }
})