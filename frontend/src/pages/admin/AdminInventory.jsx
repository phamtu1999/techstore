import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  Package, 
  History, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter,
  ArrowRightLeft,
  X
} from 'lucide-react'
import api from '../../utils/axios'
import Swal from 'sweetalert2'
import { useDebounce } from '../../hooks/useDebounce'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'
import AdminInventoryStockRow from '../../components/admin/inventory/AdminInventoryStockRow'
import AdminInventoryHistoryRow from '../../components/admin/inventory/AdminInventoryHistoryRow'
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader'
import AdminPagination from '../../components/admin/shared/AdminPagination'
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard'

const extractPaginatedPayload = (payload) => {
  const visited = new Set()
  const queue = [payload]

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current || typeof current !== 'object' || visited.has(current)) {
      continue
    }

    visited.add(current)

    if (Array.isArray(current)) {
      return {
        content: current,
        totalPages: 1,
        totalElements: current.length,
        number: 0
      }
    }

    if (Array.isArray(current.content)) {
      return {
        content: current.content,
        totalPages: current.totalPages ?? current.page?.totalPages ?? 1,
        totalElements: current.totalElements ?? current.content.length,
        number: current.number ?? current.pageNumber ?? 0
      }
    }

    queue.push(current.result, current.data, current.page)
  }

  return {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0
  }
}

