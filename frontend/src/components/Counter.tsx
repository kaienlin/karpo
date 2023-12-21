import { TouchableOpacity, View } from 'react-native'
import { Icon, Text, useTheme } from '@ui-kitten/components'

interface CounterProps {
  value: number
  onValueChange: (value: number) => void
  minValue?: number
  maxValue?: number
}

export default function Counter({
  value,
  onValueChange,
  minValue = 0,
  maxValue = 5
}: CounterProps) {
  const theme = useTheme()

  const decrease = () => {
    if (value > minValue) {
      onValueChange((prev) => prev - 1)
    }
  }
  const increase = () => {
    if (value < maxValue) {
      onValueChange((prev) => prev + 1)
    }
  }

  const decreaseDisabled = value <= minValue
  const increaseDisabled = value >= maxValue

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
      }}
    >
      <TouchableOpacity onPress={decrease} disabled={decreaseDisabled} activeOpacity={0.5}>
        <Icon
          style={{ width: 40, height: 40 }}
          name="minus-circle-outline"
          fill={decreaseDisabled ? theme['color-basic-disabled'] : theme['color-basic-700']}
        />
      </TouchableOpacity>
      <Text style={{ width: 50, fontSize: 30, fontWeight: '500', textAlign: 'center' }}>
        {value}
      </Text>

      <TouchableOpacity onPress={increase} disabled={increaseDisabled} activeOpacity={0.5}>
        <Icon
          style={{ width: 40, height: 40 }}
          name="plus-circle-outline"
          fill={increaseDisabled ? theme['color-basic-disabled'] : theme['color-basic-700']}
        />
      </TouchableOpacity>
    </View>
  )
}
