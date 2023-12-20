import { StyleSheet, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { Icon, Text, Avatar } from '@ui-kitten/components'

import { displayProximity, displayTime } from '~/utils/format'

interface RideStatusProps {
  rating: number | undefined
  numAvailableSeat: number
  proximity: number
}

interface RideTimeProps {
  pickUpTime: string
  dropOffTime: string
}

export interface HeaderProps extends RideStatusProps, RideTimeProps {
  fare: number
  userId: string
  avatar: string
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A'
  }
})

function RideStatus({ rating, numAvailableSeat, proximity }: RideStatusProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start'
      }}
    >
      {rating && (
        <>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ justifyContent: 'center', paddingRight: 4 }}>
              <Icon name="star" style={{ width: 16, height: 16 }} fill={'#F0C414'} />
            </View>
            <Text style={styles.lightText}>{rating}</Text>
          </View>

          <View style={{ paddingLeft: 10, paddingRight: 10 }}>
            <Text style={styles.lightText}>|</Text>
          </View>
        </>
      )}

      <Text style={styles.lightText}>{numAvailableSeat} 個空位</Text>

      <View style={{ paddingLeft: 10, paddingRight: 10 }}>
        <Text style={styles.lightText}>|</Text>
      </View>

      <Text style={{ color: '#F0C414' }}>{displayProximity(proximity)}</Text>
    </View>
  )
}

function RideTime({ pickUpTime, dropOffTime }: RideTimeProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{displayTime(pickUpTime, false)}</Text>
      <Icon name="arrow-forward-outline" style={{ width: 42, height: 30 }} />
      <Text style={{ fontSize: 24 }}>{displayTime(dropOffTime, false)}</Text>
    </View>
  )
}

export function Header(props: HeaderProps) {
  const navigation = useNavigation()
  const handleViewProfile = () => {
    navigation.navigate('UserProfileScreen', { role: 'driver', userId: props.userId })
  }

  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={handleViewProfile}>
        <View
          onStartShouldSetResponder={event => true}
          onTouchEnd={e => {
            e.stopPropagation()
          }}
          style={{ padding: 10 }}
        >
          <Avatar 
            source={{ uri: `data:image/png;base64,${props.avatar}`}} 
            style={{ height: 56, width: 56 }}
          />
        </View>
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          justifyContent: 'space-around',
          paddingVertical: 8
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <RideTime {...props} />
          <View>
            <Text style={{ fontSize: 22 }}>NT${props.fare}</Text>
          </View>
        </View>
        <RideStatus {...props} />
      </View>
    </View>
  )
}
