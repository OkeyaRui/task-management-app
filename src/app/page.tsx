'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar } from '@/components/calendar/Calendar'
import { TaskList } from '@/components/task/TaskList'
import { UpcomingTasks } from '@/components/task/UpcomingTasks'
import { TaskModal } from '@/components/task/TaskModal'
import { SearchFilter } from '@/components/task/SearchFilter'
import { AuthForm } from '@/components/auth/AuthForm'
import { Button } from '@/components/ui/Button'
import { LogOut, User } from 'lucide-react'
import { supabase, isSupabaseConfigured, getSupabaseConfig } from '@/lib/supabase/client'
import { getCalendarDays, getToday, addDays } from '@/lib/tz'
import { Task, CreateTaskData, UpdateTaskData, UpcomingTask } from '@/types'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [calendarDays, setCalendarDays] = useState<any[]>([])
  
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([])
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  
  // Initialize calendar
  useEffect(() => {
    const days = getCalendarDays(year, month)
    setCalendarDays(days)
  }, [year, month])
  
  const loadTasks = useCallback(async () => {
    if (!user) return
    
    try {
      // Load tasks for the selected date
      const { data: selectedDateTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('due_date', selectedDate)
        .order('start_time', { ascending: true })
      
      // Load upcoming tasks (today + 7 days)
      const today = getToday()
      const endDate = addDays(today, 7)
      
      const { data: upcomingTasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'done')
        .gte('due_date', today)
        .lte('due_date', endDate)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })
      
      setTasks(selectedDateTasks || [])
      
      // Group upcoming tasks by date
      const groupedTasks: UpcomingTask[] = []
      const taskMap = new Map<string, Task[]>()
      
      upcomingTasksData?.forEach(task => {
        if (!taskMap.has(task.due_date)) {
          taskMap.set(task.due_date, [])
        }
        taskMap.get(task.due_date)!.push(task)
      })
      
      taskMap.forEach((tasks, date) => {
        groupedTasks.push({ date, tasks })
      })
      
      setUpcomingTasks(groupedTasks)
      
      // Update calendar days with task counts
      const allTasks = upcomingTasksData || []
      const currentCalendarDays = getCalendarDays(year, month)
      const updatedCalendarDays = currentCalendarDays.map(day => ({
        ...day,
        tasks: allTasks.filter(task => task.due_date === day.date)
      }))
      setCalendarDays(updatedCalendarDays)
      
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }, [user, selectedDate])
  
  // Check auth status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadTasks()
        }
      }
    )
    
    return () => subscription.unsubscribe()
  }, [loadTasks])
  
  // Load tasks when user is authenticated
  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user, selectedDate, loadTasks])
  
  const handleAuth = async (email: string, password?: string) => {
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: password!
        })
        if (error) throw error
      } else if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password: password!
        })
        if (error) throw error
        alert('登録が完了しました。メールを確認してください。')
      } else if (authMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        alert('パスワードリセットメールを送信しました')
      }
      
      setShowAuthModal(false)
    } catch (error: any) {
      console.error('Auth error:', error)
      throw new Error(error.message || '認証に失敗しました。設定を確認してください。')
    }
  }
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTasks([])
    setUpcomingTasks([])
  }
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }
  
  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
    // 月切り替え後にタスクを再読み込み
    setTimeout(() => {
      if (user) {
        loadTasks()
      }
    }, 100)
  }
  
  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
    // 月切り替え後にタスクを再読み込み
    setTimeout(() => {
      if (user) {
        loadTasks()
      }
    }, 100)
  }
  
  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(getToday())
  }
  
  const handleTaskCreate = () => {
    setEditingTask(undefined)
    setShowTaskModal(true)
  }
  
  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }
  
  const handleTaskSave = async (data: CreateTaskData | UpdateTaskData) => {
    if (!user) return
    
    try {
      if ('id' in data) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update(data)
          .eq('id', data.id)
          .eq('user_id', user.id)
        
        if (error) throw error
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert({
            ...data,
            user_id: user.id
          })
        
        if (error) throw error
      }
      
      await loadTasks()
      setShowTaskModal(false)
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }
  
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: completed ? 'done' : 'todo' })
        .eq('id', taskId)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      await loadTasks()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }
  
  const handleTaskDelete = async (taskId: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      await loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
  
  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setPriorityFilter('')
  }
  
  // Filter tasks based on search and filter criteria
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = !statusFilter || task.status === statusFilter
    const matchesPriority = !priorityFilter || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    const supabaseConfigured = isSupabaseConfigured()
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              タスク管理アプリ
            </h1>
            <p className="text-gray-600 mb-6">
              カレンダーを主ビューとしたシンプルで見やすいタスク管理アプリです。
            </p>
            
            {!supabaseConfigured && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  ⚠️ Supabaseの設定が必要です
                </h3>
                <div className="text-xs text-red-700 text-left space-y-1">
                  <p>1. プロジェクトルートに<code className="bg-red-100 px-1 rounded">.env.local</code>ファイルを作成</p>
                  <p>2. 以下の環境変数を設定：</p>
                  <div className="bg-red-100 p-2 rounded mt-2">
                    <p>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</p>
                    <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</p>
                  </div>
                  <p>3. Dockerコンテナを再起動</p>
                </div>
                
                {/* デバッグ情報 */}
                <details className="mt-3">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    🔍 デバッグ情報を表示
                  </summary>
                  <div className="bg-red-100 p-2 rounded mt-2 text-xs">
                    <p><strong>現在の設定値:</strong></p>
                    <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '未設定'}</p>
                    <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定'}</p>
                    <p>Service Role: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '設定済み' : '未設定'}</p>
                    
                    <div className="mt-2 pt-2 border-t border-red-300">
                      <p><strong>Supabaseクライアント設定:</strong></p>
                      {(() => {
                        const config = getSupabaseConfig()
                        return (
                          <>
                            <p>URL: {config.url}</p>
                            <p>Anon Key: {config.anonKey.substring(0, 20)}...</p>
                            <p>設定済み: {config.isConfigured ? '✅' : '❌'}</p>
                            <p>URLがプレースホルダー: {config.urlIsPlaceholder ? '❌' : '✅'}</p>
                            <p>キーがプレースホルダー: {config.keyIsPlaceholder ? '❌' : '✅'}</p>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </details>
              </div>
            )}
            
            <Button 
              onClick={() => setShowAuthModal(true)}
              disabled={!supabaseConfigured}
            >
              ログイン / 新規登録
            </Button>
            
            {!supabaseConfigured && (
              <p className="text-xs text-gray-500 mt-2">
                Supabaseの設定が完了するまで使用できません
              </p>
            )}
          </div>
        </div>
        
        <AuthForm
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onModeChange={setAuthMode}
          onSubmit={handleAuth}
          isLoading={false}
        />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              タスク管理アプリ
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-1"
              >
                <LogOut size={16} />
                <span>ログアウト</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6">
          <SearchFilter
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
            onPriorityFilterChange={setPriorityFilter}
            onClearFilters={handleClearFilters}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              year={year}
              month={month}
              days={calendarDays}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />
          </div>
          
          {/* Task List */}
          <div className="lg:col-span-1">
            <TaskList
              date={selectedDate}
              tasks={filteredTasks}
              onTaskToggle={handleTaskToggle}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onTaskCreate={handleTaskCreate}
            />
          </div>
          
          {/* Upcoming Tasks */}
          <div className="lg:col-span-1">
            <UpcomingTasks
              upcomingTasks={upcomingTasks}
              onTaskToggle={handleTaskToggle}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
            />
          </div>
        </div>
      </div>
      
      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskSave}
        task={editingTask}
        selectedDate={selectedDate}
      />
    </div>
  )
}