import { FlatList, View } from 'react-native'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'

import { QueryBlock, QueryProps } from '~/components/QueryBlock'
import { InfoCard, CardProps } from '~/components/InfoCard'
import { PassengerStackParamList } from '~/navigation/PassengerStack'
import { useSelector } from 'react-redux'
import { WaitingRidesSelector } from '~/redux/ride'
import { Text } from '@ui-kitten/components'

type WaitingListScreenProps = NativeStackScreenProps<PassengerStackParamList, 'WaitingListScreen'>

export default function WaitingList({ route, navigation }: WaitingListScreenProps) {
  const rideList = useSelector(WaitingRidesSelector)

  return (
    <>
      <QueryBlock {...route.params.query} />
      {rideList.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>還沒有預約的行程</Text>
        </View>
      ) : (
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
                    query: route.params.query
                  })
                }}
              />
            )
          }}
        />
      )} 
    </>
  )
}