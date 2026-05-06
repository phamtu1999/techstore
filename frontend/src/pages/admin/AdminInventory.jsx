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
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader'
import AdminPagination from '../../components/admin/shared/AdminPagination'
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard'
import AdminTable from '../../components/admin/AdminTable'

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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {isFinanceVisible ? (
          <>
            <div className="col-span-2 md:col-span-1">
              <AdminStatsCard 
                title="Tổng giá trị kho"
                value={formatCurrency(summary.totalValue)}
                icon={TrendingUp}
                type="orange"
              />
            </div>
            <div onClick={toggleLowStockFilter} className="cursor-pointer">
              <AdminStatsCard 
                title="Sắp hết hàng"
                value={`${summary.lowStockCount} mã`}
                icon={AlertTriangle}
                type={stockFilter === 'low-stock' ? 'orange' : 'success'}
              />
            </div>
          </>
        ) : (
          <div onClick={toggleLowStockFilter} className="col-span-1 cursor-pointer">
            <AdminStatsCard 
              title="Sắp hết hàng"
              value={`${summary.lowStockCount} mã`}
              icon={AlertTriangle}
              type={stockFilter === 'low-stock' ? 'orange' : 'success'}
            />
          </div>
        )}
        <AdminStatsCard 
          title="Tổng SKU"
          value={`${pagination.totalElements} mã`}
          icon={Package}
          type="blue"
        />
      </div>

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

          <AdminTable 
            columns={[
              {
                key: 'product',
                label: 'Sản phẩm & Biến thể',
                render: (_, row) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-gray-900 text-[14px] line-clamp-1">{row.productName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-gray-500">{row.variantName}</span>
                      <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-gray-400 uppercase tracking-tighter">{row.sku}</span>
                    </div>
                  </div>
                )
              },
              {
                key: 'stock',
                label: 'Tồn kho',
                render: (_, row) => (
                  <div className="flex flex-col">
                    <span className={`text-[15px] font-black ${row.stockQuantity <= row.lowStockThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                      {row.stockQuantity}
                    </span>
                    {row.stockQuantity <= row.lowStockThreshold && (
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Sắp hết hàng</span>
                    )}
                  </div>
                )
              },
              ...(isFinanceVisible ? [
                {
                  key: 'finance',
                  label: 'Tài chính',
                  render: (_, row) => (
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-emerald-600">{formatCurrency(row.costPrice)}</span>
                      <span className="text-[11px] font-medium text-gray-400">{formatCurrency(row.price)}</span>
                    </div>
                  )
                },
                {
                  key: 'margin',
                  label: 'Biên LN',
                  align: 'center',
                  render: (_, row) => {
                    const margin = row.price > 0 ? ((row.price - row.costPrice) / row.price * 100).toFixed(1) : 0;
                    return (
                      <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[11px] font-black">
                        {margin}%
                      </div>
                    )
                  }
                }
              ] : [])
            ]}
            data={variants}
            isLoading={loading}
            selectedRows={selectedIds}
            onSelectRow={(row) => handleSelectOne(row.id)}
            onSelectAll={(all) => {
              if (all) setSelectedIds(variants.map(v => v.id))
              else setSelectedIds([])
            }}
            showIndex={true}
            itemTitle="biến thể"
            renderMobileCard={(row, index, renderActions) => (
              <div key={row.id || index} className="p-2.5 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-black text-gray-900 dark:text-white tracking-tight leading-tight line-clamp-1">{row.productName}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[100px]">{row.variantName}</span>
                        <span className="text-[8px] bg-gray-100 dark:bg-white/5 px-1 rounded font-mono font-black text-gray-400 uppercase tracking-tighter shrink-0">{row.sku}</span>
                      </div>
                    </div>
                    {renderActions(row, index)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Tồn kho</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[13px] font-black ${row.stockQuantity <= row.lowStockThreshold ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {row.stockQuantity}
                        </span>
                        {row.stockQuantity <= row.lowStockThreshold && (
                          <div className="text-[7px] font-black text-red-500 bg-red-50 dark:bg-red-900/10 px-1 rounded border border-red-100/50">SẮP HẾT</div>
                        )}
                      </div>
                    </div>
                    {isFinanceVisible && (
                      <div className="flex flex-col text-right">
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Giá vốn / Bán</span>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                           <span className="text-[11px] font-black text-emerald-600">{formatCurrency(row.costPrice).replace('₫', '')}</span>
                           <span className="text-[9px] font-bold text-gray-400">{formatCurrency(row.price).replace('₫', '')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAdjustStock(row)}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-500/5 px-2 py-1.5 rounded-lg active:scale-95 transition-all uppercase tracking-wider"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      NHẬP/XUẤT
                    </button>
                    <button 
                      onClick={() => { window.location.href = `/admin/products?search=${row.productName}` }}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] font-black text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1.5 rounded-lg active:scale-95 transition-all uppercase tracking-wider"
                    >
                      <Package className="w-3 h-3" />
                      XEM SP
                    </button>
                  </div>
                </div>
              </div>
            )}
          />

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
          
          <AdminTable 
            columns={[
              {
                key: 'timestamp',
                label: 'Thời gian',
                render: (val) => (
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-gray-700">{new Date(val).toLocaleDateString('vi-VN')}</span>
                    <span className="text-[11px] text-gray-400">{new Date(val).toLocaleTimeString('vi-VN')}</span>
                  </div>
                )
              },
              {
                key: 'type',
                label: 'Loại / SKU',
                render: (val, row) => (
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${
                      val === 'IMPORT' ? 'text-blue-600' : 
                      val === 'SALE' ? 'text-emerald-600' : 
                      val === 'DAMAGED' ? 'text-red-600' : 'text-orange-500'
                    }`}>
                      {val === 'IMPORT' ? 'Nhập hàng' : 
                       val === 'SALE' ? 'Bán hàng' : 
                       val === 'DAMAGED' ? 'Hủy hàng' : 'Điều chỉnh'}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 font-mono">{row.sku}</span>
                  </div>
                )
              },
              {
                key: 'quantity',
                label: 'Số lượng',
                align: 'center',
                render: (val) => (
                  <span className={`text-[15px] font-black ${val > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {val > 0 ? `+${val}` : val}
                  </span>
                )
              },
              {
                key: 'balanceAfter',
                label: 'Dư sau',
                align: 'center',
                render: (val) => <span className="text-[14px] font-black text-gray-900">{val}</span>
              },
              {
                key: 'note',
                label: 'Ghi chú',
                render: (val) => <p className="text-[12px] text-gray-500 line-clamp-1 italic">"{val || 'Không có ghi chú'}"</p>
              }
            ]}
            data={history}
            isLoading={loading}
            showIndex={true}
            itemTitle="biến động"
            renderMobileCard={(row, index) => (
              <div key={row.id || index} className="p-2.5 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col flex-1 min-w-0">
                       <span className={`text-[9px] font-black uppercase tracking-widest ${
                        row.type === 'IMPORT' ? 'text-blue-600' : 
                        row.type === 'SALE' ? 'text-emerald-600' : 
                        row.type === 'DAMAGED' ? 'text-red-600' : 'text-orange-500'
                      }`}>
                        {row.type === 'IMPORT' ? 'NHẬP HÀNG' : 
                         row.type === 'SALE' ? 'BÁN HÀNG' : 
                         row.type === 'DAMAGED' ? 'HỦY HÀNG' : 'ĐIỀU CHỈNH'}
                      </span>
                      <span className="text-[12px] font-black text-gray-900 dark:text-white font-mono mt-0.5 truncate">{row.sku}</span>
                    </div>
                    <div className="text-right flex flex-col shrink-0">
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 leading-none">{new Date(row.timestamp).toLocaleDateString('vi-VN')}</span>
                      <span className="text-[9px] text-gray-400 font-medium mt-0.5">{new Date(row.timestamp).toLocaleTimeString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Biến động</span>
                      <span className={`text-[13px] font-black mt-0.5 ${row.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Tồn cuối</span>
                      <span className="text-[13px] font-black text-gray-900 dark:text-white mt-0.5">{row.balanceAfter}</span>
                    </div>
                  </div>

                  {row.note && (
                    <div className="px-2.5 py-1.5 bg-amber-50/50 dark:bg-amber-900/5 border border-amber-100/50 dark:border-amber-900/10 rounded-lg">
                       <p className="text-[10px] text-amber-700 dark:text-amber-500 font-medium italic leading-relaxed line-clamp-2">
                         "{row.note}"
                       </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default AdminInventory
