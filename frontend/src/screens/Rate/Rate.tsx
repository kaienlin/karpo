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

  // const { userIds } = route.params
  // TODO: create mock data on mockoon
  const userIds  = [
    '94bd2c03-54b4-469a-9af4-df34e29bfd69',
    "6dc48bd6-da3b-4550-84a2-b9b2ba426b08",
    "08cc78e3-f735-4afe-8f15-02568e6cbeb2",
    "a28202cb-be1b-450e-8970-b8ab138d5314",
    "c2545b36-44cb-48dd-a6f1-a08068e91d1a"
  ]
  
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
      {/* <View>
        <Text>{users[0]}</Text>
      </View> */}
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
