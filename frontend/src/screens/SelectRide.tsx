import { FlatList, View } from 'react-native'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { Icon, Text } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'

import InfoCard from '../components/InfoCard'

const rideInfoList = [
  {
    departTime: '10:15',
    arrivalTime: '10:35',
    price: 300,
    rating: 5.0,
    vacuumSeat: 1,
    rideStatus: '很順路',
    driverOrigin: '台積電 12 廠',
    driverDestination: '竹北市光明六路 16 號',
    origin2route: 0.3,
    destination2route: 0.7
  },
  {
    departTime: '10:30',
    arrivalTime: '10:56',
    price: 280,
    rating: 4.8,
    vacuumSeat: 1,
    rideStatus: '非常順路',
    driverOrigin: '園區二路 57 號',
    driverDestination: '竹北市光明六路 116 號',
    origin2route: 0.3,
    destination2route: 0.7
  },
  {
    departTime: '10:44',
    arrivalTime: '11:08',
    price: 320,
    rating: 4.5,
    vacuumSeat: 1,
    rideStatus: '有點繞路',
    driverOrigin: '實驗中學',
    driverDestination: '博愛國小',
    origin2route: 0.3,
    destination2route: 0.7
  },
  {
    departTime: '10:44',
    arrivalTime: '11:08',
    price: 320,
    rating: 4.5,
    vacuumSeat: 1,
    rideStatus: '有點繞路',
    driverOrigin: '實驗中學',
    driverDestination: '博愛國小',
    origin2route: 0.3,
    destination2route: 0.7
  }
]

const query = {
  origin: '台積電 12 廠',
  destination: '十興國小',
  date: '2023/11/21'
}

type SelectRideScreenProps = NativeStackScreenProps<HomeStackParamList, 'SelectRideScreen'>

export default function SelectRide({ navigation }: SelectRideScreenProps) {
  return (
    <>
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignContent: 'center',
            marginHorizontal: 20,
            marginTop: 20
          }}
        >
          <Text style={{ fontSize: 22 }}>{query.origin}</Text>
          <Icon name="arrow-forward-outline" style={{ width: 42, height: 30 }} />
          <Text style={{ fontSize: 22 }}>{query.destination}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignContent: 'center',
            marginHorizontal: 20,
            marginVertical: 5
          }}
        >
          <Text>{query.date}</Text>
        </View>
      </View>
      <FlatList
        data={rideInfoList}
        renderItem={({ item }) => {
          return (
            <InfoCard
              {...item}
              onPress={() => {
                navigation.navigate('RideInfoScreen', { ...item })
              }}
            />
          )
        }}
      />
    </>
  )
}
