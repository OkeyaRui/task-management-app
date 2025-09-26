import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface AuthFormProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register' | 'reset'
  onModeChange: (mode: 'login' | 'register' | 'reset') => void
  onSubmit: (email: string, password?: string) => Promise<void>
  isLoading: boolean
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
  onSubmit,
  isLoading
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    if (mode === 'register' && password !== confirmPassword) {
      setErrors({ confirmPassword: 'パスワードが一致しません' })
      return
    }
    
    if (mode !== 'reset' && !password) {
      setErrors({ password: 'パスワードを入力してください' })
      return
    }
    
    try {
      await onSubmit(email, mode === 'reset' ? undefined : password)
    } catch (error: any) {
      setErrors({ general: error.message })
    }
  }
  
  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'ログイン'
      case 'register':
        return '新規登録'
      case 'reset':
        return 'パスワードリセット'
      default:
        return '認証'
    }
  }
  
  const getSubmitText = () => {
    switch (mode) {
      case 'login':
        return 'ログイン'
      case 'register':
        return '登録'
      case 'reset':
        return 'リセットメール送信'
      default:
        return '送信'
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}
        
        <Input
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="your@email.com"
          required
        />
        
        {mode !== 'reset' && (
          <Input
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="パスワードを入力"
            required
          />
        )}
        
        {mode === 'register' && (
          <Input
            label="パスワード確認"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="パスワードを再入力"
            required
          />
        )}
        
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
            {isLoading ? '処理中...' : getSubmitText()}
          </Button>
        </div>
        
        <div className="text-center space-y-2 pt-4 border-t border-gray-200">
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => onModeChange('register')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                アカウントをお持ちでない方はこちら
              </button>
              <br />
              <button
                type="button"
                onClick={() => onModeChange('reset')}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                パスワードを忘れた方はこちら
              </button>
            </>
          )}
          
          {mode === 'register' && (
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              すでにアカウントをお持ちの方はこちら
            </button>
          )}
          
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              ログインに戻る
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
