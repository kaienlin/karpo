import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  type IconProps
} from '@ui-kitten/components'
import { MotiView } from 'moti'
import { Skeleton } from 'moti/skeleton'

import { Avatar } from '~/components/Avatar'
import { useGetUserProfileQuery } from '~/redux/api/users'
import type { User, UserProfile } from '~/types/data'
import type { UserProfileScreenProps } from '~/types/screens'

const driverInfo = {
  profilePhoto: '../../assets/riceball.jpg',
  name: '本丸',
  phone: '0912345678',
  email: 'xxxxx@gmail.com',
  rating: 4.2,
  languages: ['英語', '中文'],
  city: '台北市',
  carpoolTimes: 1500,
  joinedDays: 3
}

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

function UserProfileCard({ user }: { user: UserProfile}) {
  // TODO: extend User fields
  const { name, rating, avatar, createdAt, numRequests, numRides } = user
  console.log(name)

  const createdAtTimestamp = new Date(createdAt).getTime();
  const todayTimestamp = new Date().getTime();

  // Calculate the time difference in milliseconds
  const timeDifference = todayTimestamp - createdAtTimestamp;

  // Convert the time difference to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return (
    <>
      {/* name */}
      <View style={styles.profilePhotoContainer}>
        <Avatar base64Uri={avatar} size="large" />
      </View>
      <View style={{ marginHorizontal: 30, marginTop: 15 }}>
        <Text style={{ fontSize: 38, fontWeight: 'bold' }}>{name}</Text>
      </View>
      {/* basic info */}
      <View
        style={{
          marginHorizontal: 30,
          justifyContent: 'center',
          marginTop: 20,
          gap: 10
        }}
      >
        <View style={styles.iconTextContainer}>
          <Layout style={styles.iconContainer}>
            <Icon name="home-outline" fill="#000" width={20} height={20} />
          </Layout>
          <View style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.lightText}>來自: </Text>
            <Text style={{ fontWeight: 'bold' }}> 台北市 </Text>
          </View>
        </View>
        {/* <View style={styles.iconTextContainer}>
          <Layout style={styles.iconContainer}>
            <Icon name="phone-outline" fill="#000" width={20} height={20} />
          </Layout>
          <View style={{ marginHorizontal: 10 }}>
            <Text style={styles.lightText}>{phoneNumber}</Text>
          </View>
        </View> */}
        <View style={styles.iconTextContainer}>
          <Layout style={styles.iconContainer}>
            <Icon name="globe-outline" fill="#000" width={20} height={20} />
          </Layout>
          <View style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.lightText}>通曉語言: </Text>
            <Text style={{ fontWeight: 'bold' }}> 中文 和 英文 </Text>
            {/* <Text style={styles.lightText}> 中文 和 英文</Text> */}
          </View>
        </View>
        {/* <View style={styles.iconTextContainer}>
          <Layout style={styles.iconContainer}>
            <Icon name="message-circle-outline" fill="#000" width={20} height={20} />
          </Layout>
          <View style={{ marginHorizontal: 10 }}>
            <Text style={styles.lightText}>傳訊息</Text>
          </View>
        </View> */}
      </View>
      {/* carpooling info */}
      <View style={styles.carpoolInfoContainer}>
        <View style={styles.carpoolInfo}>
          <Text style={styles.yellowBoldText}>{numRequests+numRides}</Text>
          <Text style={styles.lightText}>共乘</Text>
        </View>
        <View style={styles.carpoolInfo}>
          <Text style={styles.yellowBoldText}>{rating ? rating.toFixed(1) : '5.0'}</Text>
          <Text style={styles.lightText}>評分</Text>
        </View>
        <View style={styles.carpoolInfo}>
          <Text style={styles.yellowBoldText}>{daysDifference}</Text>
          <Text style={styles.lightText}>加入天數</Text>
        </View>
      </View>
    </>
  )
}

const UserProfileSkeleton = () => {
  const colorMode = 'light'

  return (
    <MotiView>
      <View style={styles.profilePhotoContainer}>
        <Skeleton colorMode={colorMode} height={82} width={82} radius="round" />
      </View>
      <View style={{ marginHorizontal: 30, marginTop: 15 }}>
        <Skeleton colorMode={colorMode} height={50} width={130} />
      </View>
      <View style={{ marginHorizontal: 30, justifyContent: 'center', marginTop: 20, gap: 10 }}>
        {[0, 1, 2, 3].map((_, index) => (
          <View key={index} style={styles.iconTextContainer}>
            <Skeleton colorMode={colorMode} height={25} width={200} />
          </View>
        ))}
      </View>

      <View style={styles.carpoolInfoContainer}>
        {[0, 1, 2].map((_, index) => (
          <View key={index} style={styles.carpoolInfo}>
            <Skeleton colorMode={colorMode} height={100} width={100} />
          </View>
        ))}
      </View>
    </MotiView>
  )
}

export default function DriverInfo({ navigation, route }: UserProfileScreenProps) {
  const { role, userId } = route?.params
  // const role = 'driver'
  // const userId = '54321'

  const screenTitle = role === 'driver' ? '駕駛資訊' : '乘客資訊'
  const { data: user, isSuccess } = useGetUserProfileQuery(userId)
  // console.log(useGetUserProfileQuery(userId))
  // console.log(user)
  // console.log(isSuccess)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopNavigation
        alignment="center"
        title={screenTitle}
        accessoryLeft={() => <TopNavigationAction icon={BackIcon} onPress={navigation?.goBack} />}
      />

      {!isSuccess ? <UserProfileSkeleton /> : <UserProfileCard user={user} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignContent: 'center',
    marginHorizontal: 20,
    marginTop: 20
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  profilePhotoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 45
  },
  lightText: {
    color: '#5A5A5A',
    fontSize: 16
  },
  iconTextContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
    // marginTop: 2,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 25,
    backgroundColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  carpoolInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 40
  },
  carpoolInfo: {
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
    width: 100
    // marginTop: 2,
  },
  yellowBoldText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F0C414'
  }
})
