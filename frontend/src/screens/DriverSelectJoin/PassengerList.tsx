import { Pressable, TouchableOpacity, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { Button, Icon, Text, useTheme } from '@ui-kitten/components'
import { Image } from 'expo-image'
import * as Linking from 'expo-linking'

import { Avatar } from '~/components/Avatar'
import type { JoinDetailed } from '~/types/data'

import { PassengerInfoCard } from './PassengerInfoCard'

interface PassengerAvatarListProps {
  data: JoinDetailed[]
  title: string
  onDeselect: (id: string) => () => void
  onConfirm: () => void
}

interface PassengerCardListProps {
  data: JoinDetailed[]
  title: string
  onReject: (id: string) => () => void
  onSelect: (id: string) => () => void
}

export const PassengerAvatarList = ({
  data,
  title,
  onDeselect,
  onConfirm
}: PassengerAvatarListProps) => {
  const theme = useTheme()
  const navigation = useNavigation()

  const handleViewProfile = (userId: string) => () => {
    navigation.navigate('UserProfileScreen', { role: 'passenger', userId })
  }

  const renderItem = ({ item, index }: { item: JoinDetailed; index: number }) => {
    const {
      status,
      passengerId,
      passengerInfo: { name, avatar }
    } = item
    return (
      // TODO: make it a reusable component
      <View style={{ alignItems: 'center', justifyContent: 'flex-end', gap: 5, height: 85 }}>
        <View>
          {status === 'pending' && (
            <Pressable onPress={onDeselect(item.joinId)} style={{ zIndex: 1, top: 12, right: 5 }}>
              {({ pressed }) => (
                <Icon
                  style={{ width: 20, height: 20 }}
                  name="close-circle"
                  fill={pressed ? theme['color-primary-600'] : theme['color-primary-default']}
                />
              )}
            </Pressable>
          )}
          <TouchableOpacity activeOpacity={0.8} onPress={handleViewProfile(passengerId)}>
            <Avatar base64Uri={avatar} size="small" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 13 }}>{name}</Text>
      </View>
    )
  }
  return (
    <View style={{ justifyContent: 'flex-end', marginBottom: 15 }}>
      <Text category="label" style={{ paddingHorizontal: 20 }}>
        {title}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20
        }}
      >
        <BottomSheetFlatList
          data={data}
          horizontal={true}
          style={{ paddingLeft: 10 }}
          ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
          renderItem={renderItem}
        />
        <Button onPress={onConfirm} size="small" style={{ borderRadius: 100 }}>
          <Text>確認同行</Text>
        </Button>
      </View>
    </View>
  )
}

export const PassengerCardList = ({ data, title, onReject, onSelect }: PassengerCardListProps) => {
  const theme = useTheme()
  const navigation = useNavigation()

  const handleViewProfile = (userId: string) => () => {
    navigation.navigate('UserProfileScreen', { role: 'passenger', userId })
  }

  const handleChat = (userId: string) => () => {
    // throw new Error('Not implemented')
  }

  const handleCall = (phone: string) => async () => {
    try {
      await Linking.openURL(`tel:${phone}`)
    } catch (error) {}
  }

  const renderItem = ({ item, index }: { item: JoinDetailed; index: number }) => {
    const { passengerInfo, ...join } = item
    return (
      <Animated.View>
        <PassengerInfoCard
          data={{ passengerInfo, ...join }}
          onViewProfile={handleViewProfile(join.passengerId)}
          onChat={handleChat(passengerInfo?.id)}
          onCall={handleCall(passengerInfo?.phoneNumber)}
          onReject={onReject(join.joinId)}
          onSelect={onSelect(join.joinId)}
        />
      </Animated.View>
    )
  }

  return (
    <>
      <Text
        style={{
          padding: 10,
          paddingHorizontal: 20,
          backgroundColor: theme['color-basic-100']
        }}
        category="label"
      >
        {title}
      </Text>
      <BottomSheetFlatList
        style={{ flex: 1 }}
        data={data}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        ListHeaderComponent={() => <View style={{ height: 8 }} />}
        renderItem={renderItem}
      />
    </>
  )
}
