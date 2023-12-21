import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { Image } from 'expo-image'

export const AnimatedDog = () => {
  const ANGLE = 10
  const TIME = 2000
  const EASING = Easing.out(Easing.exp)

  const rotation = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }]
  }))

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-(ANGLE * 2.5), { duration: TIME, easing: EASING }),
        withTiming(ANGLE / 2, { duration: TIME, easing: EASING })
      ),
      -1,
      true
    )
  }, [])

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View style={animatedStyle}>
        <Image source={require('~/assets/icons/dog.png')} style={{ width: 80, height: 80 }} />
      </Animated.View>
    </View>
  )
}
