import { useRef } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import {
  Avatar,
  Button,
  Divider,
  Icon,
  StyleService,
  Text,
  useStyleSheet,
  useTheme,
  type IconProps
} from '@ui-kitten/components'
import MapView from 'react-native-maps'

import SwipeButton from '../../components/SwipeButton'
import { type DriverDepartScreenProps } from '../../types/screens'

const fakePassengers = [
  {
    avatar: require('../../../assets/icon.png'),
    name: 'Topi',
    rating: 5.0,
    numPassenger: 1
  },
  {
    avatar: require('../../../assets/icon.png'),
    name: 'Chako',
    rating: 4.7,
    numPassenger: 1
  },
  {
    avatar: require('../../../assets/icon.png'),
    name: 'Mayo',
    rating: 4.8,
    numPassenger: 2
  }
]

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />

interface PassengerItemProps {
  avatar?: string
  name: string
  rating: number
  numPassenger: number
  onChat?: () => void
  onCall?: () => void
}

function PassengerItem({ avatar, name, rating, numPassenger, onChat, onCall }: PassengerItemProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <Avatar source={avatar} />
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <View>
          <Text style={{ paddingVertical: 2 }}>{name}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Icon style={{ width: 15, height: 15 }} name="star" fill={'#F0C414'} />
              <Text category="c1">{rating?.toFixed(1)}</Text>
            </View>
            <Text category="c1">|</Text>
            <Text category="c1">{`${numPassenger}人`}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            accessoryLeft={ChatIcon}
            style={{ borderRadius: 100, width: 40, height: 40 }}
            status="basic"
          />
          <Button
            accessoryLeft={PhoneIcon}
            style={{ borderRadius: 100, width: 40, height: 40 }}
            status="basic"
          />
        </View>
      </View>
    </View>
  )
}

export default function RideDepartScreen({ navigation }: DriverDepartScreenProps) {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const mapRef = useRef<MapView>(null)

  const handleDepartSwipe = () => {}
  const handlePressChat = () => {}
  const handlePressPhoneCall = () => {}

  return (
    <View style={{ flex: 1 }}>
      <View style={{ position: 'absolute', top: '6%', left: '5%', zIndex: 1 }}>
        <TouchableOpacity onPress={navigation?.goBack}>
          <Icon style={{ width: 30, height: 30 }} name="arrow-back" />
        </TouchableOpacity>
      </View>
      <MapView
        ref={mapRef}
        style={{ flex: 1, width: '100%', height: '100%' }}
        provider="google"
        showsUserLocation={true}
      ></MapView>

      <View
        style={{
          position: 'absolute',
          bottom: '2%',
          width: '100%'
        }}
      >
        <View style={styles.rideInfoAddOnBar}>
          <Text>剩餘3座，可與更多乘客共乘</Text>
          <Button status="basic" size="small" style={{ borderRadius: 100 }}>
            繼續接單
          </Button>
        </View>
        <View style={styles.rideInfoContainer}>
          <View style={styles.rideInfoHeader}>
            <Text category="h5">行程預約成功</Text>
            <TouchableOpacity>
              <Text style={{ color: theme['color-primary-default'] }}>行程詳情</Text>
            </TouchableOpacity>
          </View>
          <Divider />
          <View style={styles.rideInfoBody}>
            <View style={styles.rideInfoBodyItem}>
              <Icon style={styles.rideInfoBodyItemIcon} name="clock" />
              <Text>今天 12:10</Text>
            </View>
            <View style={styles.rideInfoBodyItem}>
              <Icon
                style={styles.rideInfoBodyItemIcon}
                name="radio-button-on"
                fill={theme['color-primary-default']}
              />
              <Text>台積電12廠</Text>
            </View>
            <View style={styles.rideInfoBodyItem}>
              <Icon style={styles.rideInfoBodyItemIcon} name="pin" />
              <Text>國立竹北高級中學</Text>
            </View>
          </View>
          <Divider />
          <FlatList
            data={fakePassengers}
            renderItem={({ item }) => <PassengerItem {...item} />}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            style={{ paddingVertical: 15, paddingHorizontal: 25 }}
          />
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <SwipeButton text="出發接乘客" />
          </View>
        </View>
      </View>
    </View>
  )
}

const themedStyles = StyleService.create({
  rideInfoContainer: {
    marginHorizontal: 5,
    paddingBottom: 25,
    backgroundColor: 'white',
    borderRadius: 20
  },
  rideInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  rideInfoBody: {
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 25
  },
  rideInfoBodyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rideInfoBodyItemIcon: {
    width: 15,
    height: 15
  },
  rideInfoAddOnBar: {
    backgroundColor: 'color-primary-default',
    height: 100,
    marginHorizontal: 5,
    marginBottom: -35,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
})
