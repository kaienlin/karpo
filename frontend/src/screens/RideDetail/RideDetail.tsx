import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { skipToken } from '@reduxjs/toolkit/query'
import { useState, useEffect } from 'react';
import {
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  type IconProps
} from '@ui-kitten/components'
import RateCard from '~/components/RateCard'
import RideDetailCard from '~/components/RideDetailCard'



import { useGetCurrentActivityQuery, useGetUserProfileBatchQuery } from '~/redux/api/users'
import { useCreateCommentMutation } from '~/redux/comment'
import type { DriverStackParamList, MainStackParamList } from '~/types/navigation'
import { useGetScheduleQuery, useUpdateStatusMutation } from '~/redux/api/driver'
import { type RideDetailScreenProps } from '~/types/screens'
import type { ScheduleDetailed } from '~/types/data'


export default function RideDetailScreen({ navigation, route }: RideDetailScreenProps) {
  const { rideId, ridePhase, passengers } = route.params
  const [combinedData, setCombinedData] = useState<ScheduleDetailed[]>([]);
  const { schedule } = useGetScheduleQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ schedule: data?.schedule, ...rest })
  })


  useEffect(() => {
    if (schedule) {
      // 根据 joinId 将 schedule 和 passengers 结合起来
      const combined: ScheduleDetailed[] = schedule.map(scheduleItem => {
        const passenger = passengers.find(p => p.joinId === scheduleItem.joinId);

        return {
          ...scheduleItem,
          passengerInfo: passenger || null,
        } as ScheduleDetailed;
      });
      if (!arraysEqual(combined, combinedData)) {
        setCombinedData(combined);
      }
    }
  }, [schedule, passengers]);
  
  function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  }


  if(schedule === undefined || combinedData.length === 0 || passengers.length === 0){

    return(
    <SafeAreaView>
      <TopNavigation
        alignment="center"
        title="行程詳情"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props: IconProps) => <Icon {...props} name="arrow-back" />}
            onPress={() => {
              navigation.goBack()
            }
          }
          />
        )}
      />
    </SafeAreaView>)
  }

  const formattedData = combinedData?.map(item => (
    {
      joinId: `${item.joinId}_${item.status}`, // Ensure unique keys
      type: item.status === 'pick_up' ? '接' : '送',
      completeType: item.status === 'pick_up' ? '已上車' : '已下車',
      passengerActionType: item.status === 'pick_up' ? '上車' : '下車',
      passengerName: item.passengerInfo.name,
      passengerCount: item.passengerInfo.numPassengers,
      location: item.location.description,
      time: item.time,
      iconName: item.status === 'pick_up' ? 'radio-button-on' : 'pin',
      iconFilledColor: item.status === 'pick_up' ? 'color-primary-default' : 'color-basic-700',
    }
  ));
  
  return (
    <SafeAreaView style={styles.root}>
      <TopNavigation
        alignment="center"
        title="行程詳情"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props: IconProps) => <Icon {...props} name="arrow-back" />}
            onPress={() => {
              navigation?.goBack()
            }}
          />
        )}
      />
      <FlatList
      style={{marginTop: 20}}
      data={formattedData}
      renderItem={({ item, index }) => <RideDetailCard rideInfo={item} index={index} len={formattedData.length} ridePhase={ridePhase} />}
      keyExtractor={item => item.joinId}
    />

    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  root: {
    flex: 1, 
    flexDirection: 'column', 
    marginLeft: 10,
  },
  
})
