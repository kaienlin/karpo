import { StyleSheet, View } from 'react-native'
import { Avatar, Button, Divider, Icon, Text, type IconProps } from '@ui-kitten/components'
import { Shadow } from 'react-native-shadow-2'

import { displayDatetime } from '../utils/format'

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />

interface PassengerProfile {
  userId: string
  avatar: string
  rating: number
  phone: string
}

interface PassengerInfoCardHeaderProps {
  data: Pick<PassengerProfile, 'avatar' | 'rating'> &
    Omit<JoinInfo, 'joinId' | 'origin' | 'destination'>
  onViewProfile: () => void
}

interface PassengerInfoCardBodyProps {
  data: Pick<JoinInfo, 'origin' | 'destination'>
  onChat: () => void
  onCall: () => void
}

interface PassengerInfoCardFooterProps {
  onReject: () => void
  onSelect: () => void
}

interface PassengerInfoCardProps {
  joinInfo: JoinInfo
  passengerProfile: PassengerProfile
  onViewProfile: () => void
  onChat: () => void
  onCall: () => void
  onReject: () => void
  onSelect: () => void
}

function PassengerInfoCardHeader({
  data: { avatar, time, proximity, fare, rating, numPassenger },
  onViewProfile
}: PassengerInfoCardHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10 }}>
      <View style={{ padding: 10 }} onPress={onViewProfile}>
        <Avatar source={require('../../assets/riceball.jpg')} size="giant" />
      </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '500' }}>{displayDatetime(time, true)}</Text>
            <Text style={{ fontSize: 12, color: '#F0C414' }}>{proximity}</Text>
          </View>
          <Text style={{ fontSize: 18 }}>NT${fare}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name="star" style={{ width: 16, height: 16 }} fill={'#F0C414'} />
              <Text style={styles.lightText}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.lightText}>|</Text>
            <Text style={styles.lightText}>{numPassenger} 人</Text>
            <Text style={styles.lightText}>|</Text>
            <Text style={styles.lightText}>願拼車</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

function PassengerInfoCardBody({
  data: { origin, destination },
  onChat,
  onCall
}: PassengerInfoCardBodyProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20
      }}
    >
      <View style={{ gap: -3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
          <Icon name="radio-button-on" style={{ width: 24, height: 24 }} fill={'#F0C414'} />
          <View style={{ marginHorizontal: 10 }}>
            <Text style={styles.lightText}>{origin}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
          <Icon name="pin" style={{ width: 24, height: 24 }} />
          <View style={{ marginHorizontal: 10 }}>
            <Text style={styles.lightText}>{destination}</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
        <Button
          accessoryLeft={ChatIcon}
          style={{ borderRadius: 100, width: 40, height: 40 }}
          status="basic"
          onPress={onChat}
        />
        <Button
          accessoryLeft={PhoneIcon}
          style={{ borderRadius: 100, width: 40, height: 40 }}
          status="basic"
          onPress={onCall}
        />
      </View>
    </View>
  )
}

function PassengerInfoCardFooter({ onReject, onSelect }: PassengerInfoCardFooterProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 15
      }}
    >
      <Button onPress={onReject} status="basic" style={{ flex: 1, borderRadius: 100 }}>
        拒絕
      </Button>
      <Button onPress={onSelect} style={{ flex: 1, borderRadius: 100 }}>
        選取
      </Button>
    </View>
  )
}

export function PassengerInfoCard({
  joinInfo: { time, origin, destination, numPassenger, proximity, fare },
  passengerProfile: { userId, avatar, rating, phone },
  onViewProfile,
  onChat,
  onCall,
  onReject,
  onSelect
}: PassengerInfoCardProps) {
  return (
    <Shadow
      stretch={true}
      startColor="#00000010"
      containerStyle={{
        marginHorizontal: 10
      }}
    >
      <View
        style={{
          borderRadius: 10
        }}
      >
        <PassengerInfoCardHeader
          data={{
            avatar,
            time,
            rating,
            proximity,
            fare,
            numPassenger
          }}
          onViewProfile={onViewProfile}
        />
        <Divider />
        <PassengerInfoCardBody data={{ origin, destination }} onChat={onChat} onCall={onCall} />
        <Divider />
        <PassengerInfoCardFooter onReject={onReject} onSelect={onSelect} />
      </View>
    </Shadow>
  )
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A',
    fontSize: 13
  }
})
