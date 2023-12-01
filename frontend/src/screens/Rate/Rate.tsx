import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList } from 'react-native';
import { Rating } from '@kolking/react-native-rating';
import { Button } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import RateCard from '../components/RateCard';
import { type NativeStackScreenProps } from '@react-navigation/native-stack'


// interface RateScreenProps {
//   navigation: any; // 根據實際情況更改類型
// }
const driverInfoList = [
    { name: '本丸', },
    { name: 'Topi', },
    { name: 'Chako', },
  ]

type RateScreenProps = NativeStackScreenProps<HomeStackParamList, 'RateScreen'>


export default function RateScreen ({ navigation }: RateScreenProps) {

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>已順利完成行程！</Text>
      </View>

      <FlatList 
        data={driverInfoList}
        renderItem={({item}) => <RateCard {...item} />}
      />

    </SafeAreaView>
  );
};

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
    
