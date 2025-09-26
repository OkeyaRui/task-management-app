import React from 'react'
import { Task } from '@/types'
import { TaskItem } from './TaskItem'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface TaskListProps {
  date: string
  tasks: Task[]
  onTaskToggle: (taskId: string, completed: boolean) => void
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskCreate: () => void
}

export const TaskList: React.FC<TaskListProps> = ({
  date,
  tasks,
  onTaskToggle,
  onTaskEdit,
  onTaskDelete,
  onTaskCreate
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDay = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
    
    return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}（${weekDay}）`
  }
  
  const sortedTasks = tasks.sort((a, b) => {
    // 時間順 → 優先度順 → 作成日時順
    if (a.start_time && b.start_time) {
      return a.start_time.localeCompare(b.start_time)
    }
    if (a.start_time && !b.start_time) return -1
    if (!a.start_time && b.start_time) return 1
    
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {formatDate(date)}
        </h3>
        <Button
          onClick={onTaskCreate}
          size="sm"
          className="flex items-center space-x-1"
        >
          <Plus size={16} />
          <span>タスク</span>
        </Button>
      </div>
      
      {/* Task List */}
      <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Plus size={32} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">
              この日にタスクはありません
            </p>
            <Button
              onClick={onTaskCreate}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              タスクを追加
            </Button>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onTaskToggle}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
