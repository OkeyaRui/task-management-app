import React from 'react'
import { UpcomingTask } from '@/types'
import { TaskItem } from './TaskItem'
import { Badge } from '@/components/ui/Badge'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface UpcomingTasksProps {
  upcomingTasks: UpcomingTask[]
  onTaskToggle: (taskId: string, completed: boolean) => void
  onTaskEdit: (task: any) => void
  onTaskDelete: (taskId: string) => void
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({
  upcomingTasks,
  onTaskToggle,
  onTaskEdit,
  onTaskDelete
}) => {
  const [expandedDates, setExpandedDates] = React.useState<Set<string>>(new Set())
  
  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(date)) {
        newSet.delete(date)
      } else {
        newSet.add(date)
      }
      return newSet
    })
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()
    
    if (isToday) return '今日'
    if (isTomorrow) return '明日'
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDay = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
    
    return `${month}/${day}（${weekDay}）`
  }
  
  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '明日'
    if (diffDays > 1 && diffDays <= 7) return `${diffDays}日後`
    
    return formatDate(dateString)
  }
  
  if (upcomingTasks.length === 0) {
    return (
      <div className="bg-primary-50 rounded-lg shadow-sm border border-primary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-800 mb-4">
          直近のタスク
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            直近7日以内のタスクはありません
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-primary-50 rounded-lg shadow-sm border border-primary-200">
      <div className="p-4 border-b border-primary-200">
        <h3 className="text-lg font-semibold text-primary-800">
          直近のタスク
        </h3>
        <p className="text-sm text-primary-600 mt-1">
          今日から7日以内の未完了タスク
        </p>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {upcomingTasks.map(({ date, tasks }) => {
          const isExpanded = expandedDates.has(date)
          const dateLabel = getDateLabel(date)
          
          return (
            <div key={date} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => toggleDate(date)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{dateLabel}</span>
                  <Badge variant="default">{tasks.length}件</Badge>
                </div>
                {isExpanded ? (
                  <ChevronDown size={16} className="text-gray-400" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-3 space-y-2">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={onTaskToggle}
                      onEdit={onTaskEdit}
                      onDelete={onTaskDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
