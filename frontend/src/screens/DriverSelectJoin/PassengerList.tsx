import { Pressable, TouchableOpacity, View } from 'react-native'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { Button, Icon, Text, useTheme } from '@ui-kitten/components'

import { Avatar } from '~/components/Avatar'
import { useContact } from '~/hooks/useContact'
import type { JoinDetailed } from '~/types/data'

import { PassengerInfoCard, PassengerInfoCardSkeleton } from './PassengerInfoCard'

interface PassengerAvatarListProps {
  data: JoinDetailed[]
  title: string
  isConfirmDisabled?: boolean
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
  isConfirmDisabled = false,
  onDeselect,
  onConfirm
}: PassengerAvatarListProps) => {
  const theme = useTheme()
  const { viewProfile } = useContact()

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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              viewProfile(passengerId)
            }}
          >
            <Avatar base64Uri={avatar} size="small" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 13 }}>{name}</Text>
      </View>
    )
  }
  return (
    <View style={{ marginBottom: 15 }}>
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
        <View>
          <Button
            onPress={onConfirm}
            size="small"
            style={{ borderRadius: 100 }}
            disabled={isConfirmDisabled}
            appearance={isConfirmDisabled ? 'ghost' : 'filled'}
          >
            <Text>確認同行</Text>
          </Button>
          <View style={{ position: 'absolute', top: '50%' }}>
            {isConfirmDisabled && (
              <Text
                category="label"
                style={{ color: theme['color-danger-default'], textAlign: 'center' }}
              >
                已選擇人數超出座位限制
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export const PassengerCardList = ({ data, title, onReject, onSelect }: PassengerCardListProps) => {
  const theme = useTheme()
  const { viewProfile, chat, call } = useContact()

  const renderItem = ({ item, index }: { item: JoinDetailed; index: number }) => {
    const { passengerInfo, ...join } = item
    // TODO: should use a better condition
    return join.pickUpLocation.description === '' ? (
      <PassengerInfoCardSkeleton />
    ) : (
      <PassengerInfoCard
        data={{ passengerInfo, ...join }}
        onViewProfile={() => {
          viewProfile(join.passengerId)
        }}
        onChat={() => {
          chat(join.joinId, join.passengerId)
        }}
        onCall={() => {
          call(passengerInfo?.phoneNumber)
        }}
        onReject={onReject(join.joinId)}
        onSelect={onSelect(join.joinId)}
      />
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
