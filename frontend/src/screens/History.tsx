import { FlatList, View } from 'react-native'
import { Button, Divider, Icon, ListItem, Text, useTheme } from '@ui-kitten/components'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Image } from 'expo-image'

import historyTemplate from '~/assets/templates/history.json'
import { useGetHistoryQuery } from '~/redux/api/users'

const icons = {
  driver: require('~/assets/icons/hatchback.png'),
  passenger: require('~/assets/icons/dog.png')
}

const MiniLocationItem = ({
  description,
  icon,
  iconColor
}: {
  description: string
  icon: string
  iconColor: string
}) => (
  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
    <Icon name={icon} style={{ width: 15, height: 15 }} fill={iconColor} />
    <Text style={{ color: '#5A5A5A', fontSize: 12.5, fontWeight: '500' }}>{description}</Text>
  </View>
)

interface HistoryCardProps {
  role: 'driver' | 'passenger'
  origin: string
  destination: string
  time: Date
  onViewDetail?: () => void
  onBookAgain?: () => void
}

function HistoryCard({
  role,
  origin,
  destination,
  time,
  onViewDetail,
  onBookAgain
}: HistoryCardProps) {
  const theme = useTheme()

  return (
    <ListItem
      onPress={onViewDetail}
      style={{ paddingHorizontal: 13, paddingVertical: 13, gap: 10 }}
    >
      <View
        style={{
          width: 65,
          height: 65,
          padding: 10,
          borderRadius: 7,
          backgroundColor: theme['color-basic-default']
        }}
      >
        <Image source={icons[role]} style={{ height: '100%' }} contentFit="contain" />
      </View>
      <View style={{ gap: 5 }}>
        <MiniLocationItem
          description={origin}
          icon="radio-button-on"
          iconColor={theme['color-primary-default']}
        />
        <MiniLocationItem
          description={destination}
          icon="pin"
          iconColor={theme['color-basic-700']}
        />
        <Text category="c1" style={{ color: theme['text-hint-color'] }}>
          {format(time, 'LLLdo ⋅ p', { locale: zhTW })}
        </Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Button onPress={onBookAgain} status="basic" size="small" style={{ borderRadius: 20 }}>
          重新預訂
        </Button>
      </View>
    </ListItem>
  )
}

export default function HistoryScreen() {
  // const historyRides = historyTemplate.map(({ time, ...rest }) => ({
  //   time: new Date(time),
  //   ...rest
  // }))

  const { data: historyRides } = useGetHistoryQuery(undefined)

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={historyRides}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={() => <Divider />}
        renderItem={({ item: { role, time, origin, destination } }) => (
          <HistoryCard
            role={role}
            time={new Date(time)}
            origin={origin.description}
            destination={destination.description}
          />
        )}
      />
    </View>
  )
}
