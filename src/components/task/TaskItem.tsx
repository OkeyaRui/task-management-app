import React from 'react'
import { Task } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { getPriorityLabel, getStatusLabel, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  onToggle: (taskId: string, completed: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete
}) => {
  const [showMenu, setShowMenu] = React.useState(false)
  
  const handleToggle = () => {
    onToggle(task.id, task.status !== 'done')
  }
  
  const handleEdit = () => {
    onEdit(task)
    setShowMenu(false)
  }
  
  const handleDelete = () => {
    if (confirm('このタスクを削除しますか？')) {
      onDelete(task.id)
    }
    setShowMenu(false)
  }
  
  const formatTimeRange = () => {
    if (task.start_time && task.end_time) {
      return `${formatTime(task.start_time)}-${formatTime(task.end_time)}`
    }
    if (task.start_time) {
      return formatTime(task.start_time)
    }
    return null
  }
  
  const isCompleted = task.status === 'done'
  
  return (
    <div className={cn(
      'flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors',
      isCompleted && 'opacity-60'
    )}>
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
          isCompleted
            ? 'bg-primary-600 border-primary-600 text-white'
            : 'border-gray-300 hover:border-primary-500'
        )}
      >
        {isCompleted && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'text-sm font-medium text-gray-900 truncate',
              isCompleted && 'line-through'
            )}>
              {task.title}
            </h4>
            
            {task.description && (
              <p className={cn(
                'text-xs text-gray-500 mt-1 line-clamp-2',
                isCompleted && 'line-through'
              )}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center space-x-2 mt-2">
              {formatTimeRange() && (
                <span className="text-xs text-gray-500">
                  {formatTimeRange()}
                </span>
              )}
              
              <Badge variant={task.priority}>
                {getPriorityLabel(task.priority)}
              </Badge>
              
              <Badge variant={task.status}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          </div>
          
          {/* Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1"
            >
              <MoreHorizontal size={16} />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-primary-50 rounded-lg shadow-lg border border-primary-200 z-10">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-primary-700 hover:bg-primary-100 flex items-center space-x-2"
                >
                  <Edit size={14} />
                  <span>編集</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={14} />
                  <span>削除</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

