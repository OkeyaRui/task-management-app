import React, { useState, useEffect } from 'react'
import { Task, CreateTaskData, UpdateTaskData } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { TaskSchema } from '@/lib/validators'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateTaskData | UpdateTaskData) => Promise<void>
  task?: Task
  selectedDate?: string
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  selectedDate
}) => {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    due_date: selectedDate || new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    status: 'todo',
    priority: 'medium'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date,
        start_time: task.start_time || '',
        end_time: task.end_time || '',
        status: task.status,
        priority: task.priority
      })
    } else {
      setFormData({
        title: '',
        description: '',
        due_date: selectedDate || new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        status: 'todo',
        priority: 'medium'
      })
    }
    setErrors({})
  }, [task, selectedDate, isOpen])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    
    try {
      const validatedData = TaskSchema.parse(formData)
      await onSave(task ? { ...validatedData, id: task.id } : validatedData)
      onClose()
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleChange = (field: keyof CreateTaskData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  const statusOptions = [
    { value: 'todo', label: '未着手' },
    { value: 'in_progress', label: '進行中' },
    { value: 'done', label: '完了' }
  ]
  
  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' }
  ]
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'タスクを編集' : '新しいタスク'}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="タイトル *"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="タスクのタイトルを入力"
        />
        
        <Textarea
          label="説明"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="タスクの詳細を入力（任意）"
          rows={3}
        />
        
        <Input
          label="期日 *"
          type="date"
          value={formData.due_date}
          onChange={(e) => handleChange('due_date', e.target.value)}
          error={errors.due_date}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="開始時刻"
            type="time"
            value={formData.start_time}
            onChange={(e) => handleChange('start_time', e.target.value)}
            error={errors.start_time}
          />
          
          <Input
            label="終了時刻"
            type="time"
            value={formData.end_time}
            onChange={(e) => handleChange('end_time', e.target.value)}
            error={errors.end_time}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="優先度"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            options={priorityOptions}
            error={errors.priority}
          />
          
          <Select
            label="ステータス"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
            error={errors.status}
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
