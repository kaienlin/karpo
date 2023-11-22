import { Image, View } from 'react-native'
import { Button } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'

import { type WelcomeScreenProps } from '../types/screens'

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-evenly' }}>
      <View style={{ alignItems: 'center' }}>
        <Image style={{ height: 106, width: 305 }} source={require('../../assets/logo.png')} />
      </View>
      <View style={{ marginHorizontal: 40 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <Button
            style={{ borderRadius: 12 }}
            size="large"
            onPress={() => {
              navigation.navigate('SignInScreen')
            }}
          >
            登入
          </Button>
          <Button
            style={{ borderRadius: 12 }}
            size="large"
            appearance="outline"
            onPress={() => {
              navigation.navigate('SignUpScreen')
            }}
          >
            註冊
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}
