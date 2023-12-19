import { FlatList, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Shadow } from 'react-native-shadow-2'
import {
  Button,
  Divider,
  Icon,
  StyleService,
  Text,
  useStyleSheet,
  useTheme
} from '@ui-kitten/components'

import { Avatar } from '~/components/Avatar'
import { ContactItems, RatingItem } from '~/components/card/CardComponents'
import SwipeButton from '~/components/SwipeButton'
import { useContact } from '~/hooks/useContact'
import type { User } from '~/types/data'
import { displayDatetime } from '~/utils/format'

interface PassengerItemProps extends User {
  numPassengers: number
  onViewProfile?: () => void
  onChat?: () => void
  onCall?: () => void
}

interface AddonBarProps {
  text: string
  buttonText: string
  buttonDisabled: boolean
  buttonOnPress: () => void
}

interface ReadyCardProps {
  time: Date
  origin: string | undefined
  destination: string | undefined
  passengers: Array<User & { numPassengers: number }>
  isLoading: boolean
  onViewDetail?: () => void
  onDepart: () => void
}

interface StageCardProps {
  location: string
  status: 'pick_up' | 'drop_off'
  passenger: Array<User & { numPassengers: number }>
  isLoading: boolean
  onComplete: () => void
}

const PassengerItem = ({
  avatar,
  name,
  rating,
  numPassengers,
  onViewProfile = () => {},
  onChat = () => {},
  onCall = () => {}
}: PassengerItemProps) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <TouchableOpacity onPress={onViewProfile} activeOpacity={0.8}>
        <Avatar base64Uri={avatar} size="small" />
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
            <RatingItem rating={rating?.toFixed(1) ?? '5.0'} />
            <Text category="c1">|</Text>
            <Text category="c1">{`${numPassengers} 人`}</Text>
          </View>
        </View>
        <ContactItems onChat={onChat} onCall={onCall} />
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
        appearance={buttonDisabled ? 'ghost' : 'filled'}
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
  onDepart
}: ReadyCardProps) {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const { viewProfile, chat, call } = useContact()

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
              onViewProfile={() => {
                viewProfile(item.id)
              }}
              onChat={() => {
                chat(item.joinId, item.id)
              }}
              onCall={() => {
                call(item.phoneNumber)
              }}
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

export function StageCard({ location, status, passenger, isLoading, onComplete }: StageCardProps) {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const { viewProfile, chat, call } = useContact()

  const { name } = passenger ?? {}
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
            onViewProfile={() => {
              viewProfile(passenger.id)
            }}
            onChat={() => {
              chat(passenger.joinId, passenger.id)
            }}
            onCall={() => {
              call(passenger.phoneNumber)
            }}
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
