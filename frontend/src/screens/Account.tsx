import { useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { BottomSheetModalProvider, type BottomSheetModal } from '@gorhom/bottom-sheet'
import { Avatar, Divider, Icon, List, ListItem, Text, useTheme } from '@ui-kitten/components'
import * as SecureStore from 'expo-secure-store'
import { MotiView } from 'moti'
import { Skeleton } from 'moti/skeleton'

import { ConfirmModal } from '~/components/modals/Confirm'
import { useSignOutMutation } from '~/redux/api/auth'
import { signOut } from '~/redux/auth'
import { useGetMyProfileQuery } from '~/redux/users'
import { type AccountScreenProps } from '~/types/screens'

const items = [
  { title: '個人資料', icon: 'person', route: 'ProfileScreen' },
  { title: '訊息中心', icon: 'email', route: 'MessageScreen' },
  { title: '使用說明與支援', icon: 'question-mark-circle', route: 'InfoScreen' },
  { title: '應用程式設定', icon: 'settings', route: 'SettingScreen' }
]

const ProfileCard = ({
  name,
  avatar,
  rating
}: {
  name: string
  avatar: string
  rating: number
}) => {
  const theme = useTheme()
  return (
    <View
      style={{
        paddingVertical: 30,
        paddingHorizontal: 20,
        flexDirection: 'row',
        gap: 30
      }}
    >
      <Avatar shape="rounded" style={{ width: 100, height: 100 }} source={{ uri: avatar }} />
      <View>
        <Text category="h4" style={{ marginTop: 25, marginBottom: 10 }}>
          {name}
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
              <Text category="label">評分 &#9733; {rating.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const ProfileCardSkeleton = () => {
  const colorMode = 'light'

  return (
    <MotiView>
      <View
        style={{
          paddingVertical: 30,
          paddingHorizontal: 20,
          flexDirection: 'row',
          gap: 30
        }}
      >
        <Skeleton colorMode={colorMode} width={100} height={100} />
        <View style={{ gap: 20, justifyContent: 'flex-end' }}>
          <Skeleton colorMode={colorMode} width={150} height={30} />
          <Skeleton colorMode={colorMode} width={80} height={25} />
        </View>
      </View>
    </MotiView>
  )
}

export default function AccountScreen({ navigation }: AccountScreenProps) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const signOutRef = useRef<BottomSheetModal>(null)

  const { data } = useGetMyProfileQuery()
  const [signOutMutation] = useSignOutMutation()

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
        onPress={signOutRef.current?.present}
        style={{ paddingVertical: 20 }}
      />
    </>
  )

  const handleSignOut = async () => {
    try {
      await signOutMutation(undefined)
      dispatch(signOut())
      await SecureStore.deleteItemAsync('accessToken')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        {!data ? (
          <ProfileCardSkeleton />
        ) : (
          <ProfileCard name={data.name} avatar={data.avatar} rating={data.rating} />
        )}
        <List
          data={items}
          keyExtractor={(item) => item.title}
          renderItem={renderListItem}
          ListFooterComponent={renderLogoutItem}
        />
        <ConfirmModal
          ref={signOutRef}
          snapPoints={['30%', '30%']}
          title="確定要登出嗎？"
          onPressConfirm={handleSignOut}
          confirmBtnText="確定登出"
          confirmBtnStyle="primary"
          cancelBtnText="取消"
        />
      </BottomSheetModalProvider>
    </SafeAreaView>
  )
}
