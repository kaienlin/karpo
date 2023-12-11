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

  useEffect(() => {
    const dateTime = new Date(`${date.toDateString()} ${time.toTimeString()}`)
    onChange(undefined, dateTime)
  }, [date, time])

  const handleChange = (event: RNDateTimePickerEvent, date?: Date) => {
    if (mode === 'date') {
      setDate(date ?? new Date())
    } else {
      setTime(date ?? new Date())
    }
  }

  const showMode = (mode: 'date' | 'time') => () => {
    setMode(mode)
    DateTimePickerAndroid.open({
      value: date,
      mode,
      onChange: handleChange,
      display: 'default',
      ...props
    })
  }

  const dateStr = isToday(date) ? '今天' : format(date, 'LLLdo EE', { locale: zhTW })
  const timeStr = format(time, 'p', { locale: zhTW })

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

export default function DateTimePicker({
  date,
  setDate
}: {
  date: Date
  setDate: (date: Date) => void
}) {
  const roundedDate = new Date(Math.ceil(date.getTime() / 300000) * 300000) // 300000 ms = 1000 * 60 * 5 minutes
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
          minimumDate={roundedDate}
          minuteInterval={5}
          mode={'datetime'}
          display="spinner"
          locale="zh-TW"
        />
      ) : (
        <AndroidDateTimePicker
          value={roundedDate}
          onChange={onChange}
          minimumDate={roundedDate}
          minuteInterval={5}
        />
      )}
    </View>
  )
}
