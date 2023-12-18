import { TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Icon, Text, useTheme } from '@ui-kitten/components'

import savedRidesRaw from '~/assets/templates/savedRides.json'
import { transformSavedRide } from '~/redux/api/users'

import { SavedRideCard } from './components/SavedRideCard'

export function DriverSubScreen() {
  const theme = useTheme()
  const navigation = useNavigation()

  const savedRides = savedRidesRaw.map(value => transformSavedRide(value))

  const onPressPlan = () => {
    navigation.navigate('DriverStack', {
      screen: 'DriverPlanRideScreen'
    })
  }

  const onSelectSavedRide = (index: number) => {
    navigation.navigate('DriverStack', {
      screen: 'DriverPlanRideScreen',
      params: { savedRideIndex: index }
    })
  }

  const onPressManageSavedRide = () => {}

  return (
    <>
      <View
        style={{
          backgroundColor: theme['background-basic-color-2'],
          borderRadius: 100
        }}
      >
        <TouchableOpacity
          onPress={onPressPlan}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 15,
            paddingHorizontal: 20
          }}
        >
          <Icon
            style={{ width: 20, height: 20 }}
            name="search-outline"
            fill={theme['text-hint-color']}
          />
          <Text category="h5" style={{ color: theme['text-hint-color'] }}>
            要去哪裡？
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 30, gap: 10 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text category="h5">常用行程</Text>
          <TouchableOpacity
            onPress={onPressManageSavedRide}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text>管理</Text>
            <Icon style={{ width: 15, height: 15 }} name="arrow-ios-forward" />
          </TouchableOpacity>
        </View>
        {savedRides?.map((ride, index) => (
          <SavedRideCard
            {...ride}
            key={`${ride.label}-${index}`}
            onPress={() => {
              onSelectSavedRide(index)
            }}
          />
        ))}
      </View>
    </>
  )
}
