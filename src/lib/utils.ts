import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, format = 'YYYY/MM/DD'): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'badge-high'
    case 'medium':
      return 'badge-medium'
    case 'low':
      return 'badge-low'
    default:
      return 'badge-medium'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'todo':
      return 'badge-todo'
    case 'in_progress':
      return 'badge-in-progress'
    case 'done':
      return 'badge-done'
    default:
      return 'badge-todo'
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'high':
      return '高'
    case 'medium':
      return '中'
    case 'low':
      return '低'
    default:
      return '中'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'todo':
      return '未着手'
    case 'in_progress':
      return '進行中'
    case 'done':
      return '完了'
    default:
      return '未着手'
  }
}
