import { useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/ordersSlice'
import { ordersAPI } from '../../api/orders'
import AdminTable from '../../components/admin/AdminTable'
import { Eye, Printer, X, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'

// Sub-components
import OrderStats from '../../components/admin/orders/OrderStats'
import OrderFilters from '../../components/admin/orders/OrderFilters'
import OrderDetailModal from '../../components/admin/orders/OrderDetailModal'
import PrintInvoice from '../../components/admin/orders/PrintInvoice'
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader'
import AdminPagination from '../../components/admin/shared/AdminPagination'
import AdminPill from '../../components/admin/shared/AdminPill'

const AdminOrders = () => {
  const dispatch = useDispatch()
  const { orders, isLoading, totalPages } = useSelector((state) => state.orders)
  
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '0')
  const setPage = (nextPage) => {
    setSearchParams(prev => {
      prev.set('page', nextPage)
      return prev
    })
  }

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
  const [printOrder, setPrintOrder] = useState(null)
  const pageSize = 10

  // Selection States
  const [selectedOrders, setSelectedOrders] = useState([])

  const filteredOrders = useMemo(() => orders.filter(order => {
    if (!order) return false
    if (statusFilter && order.status !== statusFilter) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const orderNum = order.orderNumber ? order.orderNumber.toLowerCase() : ''
      const name = order.receiverName ? order.receiverName.toLowerCase() : ''
      const phone = order.receiverPhone || ''
      
      if (!orderNum.includes(search) &&
          !name.includes(search) &&
          !phone.includes(search)) return false
    }
    if (dateFrom && order.createdAt && new Date(order.createdAt) < new Date(dateFrom)) return false
    if (dateTo && order.createdAt) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (new Date(order.createdAt) > toDate) return false
    }
    if (minAmount && order.totalAmount < parseFloat(minAmount)) return false
    if (maxAmount && order.totalAmount > parseFloat(maxAmount)) return false
    return true
  }), [orders, statusFilter, searchTerm, dateFrom, dateTo, minAmount, maxAmount])

  const stats = useMemo(() => ({
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    shipping: orders.filter(o => o.status === 'SHIPPING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  }), [orders])
  
  const handleSelectRow = useCallback((id, checked) => {
    if (checked) setSelectedOrders(prev => [...prev, id])
    else setSelectedOrders(prev => prev.filter(orderId => orderId !== id))
  }, [])

  const handleSelectAll = useCallback((checked) => {
    if (checked) setSelectedOrders(filteredOrders.map(o => o.id))
    else setSelectedOrders([])
  }, [filteredOrders])

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
             if (order && canTransitionTo(order.status, newStatus)) {
                return dispatch(updateOrderStatus({ orderId: id, status: newStatus })).unwrap();
             }
             return Promise.resolve();
          })
        )
        fetchOrders()
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
  }, [page])

  const fetchOrders = () => {
    dispatch(fetchAllOrders({ page: page, size: pageSize }))
  }

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

  const getStatusType = (status) => {
    const map = {
      'DELIVERED': 'success',
      'PENDING': 'warning',
      'CANCELLED': 'danger',
      'CONFIRMED': 'info',
      'SHIPPING': 'info',
      'REVIEWED': 'success'
    }
    return map[status] || 'info'
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

  const handleViewDetail = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handlePrintInvoice = async (order) => {
    setIsUpdating(true);
    let orderToPrint = order;
    
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


  const orderColumns = [
    { 
      key: 'orderNumber', 
      label: 'Mã đơn',
      render: (val, row) => (
        <button onClick={() => handleViewDetail(row)} className="font-black text-primary-600 hover:underline text-[14px]">
          #{val}
        </button>
      )
    },
    { key: 'receiverName', label: 'Khách hàng', render: (val) => <span className="font-bold text-gray-900 text-[14px]">{val}</span> },
    { 
      key: 'totalAmount', 
      label: 'Tổng tiền', 
      render: (val) => <span className="font-black text-gray-900 text-[14px]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}</span>
    },
    { 
      key: 'status', 
      label: 'Trạng thái', 
      render: (val) => (
        <AdminPill label={getStatusLabel(val)} type={getStatusType(val)} />
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div className="flex gap-1 justify-center">
          <button onClick={() => handleViewDetail(row)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Chi tiết"><Eye className="w-5 h-5" /></button>
          <button onClick={() => handlePrintInvoice(row)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="In"><Printer className="w-5 h-5" /></button>
          {['PENDING', 'CONFIRMED', 'SHIPPING'].includes(row.status) && (
            <button onClick={() => handleCancelOrder(row)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Hủy"><X className="w-5 h-5" /></button>
          )}
        </div>
      )
    }
  ]

  const bulkActionBar = selectedOrders.length > 0 && (
    <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-2 shadow-lg animate-scale-up">
      <span className="text-[13px] font-bold">
        Đã chọn <span className="text-primary-500 font-black">{selectedOrders.length}</span>
      </span>
      <div className="w-[1px] h-4 bg-gray-700"></div>
      <button 
        onClick={() => handleBulkStatusUpdate('CONFIRMED')}
        className="text-[13px] font-bold hover:text-primary-400 transition-colors"
      >
        Xác nhận
      </button>
      <button 
        onClick={() => handleBulkStatusUpdate('CANCELLED')}
        className="text-[13px] font-bold text-red-400 hover:text-red-300 transition-colors"
      >
        Hủy
      </button>
      <div className="w-[1px] h-4 bg-gray-700"></div>
      <button onClick={() => setSelectedOrders([])} className="text-gray-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in text-black">
      <AdminPageHeader 
        title="Quản lý" 
        accentTitle="Đơn hàng"
        subtitle="Theo dõi, xử lý và cập nhật trạng thái đơn hàng theo thời gian thực."
        rightContent={bulkActionBar}
      />

      <OrderStats stats={stats} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-black">
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
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative text-black">
        {isLoading ? (
          <div className="py-20 text-center">
             <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600"></div>
             <p className="text-gray-500 font-medium mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-[14px] font-bold text-gray-900">Không tìm thấy đơn hàng</p>
            <p className="text-gray-500 font-medium mt-1">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
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
              currentPage={page}
              pageSize={pageSize}
            />
            
            <AdminPagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
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

      <PrintInvoice order={printOrder} />
    </div>
  )
}

export default AdminOrders
