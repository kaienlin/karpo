import { FlatList, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Shadow } from 'react-native-shadow-2'
import { useNavigation } from '@react-navigation/native'
import {
  Button,
  Divider,
  Icon,
  StyleService,
  Text,
  useStyleSheet,
  useTheme,
  type IconProps
} from '@ui-kitten/components'
import { Image } from 'expo-image'

import SwipeButton from '~/components/SwipeButton'
import type { User } from '~/types/data'
import { displayDatetime } from '~/utils/format'

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />

interface PassengerItemProps extends User {
  numPassengers: number
  onViewProfile?: (userId: string) => void
  onChat?: (userId: string) => void
  onCall?: (phoneNumber: string) => void
}

interface AddonBarProps {
  text: string
  buttonText: string
  buttonDisabled: boolean
  buttonOnPress: () => void
}

interface PassengerContactAction {
  handleChat?: (userId: string) => void
  handleCall?: (phoneNumber: string) => void
}

interface ReadyCardProps extends PassengerContactAction {
  time: Date
  origin: string | undefined
  destination: string | undefined
  passengers: Array<User & { numPassengers: number }>
  isLoading: boolean
  onViewDetail?: () => void
  onDepart: () => void
}

interface StageCardProps extends PassengerContactAction {
  location: string
  status: 'pick_up' | 'dropoff'
  passenger: Array<User & { numPassengers: number }>
  isLoading: boolean
  onComplete: () => void
}

const PassengerItem = ({
  id,
  avatar,
  name,
  rating,
  phoneNumber,
  numPassengers,
  onViewProfile = () => () => {},
  onChat = () => () => {},
  onCall = () => () => {}
}: PassengerItemProps) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <TouchableOpacity onPress={onViewProfile(id)} activeOpacity={0.8}>
        <Image source={{ uri: avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
      </TouchableOpacity>
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
            <Text category="c1">{`${numPassengers}人`}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            onPress={() => {
              onChat(id)
            }}
            accessoryLeft={ChatIcon}
            style={{ borderRadius: 100, width: 40, height: 40 }}
            status="basic"
          />
          <Button
            onPress={() => {
              onCall(phoneNumber)
            }}
            accessoryLeft={PhoneIcon}
            style={{ borderRadius: 100, width: 40, height: 40 }}
            status="basic"
          />
        </View>
      </View>
    </View>
  )
}

export function AddonBar({ text, buttonText, buttonDisabled, buttonOnPress }: AddonBarProps) {
  const styles = useStyleSheet(themedStyles)
  return (
    <View style={styles.rideInfoAddOnBar}>
      <Text>{text}</Text>
      <Button
        onPress={buttonOnPress}
        disabled={buttonDisabled}
        status="basic"
        size="small"
        style={{ borderRadius: 100 }}
      >
        {buttonText}
      </Button>
    </View>
  )
}

export function ReadyCard({
  time,
  origin,
  destination,
  passengers,
  isLoading,
  onViewDetail,
  onDepart,
  handleChat = () => {},
  handleCall = () => {}
}: ReadyCardProps) {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const navigation = useNavigation()
  const handleViewProfile = (userId: string) => () => {
    navigation.navigate('UserProfileScreen', { role: 'passenger', userId })
  }

  return (
    <Shadow {...shadowPresets.modal}>
      <View style={styles.rideInfoContainer}>
        <View style={styles.rideInfoHeader}>
          <Text category="h5">行程預約成功</Text>
          <TouchableOpacity onPress={onViewDetail}>
            <Text style={{ color: theme['color-primary-default'] }}>行程詳情</Text>
          </TouchableOpacity>
        </View>
        <Divider />
        <View style={styles.rideInfoBody}>
          <View style={styles.rideInfoBodyItem}>
            <Icon style={styles.rideInfoBodyItemIcon} name="clock" />
            <Text>{displayDatetime(time)}</Text>
          </View>
          <View style={styles.rideInfoBodyItem}>
            <Icon
              style={styles.rideInfoBodyItemIcon}
              name="radio-button-on"
              fill={theme['color-primary-default']}
            />
            <Text>{origin}</Text>
          </View>
          <View style={styles.rideInfoBodyItem}>
            <Icon style={styles.rideInfoBodyItemIcon} name="pin" />
            <Text>{destination}</Text>
          </View>
        </View>
        <Divider />
        <FlatList
          data={passengers}
          renderItem={({ item }) => (
            <PassengerItem
              {...item}
              onViewProfile={handleViewProfile}
              onChat={handleChat}
              onCall={handleCall}
            />
          )}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          style={{ paddingVertical: 15, paddingHorizontal: 25 }}
        />
        <View style={styles.swipeButtonContainer}>
          {!isLoading && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <SwipeButton text="出發接乘客" onSwipe={onDepart} />
            </Animated.View>
          )}
        </View>
      </View>
    </Shadow>
  )
}

export function StageCard({
  location,
  status,
  passenger,
  isLoading,
  onComplete,
  handleChat = () => {},
  handleCall = () => {}
}: StageCardProps) {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const navigation = useNavigation()
  const handleViewProfile = (userId: string) => () => {
    navigation.navigate('UserProfileScreen', { role: 'passenger', userId })
  }

  const { name } = passenger

  const headerText = status === 'pick_up' ? `正在前往 ${name} 所在位置` : `接近 ${name} 目的地`
  const swipeButtonText = status === 'pick_up' ? `到達 ${name} 起點` : `已到達 ${name} 目的地`

  return (
    <Shadow {...shadowPresets.modal}>
      <View style={styles.rideInfoContainer}>
        <View style={styles.rideInfoHeader}>
          <View style={{ gap: 5 }}>
            <Text category="h5">{headerText}</Text>
            <Text style={{ fontSize: 14, color: theme['text-hint-color'] }}>{location}</Text>
          </View>
          <TouchableOpacity>
            <Text style={{ color: theme['color-primary-default'] }}>行程詳情</Text>
          </TouchableOpacity>
        </View>
        <Divider />
        <View style={{ paddingVertical: 15, paddingHorizontal: 25 }}>
          <PassengerItem
            {...passenger}
            onViewProfile={handleViewProfile}
            onChat={handleChat}
            onCall={handleCall}
          />
        </View>

        <View style={{ alignItems: 'center', paddingTop: 10, height: 70 }}>
          {!isLoading && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <SwipeButton text={swipeButtonText} onSwipe={onComplete} />
            </Animated.View>
          )}
        </View>
      </View>
    </Shadow>
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
  swipeButtonContainer: {
    alignItems: 'center',
    paddingTop: 10,
    height: 70
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

const shadowPresets = {
  modal: {
    stretch: true,
    startColor: '#00000025',
    sides: {
      start: true,
      end: true,
      top: false,
      bottom: true
    },
    corners: {
      topStart: false,
      topEnd: false,
      bottomStart: true,
      bottomEnd: true
    }
  }
}
