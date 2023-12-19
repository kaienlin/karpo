import { View } from 'react-native'
import { Shadow } from 'react-native-shadow-2'

export const CardContainer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Shadow
      stretch={true}
      startColor="#00000010"
      containerStyle={{
        marginHorizontal: 10
      }}
    >
      <View style={{ borderRadius: 10 }}>{children}</View>
    </Shadow>
  )
}
