import { Search, RotateCcw, Filter } from 'lucide-react'

const OrderFilters = ({ 
  searchTerm, setSearchTerm, 
  statusFilter, setStatusFilter,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  minAmount, setMinAmount,
  maxAmount, setMaxAmount,
  filteredCount,
  onReset
}) => {
  const hasActiveFilters = searchTerm || statusFilter || dateFrom || dateTo || minAmount || maxAmount

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 xl:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[46px] pl-12 pr-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-medium placeholder:text-gray-400"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center h-[46px] px-5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all font-bold text-[13px] group"
          >
            <RotateCcw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none text-[14px] font-bold text-gray-700"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Từ ngày</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none text-[14px] font-bold text-gray-700"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Đến ngày</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none text-[14px] font-bold text-gray-700"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Khoảng giá (VND)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none text-[14px] font-bold text-gray-700 placeholder:text-gray-300"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none text-[14px] font-bold text-gray-700 placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
          <div className="h-2 w-2 rounded-full bg-primary-600 animate-pulse"></div>
          <p className="text-[13px] font-bold text-gray-600">
            Tìm thấy <span className="text-primary-600 font-black">{filteredCount}</span> kết quả phù hợp
          </p>
        </div>
      )}
    </div>
  )
}

export default OrderFilters