const AdminInventory = () => {
  const { user } = useSelector((state) => state.auth)
  const userRole = user?.role
  const isFinanceVisible = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN'

  const [activeTab, setActiveTab] = useState('stock') // 'stock' or 'history'
  const [loading, setLoading] = useState(true)
  const [variants, setVariants] = useState([])
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState({
    totalValue: 0,
    lowStockCount: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('') // '' or 'low-stock'
  const [selectedIds, setSelectedIds] = useState([])
  const debouncedSearch = useDebounce(searchTerm, 500)
  const currencyFormatter = useMemo(() => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }), [])
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  })

  useEffect(() => {
    fetchMainStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStock(pagination.page)
    } else {
      fetchHistory()
    }
  }, [activeTab, debouncedSearch, pagination.page, stockFilter])

  const fetchMainStats = useCallback(async () => {
    try {
       const [lowStockRes, valuationRes] = await Promise.all([
        api.get('/admin/inventory/low-stock'),
        isFinanceVisible ? api.get('/admin/inventory/valuation') : Promise.resolve({ data: { result: 0 } })
      ])
      setSummary({
        lowStockCount: lowStockRes.data.result?.length || 0,
        totalValue: valuationRes.data.result || 0
      })
    } catch (error) {
      console.error(getApiErrorMessage(error))
    }
  }, [isFinanceVisible])

  const fetchStock = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const response = await api.get(`/admin/inventory/variants`, {
        params: {
          page,
          size: pagination.size,
          search: debouncedSearch,
          filter: stockFilter
        }
      })
      
      const { content, totalPages, totalElements, number } = extractPaginatedPayload(response.data)
      
      setVariants(content || [])
      setPagination(prev => ({
        ...prev,
        totalPages: totalPages || 0,
        totalElements: totalElements || 0,
        page: number || 0
      }))
    } catch (error) {
      console.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, pagination.size, stockFilter])

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/inventory/history?size=25')
      setHistory(response.data.result?.content || [])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAdjustStock = useCallback(async (variant) => {
    const { value: formValues } = await Swal.fire({
      title: 'Điều chỉnh kho hàng',
      html: `
        <div class="text-left mb-4">
          <p class="text-sm font-bold text-gray-600">Sản phẩm: ${variant.productName}</p>
          <p class="text-xs text-gray-400">Biến thể: ${variant.variantName} (${variant.sku})</p>
        </div>
        <div class="space-y-4">
           <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Loại giao dịch</label>
            <select id="swal-type" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-600">
              <option value="IMPORT">Nhập thêm hàng (+)</option>
              <option value="ADJUSTMENT">Cập nhật số lượng thực tế (=)</option>
              <option value="DAMAGED">Hủy hàng / Hỏng (-)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Số lượng</label>
            <input id="swal-quantity" type="number" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-600" placeholder="VD: 50">
          </div>
          ${isFinanceVisible ? `
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Giá vốn mới (Bỏ trống nếu không đổi)</label>
            <input id="swal-cost" type="number" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-600" placeholder="VD: 15000000">
          </div>
          ` : ''}
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Ghi chú</label>
            <textarea id="swal-note" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-600" placeholder="Lý do thay đổi kho..."></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật ngay',
      cancelButtonText: 'Hủy bỏ',
      customClass: {
        confirmButton: 'bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary-600/20 transition-all',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-8 py-3 rounded-xl transition-all'
      },
      buttonsStyling: false,
      preConfirm: () => {
        return {
          type: document.getElementById('swal-type').value,
          quantity: parseInt(document.getElementById('swal-quantity').value),
          costPrice: isFinanceVisible ? document.getElementById('swal-cost').value : null,
          note: document.getElementById('swal-note').value
        }
      }
    })

    if (formValues) {
      try {
        await api.post('/admin/inventory/transaction', {
          variantId: variant.id,
          type: formValues.type,
          quantity: formValues.quantity,
          costPrice: formValues.costPrice || null,
          note: formValues.note,
          warehouse: 'Kho Chính'
        })
        fireSuccess('Thành công', 'Kho hàng đã được cập nhật!')
        fetchStock(pagination.page)
      } catch (error) {
        fireError(error, 'Không thể cập nhật kho')
      }
    }
  }, [isFinanceVisible, pagination.page, fetchStock])

  const formatCurrency = useCallback((amount) => currencyFormatter.format(amount || 0), [currencyFormatter])

  const toggleLowStockFilter = useCallback(() => {
    setStockFilter(prev => prev === 'low-stock' ? '' : 'low-stock')
    setPagination(p => ({ ...p, page: 0 }))
  }, [])

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
    setPagination(p => ({ ...p, page: 0 }))
  }, [])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(variants.map(v => v.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const bulkActionBar = selectedIds.length > 0 && (
    <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-2 shadow-lg animate-scale-up mr-4">
      <span className="text-[13px] font-bold">
        Đã chọn <span className="text-primary-500 font-black">{selectedIds.length}</span>
      </span>
      <div className="w-[1px] h-4 bg-gray-700"></div>
      <button 
        onClick={async () => {
          const res = await Swal.fire({
            title: 'Nhập hàng hàng loạt?',
            text: `Bạn muốn nhập thêm hàng cho ${selectedIds.length} mã đã chọn?`,
            input: 'number',
            inputPlaceholder: 'Số lượng nhập mỗi mã...',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
          })
          if (res.isConfirmed && res.value) {
            try {
              await Promise.all(selectedIds.map(id => api.post('/admin/inventory/transaction', {
                variantId: id,
                type: 'IMPORT',
                quantity: parseInt(res.value),
                note: 'Nhập hàng hàng loạt từ bảng quản trị',
                warehouse: 'Kho Chính'
              })))
              fireSuccess('Thành công', 'Đã cập nhật kho cho các mã đã chọn')
              setSelectedIds([])
              fetchStock(pagination.page)
            } catch (err) { fireError(err, 'Lỗi khi nhập hàng hàng loạt') }
          }
        }}
        className="text-[13px] font-bold hover:text-primary-400 transition-colors"
      >
        Nhập nhanh
      </button>
      <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader 
        title="Quản lý" 
        accentTitle="Kho hàng"
        subtitle="Theo dõi tồn kho, biến động và giá trị hàng hóa theo thời gian thực."
        rightContent={bulkActionBar}
      />

      {/* Header Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isFinanceVisible && (
          <AdminStatsCard 
            title="Tổng giá trị kho"
            value={formatCurrency(summary.totalValue)}
            icon={TrendingUp}
            type="orange"
          />
        )}
        <div onClick={toggleLowStockFilter} className="cursor-pointer">
          <AdminStatsCard 
            title="Sắp hết hàng"
            value={`${summary.lowStockCount} sản phẩm`}
            icon={AlertTriangle}
            type={stockFilter === 'low-stock' ? 'orange' : 'success'}
          />
        </div>
        <AdminStatsCard 
          title="Tổng mã SKU"
          value={`${pagination.totalElements} mã hàng`}
          icon={Package}
          type="blue"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white/50 p-1.5 rounded-2xl flex gap-2 w-fit border border-gray-100 shadow-sm">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'stock' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Package className="h-4 w-4" />
          QUẢN LÝ TỒN KHO
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'history' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <History className="h-4 w-4" />
          NHẬT KÝ BIẾN ĐỘNG
        </button>
      </div>

      {activeTab === 'stock' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Tìm theo SKU hoặc tên..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
                />
             </div>
             <div className="flex items-center gap-3 w-full md:w-auto">
                {stockFilter && (
                  <button 
                    onClick={() => setStockFilter('')}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-red-100 transition-colors"
                  >
                    Bỏ lọc: Sắp hết <Filter className="h-3 w-3" />
                  </button>
                )}
                <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Hiển thị {variants.length} / {pagination.totalElements} mã hàng
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 w-10 text-left">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      checked={selectedIds.length > 0 && selectedIds.length === variants.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-primary-600 w-16">STT</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Sản phẩm & Biến thể</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Tồn kho</th>
                  {isFinanceVisible && <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Tài chính</th>}
                  {isFinanceVisible && <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Biên LN</th>}
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan={isFinanceVisible ? 6 : 4} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                       Không tìm thấy kết quả phù hợp
                    </td>
                  </tr>
                ) : variants.map((v, index) => (
                  <AdminInventoryStockRow
                    key={v.id}
                    variant={v}
                    index={index}
                    pagination={pagination}
                    isFinanceVisible={isFinanceVisible}
                    formatCurrency={formatCurrency}
                    onAdjustStock={handleAdjustStock}
                    isSelected={selectedIds.includes(v.id)}
                    onSelect={() => handleSelectOne(v.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {!loading && pagination.totalPages > 1 && (
              <AdminPagination 
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPagination(prev => ({...prev, page: p}))}
              />
          )}
        </div>
      ) : (
        /* History View */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
               <h3 className="text-[18px] font-bold text-gray-900">Lịch sử biến động</h3>
               <p className="text-[13px] text-gray-500 font-medium">25 bản ghi gần nhất</p>
             </div>
             
             <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Lọc lịch sử (SKU, loại...)"
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
                />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 w-12">STT</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Thời gian</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Loại / SKU</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Số lượng</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Dư sau</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((log, index) => (
                  <AdminInventoryHistoryRow key={log.id} log={log} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInventory
