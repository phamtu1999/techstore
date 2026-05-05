import { Search, FileUp, FileDown, Plus, Filter, X } from 'lucide-react'
import { useState } from 'react'

const ProductFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  handleSearch, 
  handleImportExcel, 
  handleExportExcel, 
  handleAddNew,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus
}) => {
  const [showFilters, setShowFilters] = useState(false)

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(e)
    }
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedStatus('')
    setSearchTerm('')
    handleSearch()
  }

  const hasActiveFilters = selectedCategory || selectedStatus || searchTerm

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-4">
        <div className="relative flex-1 xl:max-w-xl w-full min-w-0">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-12 pl-11 pr-10 border border-border dark:border-dark-border bg-white dark:bg-dark-bg rounded-2xl focus:ring-4 focus:ring-primary-main/10 focus:border-primary-main transition-all outline-none text-sm font-medium text-text-primary dark:text-dark-text"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); handleSearch() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full xl:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center h-12 px-4 rounded-2xl border transition-all w-full sm:w-auto font-semibold ${hasActiveFilters ? 'border-primary-main bg-primary-main/5 text-primary-main' : 'border-border dark:border-dark-border bg-white dark:bg-dark-bg text-text-primary dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-card'}`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-primary-main text-white text-[11px] rounded-full">
                {[selectedCategory, selectedStatus, searchTerm].filter(Boolean).length}
              </span>
            )}
          </button>

          <label className="inline-flex cursor-pointer items-center justify-center h-12 px-4 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-text-primary dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-card transition-all w-full sm:w-auto font-semibold">
            <FileUp className="mr-2 h-4 w-4" />
            Nhập Excel
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} />
          </label>

          <button 
            onClick={handleExportExcel} 
            className="inline-flex items-center justify-center h-12 px-4 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-text-primary dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-card transition-all w-full sm:w-auto font-semibold"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Xuất Excel
          </button>

          <button 
            onClick={handleAddNew} 
            className="inline-flex items-center justify-center h-12 px-5 rounded-2xl bg-primary-main text-white font-bold shadow-lg shadow-primary-main/20 hover:opacity-95 transition-all w-full sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-dark-bg rounded-[1.5rem] p-4 sm:p-5 border border-border dark:border-dark-border animate-slide-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary dark:text-dark-text">Bộ lọc nâng cao</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-main hover:opacity-80 font-semibold"
              >
                Xóa tất cả
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-card focus:ring-4 focus:ring-primary-main/10 focus:border-primary-main outline-none text-sm text-text-primary dark:text-dark-text"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-11 px-3 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-card focus:ring-4 focus:ring-primary-main/10 focus:border-primary-main outline-none text-sm text-text-primary dark:text-dark-text"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã ẩn</option>
                <option value="outofstock">Hết hàng</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full h-11 bg-primary-main text-white rounded-2xl font-bold hover:opacity-95 transition-colors"
              >
                Áp dụng lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFilters
