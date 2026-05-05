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
  Plus,
  Minus,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import api from '../../utils/axios'
import Swal from 'sweetalert2'
import { useDebounce } from '../../hooks/useDebounce'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'
import AdminInventoryStockRow from '../../components/admin/inventory/AdminInventoryStockRow'
import AdminInventoryHistoryRow from '../../components/admin/inventory/AdminInventoryHistoryRow'

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
      console.log(`[Inventory] Fetching variants with params:`, { page, size: pagination.size, search: debouncedSearch, filter: stockFilter })
      const response = await api.get(`/admin/inventory/variants`, {
        params: {
          page,
          size: pagination.size,
          search: debouncedSearch,
          filter: stockFilter
        }
      })
      
      console.log(`[Inventory] Raw response from BFF:`, response.data)
      const { content, totalPages, totalElements, number } = extractPaginatedPayload(response.data)

      console.log(`[Inventory] Extracted data:`, { contentSize: content?.length, totalElements, totalPages })
      
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
            <select id="swal-type" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500">
              <option value="IMPORT">Nhập thêm hàng (+)</option>
              <option value="ADJUSTMENT">Cập nhật số lượng thực tế (=)</option>
              <option value="DAMAGED">Hủy hàng / Hỏng (-)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Số lượng</label>
            <input id="swal-quantity" type="number" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500" placeholder="VD: 50">
          </div>
          ${isFinanceVisible ? `
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Giá vốn mới (Omit if no change)</label>
            <input id="swal-cost" type="number" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500" placeholder="VD: 15000000">
          </div>
          ` : ''}
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Ghi chú</label>
            <textarea id="swal-note" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500" placeholder="Lý do thay đổi kho..."></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật ngay',
      cancelButtonText: 'Hủy bỏ',
      customClass: {
        confirmButton: 'bg-primary-MAIN hover:bg-primary-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary-500/30',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-8 py-3 rounded-xl'
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

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500 pb-12 sm:pb-16">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Inventory
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-dark-text tracking-tight">
            Kho <span className="text-primary-main">hàng</span>
          </h2>
          <p className="text-sm sm:text-base font-medium text-text-secondary dark:text-gray-400 mt-2 leading-relaxed">
            Theo dõi tồn kho, biến động và giá trị hàng hóa theo thời gian thực.
          </p>
        </div>
      </div>
      {/* Header Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {isFinanceVisible && (
          <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center gap-5 group hover:shadow-xl hover:shadow-primary-500/5 transition-all">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-8 w-8 text-primary-MAIN" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tổng giá trị kho</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{formatCurrency(summary.totalValue)}</h3>
            </div>
          </div>
        )}
        <div 
          onClick={toggleLowStockFilter}
          className={`bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border flex items-center gap-5 group hover:shadow-xl transition-all cursor-pointer ${stockFilter === 'low-stock' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-100 dark:border-dark-border hover:shadow-red-500/5'}`}
        >
          <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${stockFilter === 'low-stock' ? 'bg-red-500 text-white' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sắp hết hàng</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{summary.lowStockCount} sản phẩm</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center gap-5 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <Package className="h-8 w-8 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tổng mã SKU (trang này)</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{pagination.totalElements} mã hàng</h3>
          </div>
        </div>
      </div>

      <div className="bg-gray-100/50 dark:bg-white/5 p-1.5 rounded-2xl flex gap-1.5 w-fit">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'stock' ? 'bg-white dark:bg-dark-card text-primary-MAIN shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <Package className="h-4 w-4" />
          Quản lý tồn kho
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-dark-card text-primary-MAIN shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <History className="h-4 w-4" />
          Nhật ký biến động
        </button>
      </div>

      {activeTab === 'stock' ? (
        <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
          <div className="p-8 border-b border-gray-50 dark:border-dark-border flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Tìm theo SKU hoặc tên..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
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
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Hiển thị {variants.length} / {pagination.totalElements} mã hàng
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-white/5">
                <tr>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-primary-600 bg-primary-50/30 w-16">STT</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Sản phẩm & Biến thể</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Tồn kho</th>
                  {isFinanceVisible && <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Tài chính</th>}
                  {isFinanceVisible && <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Biên LN</th>}
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-bold italic">
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
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
              <div className="p-8 border-t border-gray-100 dark:border-dark-border flex items-center justify-between bg-gray-50/20">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Trang <span className="text-primary-600">{pagination.page + 1}</span> / {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                      <button 
                          onClick={() => setPagination(prev => ({...prev, page: Math.max(0, prev.page - 1)}))}
                          disabled={pagination.page === 0}
                          className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border bg-white disabled:opacity-20 hover:shadow-md transition-all"
                      >
                          <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button 
                          onClick={() => setPagination(prev => ({...prev, page: Math.min(prev.totalPages - 1, prev.page + 1)}))}
                          disabled={pagination.page === pagination.totalPages - 1}
                          className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border bg-white disabled:opacity-20 hover:shadow-md transition-all"
                      >
                          <ChevronRight className="h-5 w-5" />
                      </button>
                  </div>
              </div>
          )}
        </div>
      ) : (
        /* History View */
        <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
          <div className="p-8 border-b border-gray-50 dark:border-dark-border flex flex-col md:flex-row justify-between items-center gap-4">
             <h3 className="text-lg font-black text-gray-900 dark:text-white">Lịch sử biến động 25 gần nhất</h3>
             {/* Simple history search */}
             <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Lọc lịch sử (SKU, loại...)"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => {
                    const term = e.target.value.toLowerCase();
                    setHistory(prev => {
                        // This is a bit hacky since it filters local state but we'll fetch full anyway if they tab back
                        return prev; 
                    });
                  }}
                />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-white/5">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-12">STT</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Thời gian</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Loại / SKU</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Số lượng</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Dư sau</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
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
