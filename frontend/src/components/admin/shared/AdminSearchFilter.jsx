import React from 'react'
import { Search } from 'lucide-react'

const AdminSearchFilter = ({ 
  onSearch, 
  placeholder = "Tìm kiếm...", 
  rightContent 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="relative flex-1 max-w-2xl w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full h-11 pl-11 pr-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-[14px] font-medium outline-none shadow-sm"
          placeholder={placeholder}
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        {rightContent}
      </div>
    </div>
  )
}

export default AdminSearchFilter
