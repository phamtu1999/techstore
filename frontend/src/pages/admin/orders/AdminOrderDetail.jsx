import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, CreditCard, User, MapPin, Phone, Mail, FileText, ExternalLink, RefreshCw } from 'lucide-react'
import { useDispatch } from 'react-redux'
import Swal from 'sweetalert2'
import { fetchOrderById, updateOrderStatus } from '../../../store/slices/ordersSlice'
import { fireError, fireSuccess } from '../../../utils/swalError'
import { getApiErrorMessage } from '../../../utils/apiError'
import api from '../../../utils/axios'
import AdminPill from '../../../components/admin/shared/AdminPill'
import { formatCurrency } from '../../../utils/format'

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xử lý', type: 'warning', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', type: 'success', icon: CheckCircle },
  PROCESSING: { label: 'Đang xử lý', type: 'primary', icon: RefreshCw },
  SHIPPING: { label: 'Đang giao hàng', type: 'orange', icon: Truck },
  DELIVERED: { label: 'Đã giao hàng', type: 'success', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', type: 'danger', icon: XCircle }
}

const AdminOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const res = await dispatch(fetchOrderById(id)).unwrap()
      setOrder(res.result)
    } catch (err) {
      fireError(err, 'Không thể tải thông tin đơn hàng')
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleUpdateStatus = async () => {
    const { value: status } = await Swal.fire({
      title: 'Cập nhật trạng thái',
      input: 'select',
      inputOptions: {
        'PENDING': 'Chờ xử lý',
        'CONFIRMED': 'Đã xác nhận',
        'PROCESSING': 'Đang xử lý',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'CANCELLED': 'Đã hủy'
      },
      inputValue: order.status,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy'
    })

    if (status) {
      try {
        await dispatch(updateOrderStatus({ orderId: id, status })).unwrap()
        fireSuccess('Thành công', 'Trạng thái đơn hàng đã được cập nhật')
        fetchOrder()
      } catch (err) {
        fireError(err, 'Lỗi cập nhật trạng thái')
      }
    }
  }

  const handleExportInvoice = async () => {
    try {
      const response = await api.get(`/admin/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      fireError(error, 'Lỗi xuất hóa đơn');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!order) return null

  const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, type: 'primary', icon: Clock }

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Đơn hàng #{order.orderNumber}</h2>
              <AdminPill label={statusInfo.label} type={statusInfo.type} />
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Đặt ngày {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleExportInvoice}
            className="px-5 py-2.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
          >
            <FileText className="h-4 w-4" /> Xuất hóa đơn
          </button>
          <button 
            onClick={handleUpdateStatus}
            className="px-6 py-2.5 rounded-xl font-black bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/30 flex items-center gap-2 transition-all"
          >
            <Truck className="h-4 w-4" /> Cập nhật trạng thái
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-600" /> Danh sách sản phẩm
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{order.items.length} sản phẩm</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-black uppercase text-gray-400 tracking-widest">Sản phẩm</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Số lượng</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase text-gray-400 tracking-widest text-right">Đơn giá</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase text-gray-400 tracking-widest text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                            <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-contain" />
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-gray-900 line-clamp-1">{item.productName}</div>
                            <div className="text-[11px] text-gray-400 font-medium mt-0.5">{item.variantName}</div>
                            <div className="text-[10px] text-primary-600 font-mono mt-1">SKU: {item.variantSku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-[13px] font-black text-gray-700">x{item.quantity}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[13px] font-bold text-gray-700">{formatCurrency(item.priceAtPurchase)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[14px] font-black text-primary-600">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="p-6 bg-gray-50/50 space-y-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Tạm tính:</span>
                <span className="text-gray-900 font-bold">{formatCurrency(order.subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Phí vận chuyển:</span>
                <span className="text-gray-900 font-bold">{formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span className="font-medium">Giảm giá:</span>
                  <span className="font-bold">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-black text-gray-900 uppercase">Tổng cộng:</span>
                <span className="text-2xl font-black text-primary-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-primary-600" /> Lịch sử đơn hàng
            </h3>
            <div className="space-y-6">
              {order.timeline?.map((event, idx) => (
                <div key={event.id} className="relative flex gap-4">
                  {idx !== order.timeline.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-100" />
                  )}
                  <div className={`z-10 h-6 w-6 rounded-full flex items-center justify-center shadow-sm ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                    <div className="h-2 w-2 rounded-full bg-current" />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-gray-900 uppercase tracking-tight">{STATUS_CONFIG[event.status]?.label || event.status}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">{event.description}</div>
                    <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{new Date(event.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-5">
              <User className="h-5 w-5 text-primary-600" /> Thông tin khách hàng
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Người nhận</div>
                  <div className="text-[14px] font-bold text-gray-900">{order.receiverName}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Điện thoại</div>
                  <div className="text-[14px] font-bold text-gray-900">{order.receiverPhone}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Email</div>
                  <div className="text-[14px] font-bold text-gray-900 truncate">{order.receiverEmail || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-5">
              <MapPin className="h-5 w-5 text-primary-600" /> Địa chỉ giao hàng
            </h3>
            <div className="text-[13px] text-gray-600 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
              {order.shippingAddress}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-5">
              <CreditCard className="h-5 w-5 text-primary-600" /> Thanh toán
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                <span className="text-xs font-black text-gray-400 uppercase">Phương thức</span>
                <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">{order.paymentMethod || 'COD'}</span>
              </div>
              {order.note && (
                <div className="space-y-2">
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Ghi chú</div>
                  <div className="text-[13px] text-gray-600 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100">{order.note}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail
