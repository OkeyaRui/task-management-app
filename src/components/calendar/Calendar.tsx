import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CalendarDay } from '@/types'
import { getDayOfMonthJST, isHoliday, getHolidayName } from '@/lib/tz'

interface CalendarProps {
  year: number
  month: number
  days: CalendarDay[]
  selectedDate?: string
  onDateSelect: (date: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export const Calendar: React.FC<CalendarProps> = ({
  year,
  month,
  days,
  selectedDate,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onToday
}) => {
  const weekDays = ['日', '月', '火', '水', '木', '金', '土']
  
  const formatMonthYear = (year: number, month: number) => {
    return `${year}年${month}月`
  }
  
  const getTaskCount = (day: CalendarDay) => {
    return day.tasks.length
  }
  
  const getTopTasks = (day: CalendarDay, limit = 3) => {
    return day.tasks
      .sort((a, b) => {
        // 優先度順（high > medium > low）
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, limit)
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {formatMonthYear(year, month)}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreviousMonth}
            className="p-2"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="text-sm"
          >
            今日
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNextMonth}
            className="p-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      
      {/* Week Days */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isSelected = selectedDate === day.date
          const taskCount = getTaskCount(day)
          const topTasks = getTopTasks(day)
          const isHolidayDate = isHoliday(day.date)
          const holidayName = getHolidayName(day.date)
          
          // 曜日判定（0=日曜日, 1=月曜日, ..., 6=土曜日）
          const dayOfWeek = new Date(day.date).getDay()
          const isSunday = dayOfWeek === 0
          const isSaturday = dayOfWeek === 6
          
          return (
            <button
              key={day.date}
              onClick={() => onDateSelect(day.date)}
              className={cn(
                'p-2 sm:p-3 text-left border-r border-b border-gray-200 hover:bg-gray-50 transition-colors min-h-[80px] sm:min-h-[100px]',
                !day.isCurrentMonth && 'text-gray-400 bg-gray-50',
                // 今日の強調表示（四角い枠）
                day.isToday && 'ring-2 ring-primary-500 ring-offset-1',
                // 日曜日または祝日の背景色
                (isSunday || isHolidayDate) && 'bg-red-50',
                // 土曜日の背景色
                isSaturday && !isHolidayDate && 'bg-primary-100',
                // 選択された日
                isSelected && 'bg-primary-100 border-primary-300',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  'text-xs sm:text-sm font-medium',
                  day.isToday && 'text-primary-600 font-bold',
                  !day.isCurrentMonth && 'text-gray-400',
                  isHolidayDate && 'text-red-600 font-bold'
                )}>
                  {getDayOfMonthJST(day.date)}
                </span>
                {taskCount > 0 && (
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {taskCount}件
                  </span>
                )}
              </div>
              
              {/* Holiday name */}
              {isHolidayDate && holidayName && (
                <div className="text-xs text-red-600 font-medium mb-1 truncate">
                  {holidayName}
                </div>
              )}
              
              {/* Task indicators */}
              {topTasks.length > 0 && (
                <div className="space-y-1">
                  {topTasks.slice(0, 2).map((task, index) => (
                    <div
                      key={index}
                      className={cn(
                        'text-xs px-1 py-0.5 rounded truncate',
                        task.priority === 'high' && 'bg-red-100 text-red-800',
                        task.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
                        task.priority === 'low' && 'bg-green-100 text-green-800'
                      )}
                    >
                      {task.title}
                    </div>
                  ))}
                  {taskCount > 2 && (
                    <div className="text-xs text-gray-500">
                      +{taskCount - 2}件
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
