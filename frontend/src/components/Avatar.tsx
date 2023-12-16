import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'

export function Avatar({
  base64Uri,
  size = 'small'
}: {
  base64Uri: string
  size?: 'small' | 'large'
}) {
  return (
    <Image
      source={{ uri: `data:image/png;base64,${base64Uri}` }}
      style={size === 'small' ? styles.small : styles.large}
    />
  )
}

const styles = StyleSheet.create({
  small: {
    width: 50,
    height: 50
  },
  large: {
    width: 85,
    height: 85
  }
})
