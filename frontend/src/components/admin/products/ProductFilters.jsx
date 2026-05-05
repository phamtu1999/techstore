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
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 xl:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, SKU hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-[46px] pl-12 pr-10 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-medium placeholder:text-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); handleSearch() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center h-[46px] px-5 rounded-xl border font-bold text-[13px] transition-all ${hasActiveFilters ? 'border-primary-600 bg-primary-600/5 text-primary-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="ml-2 w-5 h-5 flex items-center justify-center bg-primary-600 text-white text-[10px] rounded-full">
                {[selectedCategory, selectedStatus, searchTerm].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

          <label className="inline-flex cursor-pointer items-center h-[46px] px-4 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all font-bold text-[13px]">
            <FileUp className="mr-2 h-4 w-4" />
            Nhập Excel
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} />
          </label>

          <button 
            onClick={handleExportExcel} 
            className="inline-flex items-center h-[46px] px-4 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all font-bold text-[13px]"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Xuất file
          </button>

          <button 
            onClick={handleAddNew} 
            className="inline-flex items-center h-[46px] px-5 rounded-xl bg-primary-600 text-white font-bold text-[13px] shadow-sm shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 animate-slide-in-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Lọc nâng cao</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[13px] text-primary-600 hover:underline font-bold"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none text-[14px] font-bold text-gray-700"
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
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none text-[14px] font-bold text-gray-700"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã ẩn</option>
                <option value="outofstock">Hết hàng</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sắp xếp</label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none text-[14px] font-bold text-gray-700"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full h-11 bg-gray-900 text-white rounded-xl font-bold text-[13px] hover:bg-gray-800 transition-colors active:scale-95"
              >
                ÁP DỤNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFilters
