import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { skipToken } from '@reduxjs/toolkit/query'
import {
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  type IconProps
} from '@ui-kitten/components'


import { useGetCurrentActivityQuery, useGetUserProfileBatchQuery } from '~/redux/api/users'
import { useCreateCommentMutation } from '~/redux/comment'
import type { DriverStackParamList, MainStackParamList } from '~/types/navigation'
import { useGetScheduleQuery, useUpdateStatusMutation } from '~/redux/api/driver'
import { type RideDetailScreenProps } from '~/types/screens'



// type RideDetailScreenProps = NativeStackScreenProps<DriverStackParamList, 'RideDetailScreen'>

export default function RideDetailScreen({ navigation, route }: RideDetailScreenProps) {
  // const { rideId } = useGetCurrentActivityQuery(undefined, {
  //   selectFromResult: ({ data }) => ({ rideId: data?.driverState.rideId })
  // })
  const rideId = '12345'
  const ridePhase = 4
  const passengers = []

//   const { rideId, ridePhase, passengers } = route.params

//   const handleRideDetail = () => {
//     if (rideId)
//       navigation.navigate( 
//         'RideDetailScreen',
//         { 'rideId': rideId }
//       )
//   }

  const { schedule } = useGetScheduleQuery(rideId ?? skipToken, {
    selectFromResult: ({ data, ...rest }) => ({ schedule: data?.schedule, ...rest })
  })
//   console.log( schedule )
  const formattedData = schedule?.map(item => (

    
    {
    joinId: item.joinId,
    type: item.status === 'pick_up' ? '接' : '送',
    passengerName: item.passengerInfo.name,
    passengerCount: item.passengerInfo.numRequests,
    location: item.location.description,
    time: item.time,
    }
  ));
//   console.log( formattedData )

  const renderItem = ({ item, index }) => {
    console.log(index)
    const isPastRide = index < ridePhase
    console.log(isPastRide)
    return (
        <View>
          {/* {index > ridePhase && ( */}
            <View style={isPastRide ? styles.completeRoot : styles.root}>
              <View style={styles.RideDetailContainer}>
                <View style={{ flexDirection: 'column', alignItems: 'center', gap: 15, marginLeft: 10 }}>
                  <View style={isPastRide ? styles.completeDot : styles.dot}></View>
                  <View>
                    {index < formattedData.length - 1 && (
                      <View style={isPastRide ? styles.completeVerticleLine : styles.verticleLine}></View>
                    )}
                  </View>
                </View>
    
                <View style={{ flex: 1, flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                  <Text style={isPastRide ? styles.completePassengerInfoText : styles.passengerInfoText}>{`${item.type} ${item.passengerName} (${item.passengerCount}人)`}</Text>
                  <Text style={isPastRide ? styles.completeLocationText : styles.locationText}>{item.location}</Text>
                </View>
              </View>
            </View>
          {/* )} */}
        </View>
      );
    };



  return (
    <SafeAreaView style={styles.root}>
      <TopNavigation
        alignment="center"
        title="行程詳情"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props: IconProps) => <Icon {...props} name="arrow-back" />}
            onPress={() => {
              navigation?.goBack
            }}
          />
        )}
      />
      <FlatList
      style={{marginTop: 20}}
      data={formattedData}
      renderItem={renderItem}
    //   keyExtractor={item => item.joinId}
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
  RideDetailContainer: {
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginVertical: 10, 
    gap: 40
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 80
  },
  dot: {
    width: 10, 
    height: 10, 
    borderRadius: 10, 
    backgroundColor: "#F0C414",
  },
  verticleLine: {
    height: 50,
    width: 1,
    backgroundColor: "#F6D74C",
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: "#F6D74C",
  },
  passengerInfoText: {
    fontSize: 18,
    // color: "#909090",
  },
  locationText: {
    color: '#AC850A',
  },
  completeDot: {
    width: 10, 
    height: 10, 
    borderRadius: 10, 
    backgroundColor: "#909090",
  },
  completeVerticleLine: {
    height: 50,
    width: 1,
    backgroundColor: "#909090",
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: "#909090",
  },
  completePassengerInfoText: {
    fontSize: 18,
    color: "#909090",
  },
  completeLocationText: {
    color: '#909090',
  },
  completeRoot: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },

})
