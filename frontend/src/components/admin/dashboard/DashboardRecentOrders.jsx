import React, { useEffect, useState } from 'react'
import { ordersAPI } from '../../../api/orders'
import AdminPill from '../shared/AdminPill'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DashboardRecentOrders = ({ isLoading: dashboardLoading }) => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setIsLoading(true)
        const res = await ordersAPI.getAllOrders({ page: 0, size: 5, sort: 'createdAt,desc' })
        if (res.data?.result?.content) {
          setOrders(res.data.result.content)
        }
      } catch (err) {
        console.error('Fetch recent orders error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  const getStatusType = (status) => {
    const map = {
      'DELIVERED': 'success',
      'PENDING': 'warning',
      'CANCELLED': 'danger',
      'CONFIRMED': 'info',
      'SHIPPING': 'info',
      'SHIPPED': 'info',
      'PROCESSING': 'info'
    }
    return map[status] || 'info'
  }

  const getStatusLabel = (status) => {
    const map = {
      'DELIVERED': 'Giao thành công',
      'PENDING': 'Chờ xác nhận',
      'CANCELLED': 'Đã hủy',
      'CONFIRMED': 'Đã xác nhận',
      'SHIPPING': 'Đang giao',
      'SHIPPED': 'Đã xuất kho',
      'PROCESSING': 'Đang xử lý'
    }
    return map[status] || status
  }

  if (isLoading || dashboardLoading) {
    return <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-[400px]"></div>
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-bold text-gray-900">Đơn hàng gần đây</h3>
          <p className="text-[13px] text-gray-500 font-medium">Theo dõi các giao dịch mới nhất</p>
        </div>
        <button 
          onClick={() => navigate('/admin/orders')}
          className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-primary-600 transition-all group"
        >
          <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mã đơn</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Tổng tiền</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/orders`)}
              >
                <td className="px-6 py-4">
                  <span className="text-[13px] font-black text-primary-600">#{order.orderNumber}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-gray-900">{order.customerName}</span>
                    <span className="text-[11px] text-gray-400 font-medium">{order.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[13px] font-black text-gray-900">{formatCurrency(order.totalAmount)}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <AdminPill label={getStatusLabel(order.status)} type={getStatusType(order.status)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/30">
        <button 
          onClick={() => navigate('/admin/orders')}
          className="w-full py-2.5 text-[12px] font-bold text-primary-600 hover:text-white border border-primary-600/20 hover:bg-primary-600 rounded-xl transition-all"
        >
          XEM TẤT CẢ ĐƠN HÀNG
        </button>
      </div>
    </div>
  )
}

export default DashboardRecentOrders
