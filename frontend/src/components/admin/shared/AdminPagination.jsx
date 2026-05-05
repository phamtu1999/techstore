import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const AdminPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i)

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
      <p className="text-[13px] text-gray-500 font-medium">
        Trang <span className="font-bold text-gray-900">{currentPage + 1}</span> trên <span className="font-bold text-gray-900">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-primary-600 hover:border-primary-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 rounded-lg text-[13px] font-bold transition-all ${
                currentPage === page
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-600 hover:text-primary-600'
              }`}
            >
              {page + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-primary-600 hover:border-primary-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default AdminPagination
