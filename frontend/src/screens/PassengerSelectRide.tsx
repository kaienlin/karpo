import { useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'

import { InfoCard } from '~/components/InfoCard'
import { QueryBlock } from '~/components/QueryBlock'
import { HeaderProps } from '~/components/CardHeader'
import { shallowEqual, useSelector } from 'react-redux'
import { Button, Spinner, Text } from '@ui-kitten/components'
import { useGetMatchesQuery, useGetRequestQuery } from '~/redux/passenger'
import { Match } from '~/types/data'
import { PassengerStackParamList } from '~/types/navigation'

type SelectRideScreenProps = NativeStackScreenProps<PassengerStackParamList, 'SelectRideScreen'>
const emptyArray: Array<Match> = []

export default function SelectRide({ route, navigation }: SelectRideScreenProps) {
  const { requestId } = route.params
  const requestRes = useGetRequestQuery(requestId)
  const matchRes = useGetMatchesQuery(requestId)

  // https://redux-toolkit.js.org/rtk-query/usage/queries#selecting-data-from-a-query-result
  const { unaskedMatches } = useGetMatchesQuery(requestId, {
    selectFromResult: ({data}) => ({
      unaskedMatches: data?.matches?.filter(
        (match: Match) => match.status === 'unasked'
      ) ?? emptyArray
    })
  })

  let content
  if (requestRes.isLoading || matchRes.isLoading) {
    content = (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner />
      </View>
    )
  } else {
    const request = requestRes.data
    content = (
      <>
        <QueryBlock 
          time={new Date(request.time).toDateString()}
          origin={request.origin}
          destination={request.destination}
        />
        <FlatList
          data={unaskedMatches}
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
      </>
    )
  }

  return (
    <>
      {content}
      <View style={{ padding: 20 }}>
        <Button
          size="large" 
          style={{ borderRadius: 12 }}
          onPress={() => navigation.push('WaitingListScreen', { requestId })}
        >
          預  約  清  單
        </Button>
      </View>
    </>
  )
}
