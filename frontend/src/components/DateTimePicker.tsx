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
  const roundedDate = new Date(Math.ceil(date.getTime() / 300000) * 300000) // 300000 ms = 1000 * 60 * 5 minutes
  const onChange = (event: RNDateTimePickerEvent, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
    }
  }
  // TODO: validate expired date (and set to nears valid date)
  // TODO: add support for Android

  return (
    <View style={{ flex: 1 }}>
      <RNDateTimePicker
        value={roundedDate}
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
