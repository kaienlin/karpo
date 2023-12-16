import { FlatList, View } from 'react-native'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'

import { QueryBlock } from '~/components/QueryBlock'
import { InfoCard } from '~/components/InfoCard'
import { PassengerStackParamList } from '~/types/navigation'
import { Spinner, Text, Button, Card, Modal } from '@ui-kitten/components'
import { Match } from '~/types/data'
import { useCancelJoinRequestMutation, useGetMatchesQuery, useGetRequestQuery } from '~/redux/api/passenger'
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
        (match: Match) => match.status === 'pending' || match.status === 'accepted'
      ) ?? emptyArray,
      acceptedMatches: data?.matches?.filter(
        (match: Match) => match.status === 'accepted'
      ) ?? emptyArray
    })
  })

  // if (pendingMatches.length !== 0) {
  //   console.log('rideId:', pendingMatches[0].rideId)
  //   console.log('joinId:', pendingMatches[0].joinId)
  // }

  const [visible, setVisible] = useState(true)
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
        visible={visible && acceptedMatches.length !== 0}
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
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
        }}>
          <Text>目前還沒有預約的行程喔</Text>
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