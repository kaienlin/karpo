import { View, StyleSheet } from 'react-native'
import { 
  Text, 
  Avatar, 
  Icon, 
  IconProps 
} from '@ui-kitten/components'

interface RideStatusProps {
  rating: number
  vacuumSeat: number
  rideStatus: string
}

interface RideTimeProps {
  departTime: string
  arrivalTime: string
}

export interface HeaderProps extends RideStatusProps, RideTimeProps {
  price: number
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A'
  },
});

function RideStatus ({ 
  rating, 
  vacuumSeat, 
  rideStatus
}: RideStatusProps) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'flex-start',
    }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ justifyContent: 'center', paddingRight: 4 }}>
          <Icon name='star' style={{ width: 16, height: 16 }} fill={'#F0C414'} />
        </View>
        <Text style={ styles.lightText }>{rating}</Text>
      </View>
      
      <View style={{ paddingLeft: 10, paddingRight: 10 }}>
        <Text style={ styles.lightText }>|</Text>
      </View>
      
      <Text style={ styles.lightText }>{ vacuumSeat } 個空位</Text>
      
      <View style={{ paddingLeft: 10, paddingRight: 10 }}>
        <Text style={ styles.lightText }>|</Text>
      </View>

      <Text style={{ color: '#F0C414' }}>{ rideStatus }</Text>
    </View>
  )
}

function RideTime ({
  departTime,
  arrivalTime
}: RideTimeProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{ departTime }</Text>
      <Icon 
        name='arrow-forward-outline' 
        style={{ width: 42, height: 30 }}
      />
      <Text style={{ fontSize: 24 }}>{ arrivalTime }</Text>
    </View>
  )
}

export function Header (props: HeaderProps) {
  return (
    <View style={{ flexDirection: 'row' }}>      
      <View style={{ padding: 10 }}>
        <Avatar
          source={require('../../assets/riceball.jpg')}
          size='giant'
        />
      </View>

      <View style={{ 
        flex: 1, 
        justifyContent: 'space-around', 
        paddingVertical: 8, 
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <RideTime {...props} />
          <View>
            <Text style={{ fontSize: 22 }}>NT${ props.price }</Text>
          </View>
        </View>
        <RideStatus {...props} />
      </View>      
    </View>
  )
}