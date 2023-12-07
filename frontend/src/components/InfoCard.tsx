import { GestureResponderEvent, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { Button, Card, Icon, IconProps, PopoverPlacements, Text } from '@ui-kitten/components'

import { changeStatus } from '~/redux/ride'

import { Header, HeaderProps } from './CardHeader'

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />
const TrashIcon = (props: IconProps) => <Icon {...props} name="trash-2" />

interface FooterProps {
  origin2route: number
  destination2route: number
}

export interface RideItem extends HeaderProps, FooterProps {
  id: string
  responseStatus: string
  driverOrigin: string
  driverDestination: string
}

export interface CardProps extends RideItem {
  onPress: (event: GestureResponderEvent) => void
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A'
  }
})

function Footer({ origin2route, destination2route }: FooterProps) {
  return (
    <View style={{ margin: 10 }}>
      <Text style={styles.lightText}>
        起點 / 終點與路線最短距離： {origin2route} km / {destination2route} km
      </Text>
    </View>
  )
}

export function InfoCard({
  id,
  departTime,
  arrivalTime,
  responseStatus,
  price,
  rating,
  vacuumSeat,
  rideStatus,
  driverOrigin,
  driverDestination,
  origin2route,
  destination2route,
  onPress
}: CardProps) {
  const dispatch = useDispatch()
  const handleDelete = () => {
    dispatch(changeStatus({ id: id }))
  }

  return (
    <Card
      onPress={onPress}
      header={(props) => (
        <Header
          {...props}
          rating={rating}
          vacuumSeat={vacuumSeat}
          rideStatus={rideStatus}
          departTime={departTime}
          arrivalTime={arrivalTime}
          price={price}
        />
      )}
      footer={(props) => (
        <Footer {...props} origin2route={origin2route} destination2route={destination2route} />
      )}
      style={{
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 10,
        elevation: 5,
        borderRadius: 10
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginHorizontal: -16
        }}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Icon name="radio-button-on" style={{ width: 24, height: 24 }} fill={'#F0C414'} />
            <View style={{ marginHorizontal: 10 }}>
              <Text style={styles.lightText}>{driverOrigin}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Icon name="pin-outline" style={{ width: 24, height: 24 }} />
            <View style={{ marginHorizontal: 10 }}>
              <Text style={styles.lightText}>{driverDestination}</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          {responseStatus === 'waiting' && (
            <Button
              accessoryLeft={TrashIcon}
              style={{ borderRadius: 100, width: 40, height: 40 }}
              status="danger"
              onPress={handleDelete}
            />
          )}
          <Button
            accessoryLeft={ChatIcon}
            style={{ borderRadius: 100, width: 40, height: 40 }}
            status="basic"
          />
          {responseStatus === 'idle' && (
            <Button
              accessoryLeft={PhoneIcon}
              style={{ borderRadius: 100, width: 40, height: 40 }}
              status="basic"
            />
          )}
        </View>
      </View>
    </Card>
  )
}
