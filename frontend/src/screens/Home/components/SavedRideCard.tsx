import { View } from 'react-native'
import { Card, Icon, Text, useTheme } from '@ui-kitten/components'

import { displayTime } from '~/utils/format'
import { SavedRide } from '~/types/data'

export function SavedRideCard({
  label,
  time,
  origin,
  destination,
  onPress
}: SavedRide & { onPress?: () => void }) {
  const theme = useTheme()

  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                backgroundColor: theme['color-basic-600'],
                borderRadius: 100,
                paddingVertical: 5,
                paddingHorizontal: 10
              }}
            >
              <Text style={{ color: theme['color-basic-100'], fontWeight: 'bold' }}>{label}</Text>
            </View>
            <Text style={{ fontSize: 18 }}>{displayTime(time.toString())}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ width: 130 }}>{origin.description}</Text>
            <Icon style={{ width: 18, height: 18, marginRight: 5 }} name="arrow-forward" />
            <Text>{destination.description}</Text>
          </View>
        </View>
        <Icon
          style={{ width: 20, height: 20 }}
          name="arrow-ios-forward"
          fill={theme['color-basic-500']}
        />
      </View>
    </Card>
  )
}
