import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)

const JST = 'Asia/Tokyo'

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).tz(JST).format(format)
}

export const formatTime = (time: string, format = 'HH:mm'): string => {
  return dayjs(time, 'HH:mm').format(format)
}

export const getToday = (): string => {
  return dayjs().tz(JST).format('YYYY-MM-DD')
}

export const getCurrentDateTime = (): string => {
  return dayjs().tz(JST).format('YYYY-MM-DD HH:mm:ss')
}

export const addDays = (date: string, days: number): string => {
  return dayjs.tz(date, JST).add(days, 'day').format('YYYY-MM-DD')
}

export const isToday = (date: string): boolean => {
  return dayjs.tz(date, JST).isSame(dayjs().tz(JST), 'day')
}

export const isPast = (date: string): boolean => {
  return dayjs.tz(date, JST).isBefore(dayjs().tz(JST), 'day')
}

export const isFuture = (date: string): boolean => {
  return dayjs.tz(date, JST).isAfter(dayjs().tz(JST), 'day')
}

export const getWeekStart = (date: string, weekStart = 0): string => {
  return dayjs.tz(date, JST).startOf('week').add(weekStart, 'day').format('YYYY-MM-DD')
}

export const getMonthStart = (date: string): string => {
  return dayjs.tz(date, JST).startOf('month').format('YYYY-MM-DD')
}

export const getMonthEnd = (date: string): string => {
  return dayjs.tz(date, JST).endOf('month').format('YYYY-MM-DD')
}

export const getCalendarDays = (year: number, month: number, weekStart = 1) => {
  const monthString = String(month).padStart(2, '0')
  const base = dayjs.tz(`${year}-${monthString}-01`, JST)
  const startOfMonth = base.startOf('month')
  const endOfMonth = base.endOf('month')
  
  // 月曜日開始の週の開始日を計算
  const startOfCalendar = startOfMonth.startOf('week').add(1, 'day')
  const endOfCalendar = endOfMonth.endOf('week').add(1, 'day')
  
  const days = []
  let current = startOfCalendar
  
  while (current.isSameOrBefore(endOfCalendar, 'day')) {
    days.push({
      date: current.format('YYYY-MM-DD'),
      isCurrentMonth: current.isSame(startOfMonth, 'month'),
      isToday: current.isSame(dayjs().tz(JST), 'day'),
      tasks: []
    })
    current = current.add(1, 'day')
  }
  
  return days
}

export const getDayOfMonthJST = (date: string): number => {
  return Number(dayjs.tz(date, JST).format('D'))
}
