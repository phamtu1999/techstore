import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/ordersSlice'
import { ordersAPI } from '../../api/orders'
import AdminTable from '../../components/admin/AdminTable'
import { Eye, Printer, X, Clock, CheckCircle, Truck, Package, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'

// Sub-components
import OrderStats from '../../components/admin/orders/OrderStats'
import OrderFilters from '../../components/admin/orders/OrderFilters'
import OrderDetailModal from '../../components/admin/orders/OrderDetailModal'
import PrintInvoice from '../../components/admin/orders/PrintInvoice'

const AdminOrders = () => {
  const dispatch = useDispatch()
  const { orders, isLoading } = useSelector((state) => state.orders)
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  
  // UI States
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [printOrder, setPrintOrder] = useState(null)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 10

  // Selection States
  const [selectedOrders, setSelectedOrders] = useState([])
  
  const handleSelectRow = (id, checked) => {
    if (checked) setSelectedOrders(prev => [...prev, id])
    else setSelectedOrders(prev => prev.filter(orderId => orderId !== id))
  }

  const handleSelectAll = (checked) => {
    if (checked) setSelectedOrders(filteredOrders.map(o => o.id))
    else setSelectedOrders([])
  }

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) return

    const result = await Swal.fire({
      title: 'Xác nhận xử lý hàng loạt',
      text: `Bạn có chắc muốn chuyển ${selectedOrders.length} đơn hàng sang ${getStatusLabel(newStatus)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    })

    if (result.isConfirmed) {
      try {
        setIsUpdating(true)
        await Promise.all(
          selectedOrders.map(id => {
             const order = orders.find(o => o.id === id);
             if (canTransitionTo(order.status, newStatus)) {
                return dispatch(updateOrderStatus({ orderId: id, status: newStatus })).unwrap();
             }
             return Promise.resolve();
          })
        )
        await fetchOrders()
        setSelectedOrders([])
        fireSuccess('Thành công', `Đơn hàng hợp lệ đã được cập nhật`)
      } catch (error) {
        fireError(error, 'Có lỗi xảy ra trong quá trình cập nhật hàng loạt')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const fetchOrders = async () => {
    setIsFetching(true)
    try {
      const response = await ordersAPI.getAllOrders({ page: currentPage, size: pageSize })
      const pageData = response.data.result
      dispatch({ type: 'orders/fetchAllOrders/fulfilled', payload: response.data })
      setTotalPages(pageData.totalPages || 0)
      setTotalElements(pageData.totalElements || 0)
    } catch (error) {
      console.error(getApiErrorMessage(error))
    } finally {
      setIsFetching(false)
    }
  }

  // --- Utility Functions (Could be moved to a shared file later) ---
  const canTransitionTo = (currentStatus, newStatus) => {
    const transitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['SHIPPING', 'CANCELLED'],
      'SHIPPING': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': []
    }
    return transitions[currentStatus]?.includes(newStatus) || false
  }

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Giao thành công',
      'REVIEWED': 'Đã đánh giá',
      'CANCELLED': 'Đã hủy đơn'
    }
    return labels[status] || status
  }

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': <Clock className="w-4 h-4" />,
      'CONFIRMED': <CheckCircle className="w-4 h-4" />,
      'SHIPPING': <Truck className="w-4 h-4" />,
      'DELIVERED': <Package className="w-4 h-4" />,
      'REVIEWED': <CheckCircle className="w-4 h-4 text-orange-600" />,
      'CANCELLED': <XCircle className="w-4 h-4" />
    }
    return icons[status]
  }

  // --- Handlers ---
  const handleViewDetail = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handlePrintInvoice = async (order) => {
    setIsUpdating(true);
    let orderToPrint = order;
    
    // Safety check: if items are missing, fetch full details
    if (!order.items || order.items.length === 0) {
      try {
        const response = await ordersAPI.getOrderById(order.id);
        orderToPrint = response.data.result;
      } catch (error) {
        console.error('Failed to fetch full order details:', error);
      }
    }

    setPrintOrder(orderToPrint);
    setIsUpdating(false);
    
    setTimeout(() => {
      window.print();
    }, 200);
  }

  const handleCancelOrder = async (order) => {
    const result = await Swal.fire({
      title: 'Xác nhận hủy đơn',
      html: `Bạn có chắc muốn hủy đơn hàng <strong>${order.orderNumber}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý hủy',
      cancelButtonText: 'Giữ lại đơn',
      confirmButtonColor: '#ef4444'
    })

    if (result.isConfirmed) {
      try {
        setIsUpdating(true)
        await dispatch(updateOrderStatus({ orderId: order.id, status: 'CANCELLED' })).unwrap()
        await fetchOrders()
        fireSuccess('Thành công', 'Đã hủy đơn hàng')
      } catch (error) {
        fireError(error, 'Không thể hủy đơn')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    if (!canTransitionTo(currentStatus, newStatus)) {
      fireError({ response: { data: { message: 'Quy trình chuyển trạng thái không hợp lệ' } } })
      return
    }

    const result = await Swal.fire({
      title: 'Cập nhật trạng thái',
      html: `Chuyển đơn hàng sang <b>${getStatusLabel(newStatus)}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy'
    })

    if (result.isConfirmed) {
      try {
        setIsUpdating(true)
        await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap()
        await fetchOrders()
        if (showDetailModal && selectedOrder?.id === orderId) {
           setSelectedOrder(prev => ({ ...prev, status: newStatus }))
        }
        fireSuccess('Thành công', '', { toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
      } catch (error) {
        fireError(error, 'Cập nhật thất bại')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  // --- Filtering Logic ---
  const filteredOrders = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!order.orderNumber.toLowerCase().includes(search) &&
          !order.receiverName.toLowerCase().includes(search) &&
          !order.receiverPhone.includes(search)) return false
    }
    if (dateFrom && new Date(order.createdAt) < new Date(dateFrom)) return false
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (new Date(order.createdAt) > toDate) return false
    }
    if (minAmount && order.totalAmount < parseFloat(minAmount)) return false
    if (maxAmount && order.totalAmount > parseFloat(maxAmount)) return false
    return true
  })

  const stats = {
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    shipping: orders.filter(o => o.status === 'SHIPPING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  }

  const orderColumns = [
    { 
      key: 'orderNumber', 
      label: 'Đơn hàng',
      render: (val, row) => (
        <button onClick={() => handleViewDetail(row)} className="font-black text-primary-600 hover:scale-105 transition-transform">
          #{val}
        </button>
      )
    },
    { key: 'receiverName', label: 'Khách hàng', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { 
      key: 'totalAmount', 
      label: 'Tổng tiền', 
      render: (val) => <span className="font-black text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}</span>
    },
    { 
      key: 'status', 
      label: 'Trạng thái', 
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
          val === 'DELIVERED' ? 'bg-green-100 text-green-700' :
          val === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
          val === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
          val === 'SHIPPING' ? 'bg-indigo-100 text-indigo-700' :
          val === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {getStatusIcon(val)} {getStatusLabel(val)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleViewDetail(row)} className="p-2.5 bg-slate-50 hover:bg-primary-50 text-primary-600 rounded-xl transition-all" title="Chi tiết"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handlePrintInvoice(row)} className="p-2.5 bg-slate-50 hover:bg-green-50 text-green-600 rounded-xl transition-all" title="In"><Printer className="w-4 h-4" /></button>
          {['PENDING', 'CONFIRMED', 'SHIPPING'].includes(row.status) && (
            <button onClick={() => handleCancelOrder(row)} className="p-2.5 bg-slate-50 hover:bg-red-50 text-red-600 rounded-xl transition-all" title="Hủy"><X className="w-4 h-4" /></button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-5 sm:space-y-8 pb-16 sm:pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Orders
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-dark-text tracking-tight">
            Quản lý <span className="text-primary-main">đơn hàng</span>
          </h2>
          <p className="text-sm sm:text-base font-medium text-text-secondary dark:text-gray-400 mt-2 leading-relaxed">
            Theo dõi, xử lý và cập nhật trạng thái đơn hàng theo thời gian thực.
          </p>
        </div>
      </div>

      <OrderStats stats={stats} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      <OrderFilters 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        minAmount={minAmount} setMinAmount={setMinAmount}
        maxAmount={maxAmount} setMaxAmount={setMaxAmount}
        filteredCount={filteredOrders.length}
        onReset={() => {
            setSearchTerm(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setMinAmount(''); setMaxAmount('');
        }}
      />

      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Bulk Action Bar */}
        {selectedOrders.length > 0 && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-black text-white p-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest ml-4">Đã chọn {selectedOrders.length} đơn hàng</span>
              <div className="h-4 w-[1px] bg-gray-700"></div>
              <button 
                onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Xác nhận hàng loạt
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('CANCELLED')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Hủy hàng loạt
              </button>
            </div>
            <button onClick={() => setSelectedOrders([])} className="p-2 hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {isFetching ? (
          <div className="py-20 text-center space-y-4">
             <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
             <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="font-bold text-gray-400">Không tìm thấy đơn hàng nào khớp với bộ lọc.</p>
          </div>
        ) : (
          <>
            <AdminTable 
              columns={orderColumns} 
              data={filteredOrders} 
              selectedRows={selectedOrders}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              showIndex={true}
              currentPage={currentPage}
              pageSize={pageSize}
            />
            
            {/* Pagination UI - Simplified */}
            {totalPages > 1 && (
              <div className="p-8 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
                <span className="text-[10px] font-black uppercase text-gray-400">Trang {currentPage + 1} của {totalPages}</span>
                <div className="flex gap-2">
                   <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-primary-600 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                   <button onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-primary-600 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showDetailModal && (
        <OrderDetailModal 
          order={selectedOrder}
          onClose={() => setShowDetailModal(false)}
          onStatusChange={handleStatusChange}
          onCancel={handleCancelOrder}
          isUpdating={isUpdating}
          getStatusLabel={getStatusLabel}
          getStatusIcon={getStatusIcon}
        />
      )}

      {/* Hidden Print Content */}
      <PrintInvoice order={printOrder} />
    </div>
  )
}

export default AdminOrders
