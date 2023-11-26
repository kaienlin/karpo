import { useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import {
  Button,
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
  type IconProps
} from '@ui-kitten/components'
import { Image } from 'expo-image'
import * as Linking from 'expo-linking'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Shadow } from 'react-native-shadow-2'

import { PassengerInfoCard } from '~/components/PassengerInfoCard'
import { type JoinInfo } from '~/types/data'
import { type DriverSelectJoinScreenProps } from '~/types/screens'

const rideInfoList = [
  {
    status: 'pending',
    joinInfo: {
      time: new Date(),
      fare: 300,
      numPassenger: 1,
      origin: '台積電 12 廠',
      destination: '竹北市光明六路 16 號',
      proximity: '很順路'
    },
    passengerProfile: {
      name: 'Topi',
      rating: 5.0,
      phone: '0912345678'
    }
  },
  {
    status: 'pending',
    joinInfo: {
      time: new Date(),
      fare: 280,
      numPassenger: 1,
      origin: '園區二路 57 號',
      destination: '竹北市光明六路 116 號',
      proximity: '非常順路'
    },
    passengerProfile: {
      name: 'Chako',
      rating: 4.8,
      phone: '0912345678'
    }
  }
  //   {
  //     time: new Date(),
  //     price: 320,
  //     rating: 4.5,
  //     numPassenger: 1,
  //     rideStatus: '有點繞路',
  //     origin: '實驗中學',
  //     destination: '博愛國小'
  //   },
  //   {
  //     time: new Date(),
  //     price: 320,
  //     rating: 4.5,
  //     numPassenger: 1,
  //     rideStatus: '有點繞路',
  //     origin: '實驗中學',
  //     destination: '博愛國小'
  //   }
]

const query = {
  origin: '台積電 12 廠',
  destination: '十興國小',
  date: '2023/11/21'
}

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

export default function SelectJoinScreen({ navigation }: DriverSelectJoinScreenProps) {
  const theme = useTheme()

  const [joins, setJoins] = useState<JoinInfo[]>(rideInfoList)
  const [selectedJoins, setSelectedJoins] = useState<JoinInfo[]>([])

  // TODO: implement
  const handleAccept = () => {
    // send accept request to server
    // navigate to RideDepartScreen
    navigation.navigate('DriverDepartScreen')
  }

  // TODO: implement
  const handleViewProfile = () => {
    throw new Error('Not implemented')
  }

  // TODO: implement
  const handleChat = () => {
    throw new Error('Not implemented')
  }

  const handleCall = async (phone: string) => {
    try {
      await Linking.openURL(`tel:${phone}`)
    } catch (error) {}
  }

  const handleReject = (index: number) => {
    setJoins((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
  }

  const handleSelect = (index: number) => {
    setSelectedJoins((prev) => [...prev, { ...joins[index], status: 'pending' }])
    setJoins((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
  }

  const handleDeselect = (item, index: number) => {
    setSelectedJoins((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
    setJoins((prev) => [...prev, { ...item, status: 'available' }])
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Shadow
        stretch={true}
        startColor="#00000010"
        sides={{ start: false, end: false, top: false, bottom: true }}
      >
        <TopNavigation
          alignment="center"
          title="發布成功，等待乘客邀請．．．"
          accessoryLeft={() => (
            <TopNavigationAction
              icon={BackIcon}
              onPress={() => {
                // TODO: confirm cancel ride
                navigation.goBack()
              }}
            />
          )}
        />
        {selectedJoins.length > 0 && (
          <View
            style={{
              height: 100,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              bottom: 12
            }}
          >
            <FlatList
              data={selectedJoins}
              horizontal={true}
              style={{ paddingLeft: 10 }}
              ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              renderItem={({ item, index }) => (
                <View style={{ alignItems: 'center', gap: 5 }}>
                  <View>
                    <Pressable
                      onPress={() => {
                        handleDeselect(item, index)
                      }}
                      style={{ zIndex: 1, top: 12, right: 5 }}
                    >
                      {({ pressed }) => (
                        <Icon
                          style={{ width: 20, height: 20 }}
                          name="close-circle"
                          fill={
                            pressed ? theme['color-primary-600'] : theme['color-primary-default']
                          }
                        />
                      )}
                    </Pressable>
                    <Image
                      style={{ height: 50, width: 50, borderRadius: 25 }}
                      source={require('../../../assets/riceball.jpg')}
                    />
                  </View>
                  <Text style={{ fontSize: 13 }}>{item.passengerProfile.name}</Text>
                </View>
              )}
            />
            <Button onPress={handleAccept} size="small" style={{ borderRadius: 100 }}>
              確認同行
            </Button>
          </View>
        )}
      </Shadow>

      <FlatList
        style={{ flex: 1 }}
        data={joins}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        ListHeaderComponent={() => <View style={{ height: 15 }} />}
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
                  handleReject(index)
                }}
                onSelect={() => {
                  handleSelect(index)
                }}
              />
            </Animated.View>
          )
        }}
      />
    </SafeAreaView>
  )
}
