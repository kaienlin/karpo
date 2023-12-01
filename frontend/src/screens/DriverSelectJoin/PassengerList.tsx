import { Pressable, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { Button, Icon, Text, useTheme } from '@ui-kitten/components'
import { Image } from 'expo-image'
import * as Linking from 'expo-linking'

import type { JoinDetailed } from '~/types/data'

import { PassengerInfoCard } from './PassengerInfoCard'

interface PassengerAvatarListProps {
  data: JoinDetailed[]
  title: string
  onDeselect: (index: number) => () => void
  onConfirm: () => void
}

interface PassengerCardListProps {
  data: JoinDetailed[]
  title: string
  onReject: (index: number) => () => void
  onSelect: (index: number) => () => void
}

export const PassengerAvatarList = ({
  data,
  title,
  onDeselect,
  onConfirm
}: PassengerAvatarListProps) => {
  const theme = useTheme()
  const renderItem = ({ item, index }: { item: JoinDetailed; index: number }) => {
    const { avatar, name } = item.passengerInfo
    return (
      <View style={{ alignItems: 'center', gap: 5 }}>
        <View>
          <Pressable onPress={onDeselect(index)} style={{ zIndex: 1, top: 12, right: 5 }}>
            {({ pressed }) => (
              <Icon
                style={{ width: 20, height: 20 }}
                name="close-circle"
                fill={pressed ? theme['color-primary-600'] : theme['color-primary-default']}
              />
            )}
          </Pressable>
          <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={{ uri: avatar }} />
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
          確認同行
        </Button>
      </View>
    </View>
  )
}

export const PassengerCardList = ({ data, title, onReject, onSelect }: PassengerCardListProps) => {
  const theme = useTheme()
  const renderItem = ({ item, index }: { item: JoinDetailed; index: number }) => {
    const { passengerInfo, ...join } = item
    return (
      <Animated.View>
        <PassengerInfoCard
          data={item}
          onViewProfile={handleViewProfile(passengerInfo.id)}
          onChat={handleChat(passengerInfo.id)}
          onCall={handleCall(passengerInfo.phoneNumber)}
          onReject={onReject(index)}
          onSelect={onSelect(index)}
        />
      </Animated.View>
    )
  }

  const handleViewProfile = (userId: string) => () => {
    throw new Error('Not implemented')
  }

  const handleChat = (userId: string) => () => {
    throw new Error('Not implemented')
  }

  const handleCall = (phone: string) => async () => {
    try {
      await Linking.openURL(`tel:${phone}`)
    } catch (error) {}
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
