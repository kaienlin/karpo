import { View } from 'react-native'
import { Text, useTheme } from '@ui-kitten/components'

export const Radio = ({ diameter = 18 }: { diameter?: number }) => {
  const theme = useTheme()
  const outerRadius = Math.ceil(diameter / 2)

  const innerDiameter = outerRadius - 2
  const innerRadius = Math.ceil(innerDiameter / 2)

  return (
    <View
      style={{
        width: diameter,
        height: diameter,
        borderRadius: outerRadius,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme['color-primary-default']
      }}
    >
      <View
        style={{
          width: innerDiameter,
          height: innerDiameter,
          borderRadius: innerRadius,
          backgroundColor: 'white'
        }}
      />
    </View>
  )
}

export const Box = ({ label, size = 15 }: { label: string; size?: number }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: '#484848',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2
      }}
    >
      <Text category="label" style={{ fontSize: 10, color: 'white' }}>
        {label}
      </Text>
    </View>
  )
}

export const DoubleBox = ({ size = 15 }: { size?: number }) => {
  const outerRadius = Math.ceil(size / 2)

  const innerDiameter = outerRadius - 2

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#484848'
      }}
    >
      <View
        style={{
          width: innerDiameter,
          height: innerDiameter,
          backgroundColor: 'white'
        }}
      />
    </View>
  )
}

export default { Radio, Box, DoubleBox }
