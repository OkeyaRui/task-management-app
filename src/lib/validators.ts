import { z } from 'zod'

export const TaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(120, 'タイトルは120文字以内で入力してください'),
  description: z.string().max(2000, '説明は2000文字以内で入力してください').optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, '時刻の形式が正しくありません').optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, '時刻の形式が正しくありません').optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return data.start_time <= data.end_time
    }
    return true
  },
  {
    message: '終了時刻は開始時刻以降にしてください',
    path: ['end_time'],
  }
)

export const UpdateTaskSchema = z.object({
  id: z.string().uuid('IDの形式が正しくありません'),
  title: z.string().min(1, 'タイトルは必須です').max(120, 'タイトルは120文字以内で入力してください').optional(),
  description: z.string().max(2000, '説明は2000文字以内で入力してください').optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません').optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, '時刻の形式が正しくありません').optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, '時刻の形式が正しくありません').optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return data.start_time <= data.end_time
    }
    return true
  },
  {
    message: '終了時刻は開始時刻以降にしてください',
    path: ['end_time'],
  }
)

export type TaskFormData = z.infer<typeof TaskSchema>
export type UpdateTaskFormData = z.infer<typeof UpdateTaskSchema>
