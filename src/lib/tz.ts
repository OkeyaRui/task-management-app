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

export const getCalendarDays = (year: number, month: number, weekStart = 0) => {
  const monthString = String(month).padStart(2, '0')
  const base = dayjs.tz(`${year}-${monthString}-01`, JST)
  const startOfMonth = base.startOf('month')
  const endOfMonth = base.endOf('month')
  
  const startOfCalendar = startOfMonth.startOf('week').add(weekStart, 'day')
  const endOfCalendar = endOfMonth.endOf('week').add(weekStart, 'day')
  
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

// 祝日データ（2024-2025年）
const HOLIDAYS: Record<string, string> = {
  // 2024年
  '2024-01-01': '元日',
  '2024-01-08': '成人の日',
  '2024-02-11': '建国記念の日',
  '2024-02-12': '建国記念の日 振替休日',
  '2024-02-23': '天皇誕生日',
  '2024-03-20': '春分の日',
  '2024-04-29': '昭和の日',
  '2024-05-03': '憲法記念日',
  '2024-05-04': 'みどりの日',
  '2024-05-05': 'こどもの日',
  '2024-05-06': 'こどもの日 振替休日',
  '2024-07-15': '海の日',
  '2024-08-11': '山の日',
  '2024-08-12': '山の日 振替休日',
  '2024-09-16': '敬老の日',
  '2024-09-22': '秋分の日',
  '2024-09-23': '秋分の日 振替休日',
  '2024-10-14': 'スポーツの日',
  '2024-11-03': '文化の日',
  '2024-11-04': '文化の日 振替休日',
  '2024-11-23': '勤労感謝の日',
  '2024-12-23': '天皇誕生日',
  '2024-12-30': '年末休日',
  '2024-12-31': '年末休日',
  
  // 2025年
  '2025-01-01': '元日',
  '2025-01-13': '成人の日',
  '2025-02-11': '建国記念の日',
  '2025-02-23': '天皇誕生日',
  '2025-03-20': '春分の日',
  '2025-04-29': '昭和の日',
  '2025-05-03': '憲法記念日',
  '2025-05-04': 'みどりの日',
  '2025-05-05': 'こどもの日',
  '2025-05-06': 'こどもの日 振替休日',
  '2025-07-21': '海の日',
  '2025-08-11': '山の日',
  '2025-09-15': '敬老の日',
  '2025-09-23': '秋分の日',
  '2025-10-13': 'スポーツの日',
  '2025-11-03': '文化の日',
  '2025-11-23': '勤労感謝の日',
  '2025-11-24': '勤労感謝の日 振替休日',
  '2025-12-23': '天皇誕生日'
}

export const isHoliday = (date: string): boolean => {
  return date in HOLIDAYS
}

export const getHolidayName = (date: string): string | null => {
  return HOLIDAYS[date] || null
}
