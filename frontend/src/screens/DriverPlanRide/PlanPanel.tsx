import { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useController, useFieldArray, type Control } from 'react-hook-form'
import { type BottomSheetModal } from '@gorhom/bottom-sheet'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Button, Icon, Input, Text, useTheme, type IconProps } from '@ui-kitten/components'

import Counter from '~/components/Counter'
import DateTimePicker from '~/components/DateTimePicker'
import { InputModal } from '~/components/InputModals'
import { displayDatetime } from '~/utils/format'

const CloseIcon = (props: IconProps) => <Icon {...props} name="close" />

const InputTime = ({ name, control }: { name: string; control: Control<any> }) => {
  const {
    field: { onChange, value },
    fieldState: { invalid }
  } = useController({
    name,
    control,
    rules: { required: true, validate: (value) => value !== null && value > new Date() }
  })

  const [tempValue, setTempValue] = useState<Date>(value ?? new Date())
  const modalRef = useRef<BottomSheetModal>(null)

  return (
    <>
      <Button
        onPress={() => {
          modalRef.current?.present()
        }}
        size="small"
        appearance={value == null ? 'filled' : 'outline'}
        status={invalid ? 'danger' : value == null ? 'input' : 'primary'}
        style={{ borderRadius: 8, gap: -10, paddingHorizontal: 0 }}
        accessoryLeft={(props) => <Icon {...props} name="clock" />}
        accessoryRight={(props) => (
          <Icon {...props} name={value == null ? 'arrow-ios-downward' : 'checkmark'} />
        )}
      >
        {value == null ? '立即出發' : `${displayDatetime(value)} 出發`}
      </Button>
      <InputModal ref={modalRef} height="55%">
        <Text category="h5">設定出發時間</Text>
        <DateTimePicker date={tempValue} setDate={setTempValue} />
        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          <Button
            size="giant"
            style={{ borderRadius: 100 }}
            onPress={() => {
              onChange(tempValue)
              modalRef.current?.dismiss()
            }}
          >
            確定
          </Button>
        </View>
      </InputModal>
    </>
  )
}

const InputSeats = ({ name, control }: { name: string; control: Control<any> }) => {
  const {
    field: { onChange, value },
    fieldState: { invalid }
  } = useController({
    name,
    control,
    rules: { required: true, validate: (value) => value > 0 }
  })
  const [tempValue, setTempValue] = useState<number>(value ?? 0)
  const modalRef = useRef<BottomSheetModal>(null)

  return (
    <>
      <Button
        onPress={() => {
          modalRef.current?.present()
        }}
        size="small"
        appearance={value === 0 ? 'filled' : 'outline'}
        status={invalid ? 'danger' : value === 0 ? 'input' : 'primary'}
        style={{ borderRadius: 8, gap: -10, paddingHorizontal: 0 }}
        accessoryLeft={(props) => <Icon {...props} name="person" />}
        accessoryRight={(props) => (
          <Icon {...props} name={value === 0 ? 'arrow-ios-downward' : 'checkmark'} />
        )}
      >
        {value === 0 ? '可搭載人數' : `可搭載 ${value} 人`}
      </Button>
      <InputModal ref={modalRef} height="40%">
        <Text category="h5">可搭載人數</Text>
        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          <Counter value={tempValue} onValueChange={setTempValue} />
          <Button
            size="giant"
            style={{ borderRadius: 100 }}
            onPress={() => {
              onChange(tempValue)
              modalRef.current?.dismiss()
            }}
          >
            確定
          </Button>
        </View>
      </InputModal>
    </>
  )
}

const InputWaypoints = ({
  waypoints,
  onSelect,
  onRemove
}: {
  waypoints: Array<Waypoint & { id: string }>
  onSelect: (index: number) => void
  onRemove: (index: number) => void
}) => {
  const theme = useTheme()

  const renderSeparator = useCallback(() => <View style={styles.waypointInputSeparator} />, [])

  const renderItem = ({ item, index }: { item: Waypoint; index: number }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {index === 0 ? (
        <View style={{ width: 15, height: 15, justifyContent: 'center', alignItems: 'center' }}>
          <Icon
            style={{ width: 18, height: 18 }}
            name="radio-button-on"
            fill={theme['color-primary-default']}
          />
        </View>
      ) : (
        <View
          style={{
            width: 15,
            height: 15,
            backgroundColor: '#484848',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Text category="label" style={{ fontSize: 10, color: 'white' }}>
            {index}
          </Text>
        </View>
      )}

      <View style={{ flex: 1, paddingLeft: 10, paddingRight: 5 }}>
        <Input
          size="small"
          placeholder={
            index === 0 ? '上車地點' : waypoints.length === 2 ? '下車地點' : '新增停靠點'
          }
          value={item.description}
          onFocus={() => {
            onSelect(index)
          }}
        />
      </View>
      <View style={{ width: 35 }}>
        {index > 0 && waypoints.length > 2 && (
          <Button
            size="small"
            appearance="ghost"
            status="basic"
            style={{ width: 10 }}
            accessoryLeft={CloseIcon}
            onPress={() => {
              onRemove(index)
            }}
          />
        )}
      </View>
    </View>
  )

  return (
    <FlatList
      data={waypoints}
      scrollEnabled={false}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id}
      ItemSeparatorComponent={renderSeparator}
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

export const emptyWaypoint = { description: '', latitude: null, longitude: null }

export default function PlanPanel({ control }: { control: Control<any> }) {
  const navigation = useNavigation()
  const route = useRoute()

  const { updatedWaypoint } = route?.params ?? {}

  const {
    fields: waypoints,
    append,
    update,
    remove
  } = useFieldArray({
    control,
    name: 'waypoints'
  })

  useEffect(() => {
    const { index, payload } = updatedWaypoint ?? {}
    update(index, payload)
  }, [updatedWaypoint])

  const handleSelectWaypoint = (index: number) => {
    navigation.navigate('SelectWaypointScreen', {
      waypointIndex: index,
      waypoint: waypoints[index]
    })
  }

  const handleRemoveWaypoint = (index: number) => {
    remove(index)
  }

  const handleAddWaypoint = () => {
    append(emptyWaypoint)
  }

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
      <InputWaypoints
        waypoints={waypoints}
        onSelect={handleSelectWaypoint}
        onRemove={handleRemoveWaypoint}
      />
      {waypoints.length < 5 && <AddWaypointButton onPress={handleAddWaypoint} />}
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
