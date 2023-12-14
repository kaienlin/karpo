import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Text } from '@ui-kitten/components'

import { type WelcomeScreenProps } from '../types/screens'

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{ flex: 3, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 }}
      >
        <Image
          style={{ height: 250, width: 375, marginVertical: 40 }}
          source={require('~/assets/welcome.png')}
        />
        <View style={{ alignItems: 'center', gap: 20 }}>
          <Text style={{ fontSize: 25, fontWeight: '700' }}>Karpo，您的共乘好夥伴</Text>
          <Text category="p2" style={{ fontSize: 16, textAlign: 'center', lineHeight: 25 }}>
            開始使用Karpo，以輕鬆找到適合的共乘夥伴，共同享受便捷、經濟、友善的出行體驗。
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, gap: 10, paddingHorizontal: 25, justifyContent: 'center' }}>
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
    </SafeAreaView>
  )
}
