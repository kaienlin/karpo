import { FlatList, StyleSheet, View } from 'react-native'
import { Button, Icon, Input, useTheme, type IconProps } from '@ui-kitten/components'

import RouteMarker from '~/components/maps/RouteMarker'

const CloseIcon = (props: IconProps) => <Icon {...props} name="close" />
const OriginIcon = () => {
  const theme = useTheme()
  return (
    <View style={{ width: 15, height: 15, justifyContent: 'center', alignItems: 'center' }}>
      <Icon
        style={{ width: 18, height: 18 }}
        name="radio-button-on"
        fill={theme['color-primary-default']}
      />
    </View>
  )
}

interface WaypointAction {
  onSelect: (index: number) => () => void
  onRemove: (index: number) => () => void
}

interface WaypointItemProps extends WaypointAction {
  index: number
  item: Waypoint
  placeholder: string
  showRemoveButton: boolean
}

interface WaypointListProps extends WaypointAction {
  waypoints: Waypoint[]
}

const WaypointItem = ({
  index,
  item,
  placeholder,
  showRemoveButton,
  onSelect,
  onRemove
}: WaypointItemProps) => {
  const icon = index === 0 ? <OriginIcon /> : <RouteMarker.Box label={`${index}`} />
  const searchBar = (
    <View style={{ flex: 1, paddingLeft: 10, paddingRight: 5 }}>
      <Input
        size="small"
        placeholder={placeholder}
        value={item?.description}
        onFocus={onSelect(index)}
      />
    </View>
  )
  const removeButton = (
    <View style={{ width: 35 }}>
      {index > 0 && showRemoveButton && (
        <Button
          size="small"
          appearance="ghost"
          status="basic"
          style={{ width: 10 }}
          accessoryLeft={CloseIcon}
          onPress={onRemove(index)}
        />
      )}
    </View>
  )

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {icon}
      {searchBar}
      {removeButton}
    </View>
  )
}

export function WaypointList({ waypoints, onSelect, onRemove }: WaypointListProps) {
  return (
    <FlatList
      data={waypoints}
      scrollEnabled={false}
      keyExtractor={(item, index) => index.toString()}
      ItemSeparatorComponent={() => <View style={styles.waypointInputSeparator} />}
      renderItem={({ item, index }) => {
        const placeholder =
          index === 0 ? '上車地點' : waypoints.length === 2 ? '下車地點' : '新增停靠點'

        return (
          <WaypointItem
            index={index}
            item={item}
            placeholder={placeholder}
            onSelect={onSelect}
            onRemove={onRemove}
            showRemoveButton={waypoints.length > 2}
          />
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  waypointInputSeparator: {
    left: 7,
    width: 1.25,
    height: 15,
    marginVertical: -5,
    backgroundColor: '#D8D8D8'
  }
})
