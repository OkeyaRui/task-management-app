import React from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Search, X } from 'lucide-react'

interface SearchFilterProps {
  searchQuery: string
  statusFilter: string
  priorityFilter: string
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: string) => void
  onPriorityFilterChange: (priority: string) => void
  onClearFilters: () => void
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onClearFilters
}) => {
  const statusOptions = [
    { value: '', label: 'すべてのステータス' },
    { value: 'todo', label: '未着手' },
    { value: 'in_progress', label: '進行中' },
    { value: 'done', label: '完了' }
  ]
  
  const priorityOptions = [
    { value: '', label: 'すべての優先度' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' }
  ]
  
  const hasActiveFilters = searchQuery || statusFilter || priorityFilter
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="タスクを検索..."
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <Select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              options={statusOptions}
            />
          </div>
          
          {/* Priority Filter */}
          <div className="w-full sm:w-40">
            <Select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              options={priorityOptions}
            />
          </div>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center justify-center space-x-1 w-full sm:w-auto"
            >
              <X size={16} />
              <span>クリア</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
