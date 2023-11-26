export const displayDatetime = (date: Date, is24Hour: boolean = false) => {
  const today = new Date()

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
