import { View } from 'react-native'
import { default as RNDateTimePicker } from '@react-native-community/datetimepicker'
import type { DateTimePickerEvent as RNDateTimePickerEvent } from '@react-native-community/datetimepicker'

export default function DateTimePicker({
  date,
  setDate
}: {
  date: Date
  setDate: (date: Date) => void
}) {
  const onChange = (event: RNDateTimePickerEvent, selectedDate: Date | undefined) => {
    setDate(selectedDate)
  }
  // TODO: validate expired date (and set to nears valid date)
  // TODO: add support for Android

  return (
    <View style={{ flex: 1 }}>
      <RNDateTimePicker
        value={date}
        mode={'datetime'}
        onChange={onChange}
        display="spinner"
        minuteInterval={5}
        locale="zh-TW"
        minimumDate={new Date()}
      />
    </View>
  )
}
