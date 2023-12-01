import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList } from 'react-native';
import { Button } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import HistoryCard from '../components/HistoryCard';
import { type NativeStackScreenProps } from '@react-navigation/native-stack'


const rideInfoList = [
  {
    departTime: '2023-11-30 10:15',
    userStatus: '司機',
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
    departTime: '2023-11-30 10:30',
    userStatus: '乘客',
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
    departTime: '2023-11-30 10:44',
    userStatus: '司機',
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
    departTime: '2023-11-30 10:44',
    userStatus: '司機',
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


export default function HistoryScreen () {
  return (
    <>
      <FlatList
        data={rideInfoList}
        renderItem={({ item }) => <HistoryCard {...item} /> }
      />
    </>
  )
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'flex-start',
  },
  headerContainer: {
    paddingHorizontal: 20, // 調整 padding
    marginBottom: 5,
    alignSelf: 'flex-start', // 左上角對齊
  },
  headerText: {
    fontSize: 25, 
    fontWeight: 'bold', 
    marginTop: 20,
  },
});
  
