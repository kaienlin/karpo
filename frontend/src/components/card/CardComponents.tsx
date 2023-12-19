import { StyleSheet, View } from 'react-native'
import { Button, Icon, Text, type IconProps } from '@ui-kitten/components'

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />

export const ContactItems = ({ onChat, onCall }: { onChat: () => void; onCall: () => void }) => {
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
      <Button
        accessoryLeft={ChatIcon}
        style={{ borderRadius: 100, width: 40, height: 40 }}
        status="basic"
        onPress={onChat}
      />
      <Button
        accessoryLeft={PhoneIcon}
        style={{ borderRadius: 100, width: 40, height: 40 }}
        status="basic"
        onPress={onCall}
      />
    </View>
  )
}

export const LocationItem = ({
  description,
  icon = 'pin',
  iconColor = 'black'
}: {
  description: string
  icon?: string
  iconColor?: string
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
      <Icon name={icon} style={{ width: 24, height: 24 }} fill={iconColor} />
      <View style={{ marginHorizontal: 10 }}>
        <Text style={styles.lightText}>{description}</Text>
      </View>
    </View>
  )
}

export const RatingItem = ({ rating }: { rating: string }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Icon name="star" style={{ width: 16, height: 16 }} fill={'#F0C414'} />
      <Text style={styles.lightText}>{rating}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A',
    fontSize: 13
  }
})
