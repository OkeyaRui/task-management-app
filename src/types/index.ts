export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  due_date: string
  start_time?: string
  end_time?: string
  status: TaskStatus
  priority: TaskPriority
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  display_name?: string
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  title: string
  description?: string
  due_date: string
  start_time?: string
  end_time?: string
  status?: TaskStatus
  priority?: TaskPriority
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
}

export interface CalendarDay {
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

export interface UpcomingTask {
  date: string
  tasks: Task[]
}
