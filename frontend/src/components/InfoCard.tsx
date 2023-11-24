<<<<<<< HEAD
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  GestureResponderEvent 
} from 'react-native'
=======
import { View, StyleSheet } from 'react-native'
>>>>>>> feature/frontend-driver
import { 
  Button, 
  Card,
  Text, 
  Icon, 
  IconProps, 
  PopoverPlacements
} from '@ui-kitten/components'
import { Header, HeaderProps } from './CardHeader'

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />

interface FooterProps {
  origin2route: number
  destination2route: number
}

interface CardProps extends HeaderProps, FooterProps {
  driverOrigin: string
  driverDestination: string
<<<<<<< HEAD
  onPress: (event: GestureResponderEvent) => void
=======
>>>>>>> feature/frontend-driver
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A'
  },
});

function Footer ({
  origin2route,
  destination2route
}: FooterProps) {
  return (
    <View style={{ margin: 10 }}>
      <Text style={styles.lightText}>起點 / 終點與路線最短距離： {origin2route} km / {destination2route} km</Text>
    </View>
  )
}

export default function InfoCard ({
  departTime,
  arrivalTime,
  price,
  rating,
  vacuumSeat,
  rideStatus,
  driverOrigin,
  driverDestination,
  origin2route,
  destination2route,
<<<<<<< HEAD
  onPress
}: CardProps) {
  return (
    <Card
      onPress={onPress}
=======
}: CardProps) {
  return (
    <Card
>>>>>>> feature/frontend-driver
      header={(props) => 
        <Header
          {...props}
          rating={rating}
          vacuumSeat={vacuumSeat}
          rideStatus={rideStatus}
          departTime={departTime}
          arrivalTime={arrivalTime}
          price={price}
        />
      }
      footer={(props) =>
        <Footer 
          {...props}
          origin2route={origin2route}
          destination2route={destination2route}
        />
      }
      style={{ 
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 10, 
        elevation: 5,
        borderRadius: 10,
      }}
    >
      <View style={{
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginHorizontal: -16
      }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Icon 
              name='radio-button-on' 
              style={{ width: 24, height: 24 }}
              fill={'#F0C414'}
            />
            <View style={{ marginHorizontal: 10 }}>
              <Text style={styles.lightText}>{driverOrigin}</Text>
            </View>  
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Icon 
              name='pin-outline' 
              style={{ width: 24, height: 24 }}
            />
            <View style={{ marginHorizontal: 10 }}>
              <Text style={styles.lightText}>{driverDestination}</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
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
    </Card>
  )
}