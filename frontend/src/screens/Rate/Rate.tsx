import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { skipToken } from '@reduxjs/toolkit/query'
import { Icon, TopNavigation, TopNavigationAction, type IconProps } from '@ui-kitten/components'
import { Text } from '@ui-kitten/components'

import RateCard from '~/components/RateCard'

import { useGetUserProfileBatchQuery, useGetCurrentActivityQuery } from '~/redux/users'
import { useCreateCommentMutation } from '~/redux/comment'

import type { MainStackParamList } from '~/types/navigation'


type RateScreenProps = NativeStackScreenProps<MainStackParamList, 'RateScreen'>

export default function RateScreen({ navigation, route }: RateScreenProps) {

  const { rideId } = useGetCurrentActivityQuery(undefined, {
    selectFromResult: ({ data }) => ({ rideId: data?.driverState.rideId })
  })

  const { userIds } = route.params
  // TODO: create mock data on mockoon
  const { data: users, isSuccess } = useGetUserProfileBatchQuery(userIds ?? skipToken)


  // TODO: onSubmit send to backend
  const [createComment] = useCreateCommentMutation()
  const onSubmit = async (id:string, rating:number, comment:string) => {
    await createComment({
      rideId: rideId ?? "",
      userId: id,
      rate: rating,
      comment: comment,
    })
  }

  return (
    <SafeAreaView style={styles.root}>
      <TopNavigation
        alignment="center"
        title="已順利完成行程！"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props: IconProps) => <Icon {...props} name="arrow-back" />}
            onPress={() => {
              navigation.navigate('BottomTab', { screen: 'HomeScreen' })
            }
          }
          />
        )}
      />

      {isSuccess && (
        <FlatList 
          data={users} 
          renderItem={({ item }) => 
          <RateCard 
          userInfo={ item }
          onSubmit={onSubmit} />} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  headerContainer: {
    paddingHorizontal: 20, // 調整 padding
    marginBottom: 5,
    alignSelf: 'flex-start' // 左上角對齊
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 80
    
  }
})
