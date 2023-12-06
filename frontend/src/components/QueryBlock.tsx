import { View } from "react-native";
import { Icon, Text } from '@ui-kitten/components'

export interface QueryProps {
  origin: string
  destination: string
  date: string
}

export function QueryBlock({
  origin,
  destination,
  date
}: QueryProps) {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignContent: 'center',
          marginHorizontal: 20,
          marginTop: 20
        }}
      >
        <Text style={{ fontSize: 22 }}>{origin}</Text>
        <Icon name="arrow-forward-outline" style={{ width: 42, height: 30 }} />
        <Text style={{ fontSize: 22 }}>{destination}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignContent: 'center',
          marginHorizontal: 20,
          marginVertical: 5
        }}
      >
        <Text>{date}</Text>
      </View>
    </View>
  )
}