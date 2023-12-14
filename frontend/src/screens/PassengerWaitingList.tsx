import { FlatList, View } from 'react-native'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'

import { QueryBlock } from '~/components/QueryBlock'
import { InfoCard } from '~/components/InfoCard'
import { PassengerStackParamList } from '~/types/navigation'
import { Spinner, Text, Button, Card, Modal } from '@ui-kitten/components'
import { Match } from '~/types/data'
import { useGetMatchesQuery, useGetRequestQuery } from '~/redux/passenger'
import { useState } from 'react'
import { set } from 'react-hook-form'

type WaitingListScreenProps = NativeStackScreenProps<PassengerStackParamList, 'WaitingListScreen'>
const emptyArray: Array<Match> = []

export default function WaitingList({ route, navigation }: WaitingListScreenProps) {
  const { requestId } = route.params
  const { data: request, isLoading } = useGetRequestQuery(requestId)
  
  // https://redux-toolkit.js.org/rtk-query/usage/queries#selecting-data-from-a-query-result
  const { pendingMatches, acceptedMatches } = useGetMatchesQuery(requestId, {
    selectFromResult: ({data}) => ({
      pendingMatches: data?.matches?.filter(
        (match: Match) => match.status === 'pending'
      ) ?? emptyArray,
      acceptedMatches: data?.matches?.filter(
        (match: Match) => match.status === 'accepted' // should be accepted here
      ) ?? emptyArray
    })
  })

  const [visible, setVisible] = useState(acceptedMatches.length !== 0)
  const handleConfirm = () => {
    setVisible(false)
    navigation.navigate(
      "ArrivingScreen",
      { ride: acceptedMatches[0] }
    )
  }

  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner />
      </View>
    )

  return (
    <>
      <Modal
        visible={visible}
        backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <Card disabled={true}>
          <View style={{ padding: 15 }}>
            <Text style={{ fontSize: 18 }}>
              有司機接受了您的邀請！
            </Text>
          </View>
          
          <Button onPress={handleConfirm}>確認</Button>
        </Card>
      </Modal>
      <QueryBlock 
        time={new Date(request.time).toDateString()}
        origin={request.origin}
        destination={request.destination}
      />
      {pendingMatches.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>還沒有預約的行程</Text>
        </View>
      ) : (
        <FlatList
          data={pendingMatches}
          keyExtractor={item => item.rideId}
          renderItem={({ item }) => {
            return (
              <InfoCard
                {...item}
                pickUpTime={new Date(item.pickUpTime)}
                dropOffTime={new Date(item.dropOffTime)}
                onPress={() => {
                  navigation.push('RideInfoScreen', { 
                    requestId: requestId,
                    match: item
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