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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/30">
      <div className="flex items-center gap-4">
        <p className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
          Trang <span className="font-bold text-gray-900">{currentPage + 1}</span> trên <span className="font-bold text-gray-900">{totalPages}</span>
        </p>
        
        <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-4">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hiển thị</span>
          <select 
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="bg-transparent text-[13px] font-bold text-gray-900 outline-none cursor-pointer hover:text-primary-600 transition-colors"
          >
            <option value={10}>10 dòng</option>
            <option value={20}>20 dòng</option>
            <option value={50}>50 dòng</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-primary-600 hover:border-primary-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-90"
          title="Trang trước"
        >
          <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
             // Logic to show pages around current page
             let pageNum = i;
             if (totalPages > 5) {
                if (currentPage > 2) pageNum = Math.min(currentPage - 2 + i, totalPages - 5 + i);
             }
             
             return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[36px] h-9 rounded-xl text-[13px] font-bold transition-all active:scale-90 ${
                  currentPage === pageNum
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-600 hover:text-primary-600'
                }`}
              >
                {pageNum + 1}
              </button>
             )
          })}
          
          {totalPages > 5 && currentPage < totalPages - 3 && (
            <>
              <span className="px-1 text-gray-400">...</span>
              <button
                onClick={() => onPageChange(totalPages - 1)}
                className="min-w-[36px] h-9 rounded-xl text-[13px] font-bold bg-white border border-gray-200 text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-all active:scale-90"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-primary-600 hover:border-primary-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-90"
          title="Trang sau"
        >
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}

export default AdminPagination
