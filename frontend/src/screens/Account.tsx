import { useMemo, useRef, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  Avatar,
  Button,
  Divider,
  Icon,
  List,
  ListItem,
  Text,
  useTheme
} from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import { type AccountStackParamList } from '../navigation/AccountStack'
import { type RootState } from '../redux/store'

interface UserProfile {
  name: string
  email: string
  phone: string
  avatar: string
}

type AccountScreenProps = NativeStackScreenProps<AccountStackParamList, 'AccountScreen'>

const items = [
  { title: '個人資料', icon: 'person', route: 'ProfileScreen' },
  { title: '訊息中心', icon: 'email', route: 'MessageScreen' },
  { title: '使用說明與支援', icon: 'question-mark-circle', route: 'InfoScreen' },
  { title: '應用程式設定', icon: 'settings', route: 'SettingScreen' }
]

const LogoutModalContent = ({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void
  onCancel: () => void
}) => (
  <View
    style={{
      alignItems: 'stretch',
      paddingHorizontal: 20,
      paddingVertical: 10
    }}
  >
    <Text category="h5" style={{ alignSelf: 'center' }}>
      確定要登出嗎？
    </Text>
    <View
      style={{
        flex: 1,
        alignItems: 'stretch',
        gap: 10,
        paddingVertical: 20
      }}
    >
      <Button onPress={onConfirm} size="giant" style={{ borderRadius: 12 }}>
        確認登出
      </Button>
      <Button size="giant" status="basic" onPress={onCancel} style={{ borderRadius: 12 }}>
        取消
      </Button>
    </View>
  </View>
)

export default function AccountScreen({ navigation }: AccountScreenProps) {
  const theme = useTheme()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['25%', '30%'], [])

  const renderListItem = ({ item }: { item: { title: string; icon: string; route: string } }) => (
    <ListItem
      title={(props) => <Text style={[props?.style, { fontSize: 16 }]}>{item.title}</Text>}
      accessoryLeft={(props) => <Icon {...props} name={item.icon} />}
      onPress={() => {
        // TODO: navigation.navigate(item.route)
      }}
      style={{ paddingVertical: 20 }}
    />
  )

  const renderLogoutItem = () => (
    <>
      <Divider />
      <ListItem
        title={(props) => (
          <Text style={[props?.style, { fontSize: 16, color: theme['color-danger-600'] }]}>
            登出
          </Text>
        )}
        accessoryLeft={(props) => (
          <Icon {...props} fill={theme['color-danger-600']} name="log-out-outline" />
        )}
        onPress={() => {
          bottomSheetModalRef.current?.present()
        }}
        style={{ paddingVertical: 20 }}
      />
    </>
  )

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          paddingVertical: 30,
          paddingHorizontal: 20,
          flexDirection: 'row',
          gap: 30
        }}
      >
        <Avatar
          shape="rounded"
          style={{ width: 100, height: 100 }}
          source={require('../../assets/spoingus.jpg')}
        />
        <View>
          <Text category="h4" style={{ marginTop: 25, marginBottom: 10 }}>
            Spoingus
          </Text>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            <TouchableOpacity activeOpacity={0.7}>
              <View
                style={{
                  alignItems: 'center',
                  borderRadius: 100,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  backgroundColor: theme['color-basic-200']
                }}
              >
                <Text category="label">司機 &#9733; 5.0</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <View
                style={{
                  alignItems: 'center',
                  borderRadius: 100,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  backgroundColor: theme['color-basic-200']
                }}
              >
                <Text category="label">乘客 &#9733; 5.0</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <List
        data={items}
        keyExtractor={(item) => item.title}
        renderItem={renderListItem}
        ListFooterComponent={renderLogoutItem}
      />
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
          handleIndicatorStyle={{ display: 'none' }}
        >
          <LogoutModalContent
            onConfirm={() => {}}
            onCancel={() => {
              bottomSheetModalRef.current?.dismiss()
            }}
          />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </SafeAreaView>
  )
}
