import { format, isToday } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export const displayTime = (dateString: string, hour12: boolean = true) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: hour12 })
}

export const displayDatetime = (date: Date | string, is24Hour: boolean = false) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  const dateStr = isToday(date) ? '今天' : format(date, 'LLLdo EE', { locale: zhTW })
  const timeStr = format(date, 'p', { locale: zhTW })

  return `${dateStr} ${timeStr}`
}

export const displayProximity = (proximity: number) => {
  if (proximity < 5000) {
    return `超級順路`
  } else if (proximity < 20000) {
    return `挺順路`
  } else if (proximity < 100000) {
    return `普通`
  } else {
    return `不太順路`
  }
}
