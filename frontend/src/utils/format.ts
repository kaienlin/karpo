export const displayDatetime = (date: Date | string, is24Hour: boolean = false) => {
  const today = new Date()

  if (typeof date === 'string') {
    date = new Date(date)
  }

  const dateStr =
    date.toLocaleDateString() === today.toLocaleDateString()
      ? '今天'
      : date.toLocaleDateString('zh-TW', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('zh-TW', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: !is24Hour
  })

  return `${dateStr} ${timeStr}`
}

export const displayProximity = (proximity: number) => {
  if (proximity > 0.8) {
    return `超級順路`
  } else if (proximity > 0.6) {
    return `挺順路`
  } else if (proximity > 0.4) {
    return `普通`
  } else {
    return `不太順路`
  }
}
