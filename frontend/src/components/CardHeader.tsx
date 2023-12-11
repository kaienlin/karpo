import { View, StyleSheet } from 'react-native'
import { 
  Text, 
  Avatar, 
  Icon, 
  IconProps 
} from '@ui-kitten/components'

interface RideStatusProps {
  rating: number | undefined
  numAvailableSeat: number
  proximity: number
}

interface RideTimeProps {
  pickUpTime: Date
  dropOffTime: Date
}

export interface HeaderProps extends RideStatusProps, RideTimeProps {
  fare: number
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A'
  },
});

function date2hhmm (time: Date) {
  return time.toTimeString().split(' ')[0].slice(0, -3)
}

function RideStatus ({ 
  rating, 
  numAvailableSeat, 
  proximity
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
      
      <Text style={ styles.lightText }>{ numAvailableSeat } 個空位</Text>
      
      <View style={{ paddingLeft: 10, paddingRight: 10 }}>
        <Text style={ styles.lightText }>|</Text>
      </View>

      <Text style={{ color: '#F0C414' }}>{ proximity }% 順路</Text>
    </View>
  )
}

function RideTime ({
  pickUpTime,
  dropOffTime
}: RideTimeProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{ date2hhmm(pickUpTime) }</Text>
      <Icon 
        name='arrow-forward-outline' 
        style={{ width: 42, height: 30 }}
      />
      <Text style={{ fontSize: 24 }}>{ date2hhmm(dropOffTime) }</Text>
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
            <Text style={{ fontSize: 22 }}>NT${ props.fare }</Text>
          </View>
        </View>
        <RideStatus {...props} />
      </View>      
    </View>
  )
}