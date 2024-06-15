export function checkDatesEquality(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function getHourMinute(date: Date) {
  return (
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0')
  )
}

export function getMinuteSecond(seconds: number) {
  return (
    Math.round((seconds - (seconds % 60)) / 60)
      .toString()
      .padStart(2, '0') +
    ':' +
    (seconds % 60).toString().padStart(2, '0')
  )
}

export function maxDate(d1: Date, d2: Date) {
  return d1.getTime() > d2.getTime() ? d1 : d2
}
