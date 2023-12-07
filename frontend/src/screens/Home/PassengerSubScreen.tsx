import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Button, Icon, Input, Text } from '@ui-kitten/components'

import { useGetSavedRidesQuery } from '~/redux/users'

import { SavedRideCard } from './components/SavedRideCard'

export function PassengerSubScreen() {
  const navigation = useNavigation()
  const { data: savedRides } = useGetSavedRidesQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.savedRides })
  })

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const handleMainPress = () => {
    navigation.navigate('PassengerStack', { screen: 'SelectRideScreen' })
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name="radio-button-on" fill={'#F0C414'} style={{ width: 32, height: 32 }} />
        <Input
          placeholder="上車地點"
          value={origin}
          onChangeText={(nextOrigin) => setOrigin(nextOrigin)}
          style={{ flex: 1 }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name="pin" style={{ width: 32, height: 32 }} />
        <Input
          placeholder="要去哪裡"
          value={destination}
          onChangeText={(nextDestination) => setDestination(nextDestination)}
          style={{ flex: 1 }}
        />
      </View>
      <View
        style={{
          marginHorizontal: 6,
          marginVertical: 15,
          gap: 20
        }}
      >
        <TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 30
            }}
          >
            <Icon name="clock" style={{ width: 20, height: 20 }} fill={'#C3C3C3'} />
            <Text style={{ fontSize: 16, color: '#C3C3C3' }}>出發時間</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 30
            }}
          >
            <Icon name="person" style={{ width: 20, height: 20 }} fill={'#C3C3C3'} />
            <Text style={{ fontSize: 16, color: '#C3C3C3' }}>人數</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20, gap: 10 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text category="h5">常用行程</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>管理</Text>
            <Icon style={{ width: 15, height: 15 }} name="arrow-ios-forward" />
          </TouchableOpacity>
        </View>
        {savedRides?.map((ride, index) => (
          <SavedRideCard {...ride} key={`${ride.label}-${index}`} />
        ))}
      </View>
      <View style={styles.submitButtonContainer}>
        <Button size="large" style={{ borderRadius: 12 }} onPress={handleMainPress}>
          搜尋
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  submitButtonContainer: {
    width: '100%',
    padding: 20
  }
})
