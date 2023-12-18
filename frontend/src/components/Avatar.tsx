import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'

export function Avatar({
  base64Uri,
  size = 'small'
}: {
  base64Uri: string
  size?: 'mini' | 'small' | 'large'
}) {
  return <Image source={{ uri: `data:image/png;base64,${base64Uri}` }} style={styles[size]} />
}

const styles = StyleSheet.create({
  mini: {
    width: 35,
    height: 35
  },
  small: {
    width: 50,
    height: 50
  },
  large: {
    width: 85,
    height: 85
  }
})
