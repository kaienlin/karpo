import { FlatList, View } from 'react-native'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'

import { QueryBlock } from '~/components/QueryBlock'
import { InfoCard, CardProps } from '~/components/InfoCard'
import { PassengerStackParamList } from '~/types/navigation'
import { useSelector } from 'react-redux'
import { Spinner, Text } from '@ui-kitten/components'
import { useMemo } from 'react'
import { Match } from '~/types/data'
import { createSelector } from '@reduxjs/toolkit'
import { useGetMatchesQuery, useGetRequestQuery } from '~/redux/passenger'

type WaitingListScreenProps = NativeStackScreenProps<PassengerStackParamList, 'WaitingListScreen'>
const emptyArray: Array<Match> = []

export default function WaitingList({ route, navigation }: WaitingListScreenProps) {
  const { requestId } = route.params
  const { data: request, isLoading } = useGetRequestQuery(requestId)
  
  // https://redux-toolkit.js.org/rtk-query/usage/queries#selecting-data-from-a-query-result
  const { pendingMatches } = useGetMatchesQuery(requestId, {
    selectFromResult: ({data}) => ({
      pendingMatches: data?.matches?.filter(
        (match: Match) => match.status === 'pending'
      ) ?? emptyArray
    })
  })

  let content
  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner />
      </View>
    )

  return (
    <>
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