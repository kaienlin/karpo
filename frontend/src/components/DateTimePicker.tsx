import { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import {
  DateTimePickerAndroid,
  default as RNDateTimePicker,
  type AndroidNativeProps,
  type DateTimePickerEvent as RNDateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { Button, Text } from '@ui-kitten/components'
import { format, isToday } from 'date-fns'
import { zhTW } from 'date-fns/locale'

const AndroidDateTimePicker = ({
  value,
  onChange,
  ...props
}: {
  value: Date
  onChange: (event, value) => void
} & AndroidNativeProps) => {
  const [date, setDate] = useState(value ?? new Date())
  const [time, setTime] = useState(value ?? new Date())
  const [mode, setMode] = useState<AndroidNativeProps['mode']>('date')

  const dateStr = isToday(date) ? '今天' : format(date, 'LLLdo EE', { locale: zhTW })
  const timeStr = format(time, 'p', { locale: zhTW })

  useEffect(() => {
    const dateTime = new Date(`${date.toDateString()} ${time.toTimeString()}`)
    onChange(undefined, dateTime)
  }, [date, time])

  const handleChange = (event: RNDateTimePickerEvent, date?: Date) => {
    if (mode === 'date') {
      setDate(date)
    } else {
      setTime(date)
    }
  }

  const showMode = (mode: AndroidNativeProps['mode']) => () => {
    setMode(mode)
    DateTimePickerAndroid.open({
      mode,
      display: 'default',
      value: mode === 'date' ? date : time,
      onChange: handleChange,
      ...props
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Button size="large" status="basic" onPress={showMode('date')} style={{ flex: 1 }}>
          <Text style={{ fontSize: 40 }}>{dateStr}</Text>
        </Button>
        <Button size="large" status="basic" onPress={showMode('time')} style={{ flex: 1 }}>
          <Text style={{ fontSize: 40 }}>{timeStr}</Text>
        </Button>
      </View>
    </View>
  )
}

const round2interval = (date: Date, minutes: number = 5) => {
  const ms = 1000 * 60 * minutes
  return new Date(Math.ceil(date.getTime() / ms) * ms)
}

export default function DateTimePicker({
  date,
  setDate
}: {
  date: Date
  setDate: (date: Date) => void
}) {
  const roundedDate = round2interval(date, 5)
  const minimumDate = round2interval(new Date(), 5)

  useEffect(() => {
    setDate(roundedDate)
  }, [])

  const onChange = (event: RNDateTimePickerEvent, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'ios' ? (
        <RNDateTimePicker
          value={roundedDate}
          onChange={onChange}
          minimumDate={minimumDate}
          minuteInterval={5}
          mode={'datetime'}
          display="spinner"
          locale="zh-TW"
        />
      ) : (
        <AndroidDateTimePicker
          value={roundedDate}
          onChange={onChange}
          minimumDate={minimumDate}
          minuteInterval={5}
        />
      )}
    </View>
  )
}
