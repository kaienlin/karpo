import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useController, type Control } from 'react-hook-form'
import { useNavigation } from '@react-navigation/native'
import { Button, Icon, Text, type IconProps } from '@ui-kitten/components'

import { InputCounter, InputTime as InputTimeModal } from '~/components/InputModals'
import { WaypointList } from '~/components/rideplan/Waypoints'
import { useWaypoints } from '~/hooks/useWaypoints'
import { displayDatetime } from '~/utils/format'

export const emptyWaypoint = { description: '', latitude: null, longitude: null }

const CheckIcon = (props: IconProps) => <Icon {...props} name="checkmark" />
const ArrowDownIcon = (props: IconProps) => <Icon {...props} name="arrow-ios-downward" />

const inputButtonStyles = {
  base: {
    status: 'input',
    appearance: 'filled',
    accessoryRight: ArrowDownIcon
  },
  valid: {
    status: 'primary',
    appearance: 'outline',
    accessoryRight: CheckIcon
  },
  invalid: {
    status: 'danger',
    appearance: 'outline',
    accessoryRight: ArrowDownIcon
  }
}

const InputTime = ({ name, control }: { name: string; control: Control<any> }) => {
  const {
    field: { onChange, value },
    fieldState: { invalid }
  } = useController({
    name,
    control,
    rules: { required: true, validate: (value) => value !== null && value > new Date() }
  })

  return (
    <InputTimeModal
      title="設定出發時間"
      value={value}
      onChange={onChange}
      renderTriggerComponent={({ onOpen, value }) => (
        <Button
          onPress={onOpen}
          size="small"
          style={{ borderRadius: 8, gap: -10, paddingHorizontal: 0 }}
          accessoryLeft={(props) => <Icon {...props} name="clock" />}
          {...(!value
            ? inputButtonStyles.base
            : invalid
              ? inputButtonStyles.invalid
              : inputButtonStyles.valid)}
        >
          {!value ? '立即出發' : `${displayDatetime(value)} 出發`}
        </Button>
      )}
    />
  )
}

const InputSeats = ({ name, control }: { name: string; control: Control<any> }) => {
  const {
    field: { onChange, value },
    fieldState: { invalid }
  } = useController({
    name,
    control,
    rules: { required: true, validate: (value) => value !== null && value > 0 }
  })

  return (
    <InputCounter
      title="可搭載人數"
      value={value}
      onChange={onChange}
      renderTriggerComponent={({ onOpen, value }) => (
        <Button
          onPress={onOpen}
          size="small"
          style={{ borderRadius: 8, gap: -10, paddingHorizontal: 0 }}
          accessoryLeft={(props) => <Icon {...props} name="person" />}
          {...(value <= 0
            ? inputButtonStyles.base
            : invalid
              ? inputButtonStyles.invalid
              : inputButtonStyles.valid)}
        >
          {value === 0 ? '可搭載人數' : `可搭載 ${value} 人`}
        </Button>
      )}
    />
  )
}

const AddWaypointButton = ({ onPress }: { onPress: () => void }) => (
  <View style={{ alignItems: 'flex-end', marginTop: 15, marginRight: 12 }}>
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        gap: 3,
        alignItems: 'center'
      }}
    >
      <Text category="label" style={{ fontSize: 14 }}>
        新增停靠點
      </Text>
      <Icon style={{ width: 15, height: 15 }} name="plus" />
    </TouchableOpacity>
  </View>
)

const InputWaypoints = ({ name, control }: { name: string; control: Control<any> }) => {
  const navigation = useNavigation()
  const { fields: waypoints, append, remove } = useWaypoints(control)

  const onSelect = (index: number) => () => {
    navigation.navigate('SelectWaypointScreen', {
      waypointIndex: index,
      waypoint: waypoints[index]
    })
  }

  const onRemove = (index: number) => () => {
    remove(index)
  }

  const onAppend = () => {
    append(emptyWaypoint)
  }

  return (
    <>
      <WaypointList waypoints={waypoints} onSelect={onSelect} onRemove={onRemove} />
      {waypoints.length < 5 && <AddWaypointButton onPress={onAppend} />}
    </>
  )
}

export default function PlanPanel({ control }: { control: Control<any> }) {
  return (
    <View style={styles.panelContainer}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ columnGap: 10 }}
        style={{ paddingBottom: 10 }}
      >
        <InputTime name="time" control={control} />
        <InputSeats name="numSeats" control={control} />
      </ScrollView>
      <InputWaypoints name="waypoints" control={control} />
    </View>
  )
}

const styles = StyleSheet.create({
  panelContainer: {
    paddingLeft: 25,
    paddingRight: 10,
    paddingBottom: 15
  },
  waypointInputSeparator: {
    left: 7,
    width: 1.25,
    height: 15,
    marginVertical: -5,
    backgroundColor: '#D8D8D8'
  }
})
