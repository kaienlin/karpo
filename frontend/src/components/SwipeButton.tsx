import React, { useEffect } from 'react'
import { ActivityIndicator, Dimensions, View } from 'react-native'
import { Icon, StyleService, useStyleSheet, useTheme } from '@ui-kitten/components'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  Extrapolate,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated'

const BUTTON_WIDTH = Dimensions.get('screen').width - 48
const SWIPE_RANGE = BUTTON_WIDTH - 90

interface SwipeButtonProps {
  onSwipe: () => void
  isLoading?: boolean
  text?: string
}

export default function SwipeButton({
  onSwipe,
  isLoading = false,
  text = 'Swipe me for some action'
}: SwipeButtonProps) {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const offset = useSharedValue(0)
  const buttonContentOpacity = useSharedValue(0)
  buttonContentOpacity.value = withRepeat(
    withTiming(1, { duration: 1000, easing: Easing.ease }),
    -1,
    true
  )

  useEffect(() => {
    if (!isLoading) {
      offset.value = withSpring(0)
    }
  }, [isLoading])

  const pan = Gesture.Pan()
    .onChange((event) => {
      const newValue = event.translationX
      if (newValue >= 0 && newValue <= SWIPE_RANGE) {
        offset.value = newValue
      }
    })
    .onFinalize((event) => {
      if (offset.value < SWIPE_RANGE - 20) {
        offset.value = withSpring(0)
      } else {
        runOnJS(onSwipe)()
      }
    })

  const AnimatedStyles = {
    swipeButton: useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(
            offset.value,
            [20, BUTTON_WIDTH],
            [0, BUTTON_WIDTH],
            Extrapolation.CLAMP
          )
        }
      ]
    })),
    swipeText: useAnimatedStyle(() => ({
      opacity: interpolate(offset.value, [0, BUTTON_WIDTH / 4], [1, 0], Extrapolate.CLAMP),
      transform: [
        {
          translateX: interpolate(
            offset.value,
            [20, SWIPE_RANGE],
            [0, BUTTON_WIDTH / 3],
            Extrapolate.CLAMP
          )
        }
      ]
    })),
    swipeButtonContent: useAnimatedStyle(() => ({
      opacity: buttonContentOpacity.value
    }))
  }

  return (
    <View style={styles.swipeButtonContainer}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.swipeButton, AnimatedStyles.swipeButton]}>
          <Animated.View style={[styles.swipeButtonContent, AnimatedStyles.swipeButtonContent]}>
            <Icon
              style={{ height: 25, width: 25 }}
              name="arrow-ios-forward-outline"
              fill={theme['color-primary-600']}
            />
            <Icon
              style={{ height: 25, width: 25 }}
              name="arrow-ios-forward-outline"
              fill={theme['color-primary-400']}
            />
          </Animated.View>
          {isLoading ? (
            <ActivityIndicator color={'#fff'} />
          ) : // <Image style={styles.chevron} source={Chevron} />
          null}
        </Animated.View>
      </GestureDetector>
      <Animated.Text style={[styles.swipeText, AnimatedStyles.swipeText]}>{text}</Animated.Text>
    </View>
  )
}

const themedStyles = StyleService.create({
  swipeButtonContainer: {
    height: 59,
    backgroundColor: 'color-primary-default',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: BUTTON_WIDTH
  },
  swipeButton: {
    position: 'absolute',
    left: 10,
    height: 45,
    width: 80,
    borderRadius: 100,
    zIndex: 3,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  swipeButtonContent: {
    flexDirection: 'row',
    gap: -12
  },
  swipeButtonDisabled: {
    backgroundColor: '#E4E9EE'
  },
  swipeText: {
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '500',
    zIndex: 2,
    color: 'white',
    marginLeft: 80
  }
})
