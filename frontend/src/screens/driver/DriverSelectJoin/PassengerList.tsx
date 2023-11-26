import { Pressable, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { Button, Icon, Text, useTheme } from '@ui-kitten/components'
import { Image } from 'expo-image'
import * as Linking from 'expo-linking'

import { PassengerInfoCard } from './PassengerInfoCard'

interface PassengerAvatarListProps {
  data: any[]
  title: string
  onDeselect: (index: number) => void
  onConfirm: () => void
}

interface PassengerCardListProps {
  data: any[]
  title: string
  onReject: (index: number) => void
  onSelect: (index: number) => void
}

export const PassengerAvatarList = ({
  data,
  title,
  onDeselect,
  onConfirm
}: PassengerAvatarListProps) => {
  const theme = useTheme()
  const renderItem = ({ item, index }) => (
    <View style={{ alignItems: 'center', gap: 5 }}>
      <View>
        <Pressable
          onPress={() => {
            onDeselect(index)
          }}
          style={{ zIndex: 1, top: 12, right: 5 }}
        >
          {({ pressed }) => (
            <Icon
              style={{ width: 20, height: 20 }}
              name="close-circle"
              fill={pressed ? theme['color-primary-600'] : theme['color-primary-default']}
            />
          )}
        </Pressable>
        <Image
          style={{ height: 50, width: 50, borderRadius: 25 }}
          source={require('~/assets/riceball.jpg')}
          // source={{ uri: image }}
        />
      </View>
      <Text style={{ fontSize: 13 }}>{item.passengerProfile.name}</Text>
    </View>
  )
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

  const handleChat = () => {
    throw new Error('Not implemented')
  }
  const handleCall = async (phone: string) => {
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
        renderItem={({ item, index }) => {
          return (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <PassengerInfoCard
                {...item}
                onViewProfile={() => {
                  handleViewProfile(item.passengerProfile)
                }}
                onChat={() => {
                  handleChat(item.passengerProfile.userId)
                }}
                onCall={() => {
                  handleCall(item.passengerProfile.phone)
                }}
                onReject={() => {
                  onReject(index)
                }}
                onSelect={() => {
                  onSelect(index)
                }}
              />
            </Animated.View>
          )
        }}
      />
    </>
  )
}
