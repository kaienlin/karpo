import { View } from "react-native";
import { Icon, Text } from '@ui-kitten/components'
import { PassengerRequest } from "~/types/data";

export interface QueryProps {
  time: string
  origin: Waypoint
  destination: Waypoint
}

const truncate = (description: string | undefined) => {
  if(description && description.length >= 6)
    return description.slice(0, 6) + '...'
  return description
}

export function QueryBlock({
  time,
  origin,
  destination,
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
        <Text style={{ fontSize: 22 }}>{truncate(origin.description)}</Text>
        <Icon name="arrow-forward-outline" style={{ width: 42, height: 30 }} />
        <Text style={{ fontSize: 22 }}>{truncate(destination.description)}</Text>
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
        <Text>{time}</Text>
      </View>
    </View>
  )
}