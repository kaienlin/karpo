import { GestureResponderEvent, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Button, Card, Icon, IconProps, PopoverPlacements, Text } from '@ui-kitten/components'

import { Header, HeaderProps } from './CardHeader'
import { Match } from '~/types/data'
import { useGetUserProfileQuery } from '~/redux/users'

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />
const TrashIcon = (props: IconProps) => <Icon {...props} name="trash-2" />

interface FooterProps {
  pickUpDistance: number
  dropOffDistance: number
}

export interface CardProps extends Match {
  onPress: (event: GestureResponderEvent) => void
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A'
  }
})

function Footer({ pickUpDistance, dropOffDistance }: FooterProps) {
  return (
    <View style={{ margin: 10 }}>
      <Text style={styles.lightText}>
        起點 / 終點與路線最短距離： {pickUpDistance} km / {dropOffDistance} km
      </Text>
    </View>
  )
}

export function InfoCard(cardProps: CardProps) {

  return (
    <Card
      onPress={cardProps.onPress}
      header={(props) => (
        <Header
          {...props}
          rating={cardProps.driverInfo.rating}
          numAvailableSeat={cardProps.numAvailableSeat}
          proximity={cardProps.proximity}
          pickUpTime={cardProps.pickUpTime.toString()}
          dropOffTime={cardProps.dropOffTime.toString()}
          fare={cardProps.fare}
        />
      )}
      footer={(props) => (
        <Footer 
          {...props} 
          pickUpDistance={cardProps.pickUpDistance} 
          dropOffDistance={cardProps.dropOffDistance} 
        />
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
              <Text style={styles.lightText}>
                {cardProps.driverOrigin.description}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Icon name="pin-outline" style={{ width: 24, height: 24 }} />
            <View style={{ marginHorizontal: 10 }}>
              <Text style={styles.lightText}>
                {cardProps.driverDestination.description}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          {cardProps.status === 'pending' && (
            <Button
              accessoryLeft={TrashIcon}
              style={{ borderRadius: 100, width: 40, height: 40 }}
              status="danger"
              // onPress={handleDelete}
            />
          )}
          <Button
            accessoryLeft={ChatIcon}
            style={{ borderRadius: 100, width: 40, height: 40 }}
            status="basic"
          />
          {cardProps.status === 'unasked' && (
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
