import { Search } from 'lucide-react'

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
  return (
    <div className="bg-white dark:bg-dark-card rounded-[1.5rem] p-4 sm:p-6 border border-border dark:border-dark-border shadow-sm">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-text-primary dark:text-dark-text focus:ring-4 focus:ring-primary-main/10 focus:border-primary-main outline-none text-sm font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full"
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="input w-full"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        {(searchTerm || statusFilter || dateFrom || dateTo || minAmount || maxAmount) && (
          <div className="flex justify-between items-center pt-2 border-t">
            <p className="text-sm text-gray-600">
              Tìm thấy <span className="font-bold">{filteredCount}</span> đơn hàng
            </p>
            <button
              onClick={onReset}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderFilters
