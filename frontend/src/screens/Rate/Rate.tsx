import { FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { Icon, TopNavigation, TopNavigationAction, type IconProps } from '@ui-kitten/components'

import RateCard from '~/components/RateCard'

// interface RateScreenProps {
//   navigation: any; // 根據實際情況更改類型
// }
const driverInfoList = [
  { id: '000', name: '本丸' },
  { id: '001', name: 'Topi' },
  { id: '002', name: 'Chako' }
]

type RateScreenProps = NativeStackScreenProps<HomeStackParamList, 'RateScreen'>

export default function RateScreen({ navigation }: RateScreenProps) {
  return (
    <SafeAreaView style={styles.root}>
      <TopNavigation
        alignment="center"
        title="已順利完成行程！"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props: IconProps) => <Icon {...props} name="arrow-back" />}
            onPress={() => {
              navigation.navigate('HomeScreen')
            }}
          />
        )}
      />

      <FlatList data={driverInfoList} renderItem={({ item }) => <RateCard userInfo={item} />} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
    //   alignItems: 'center',
    //   justifyContent: 'flex-start',
  },
  headerContainer: {
    paddingHorizontal: 20, // 調整 padding
    marginBottom: 5,
    alignSelf: 'flex-start' // 左上角對齊
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 20
  }
})
