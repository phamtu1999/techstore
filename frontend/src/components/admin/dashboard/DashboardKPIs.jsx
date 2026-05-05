import { DollarSign, ShoppingCart, Activity, CreditCard } from 'lucide-react'
import AdminStatsCard from '../shared/AdminStatsCard'

const DashboardKPIs = ({ data, isLoading, userRole }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  const isFinanceVisible = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN'

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse h-32"></div>
        ))}
      </div>
    )
  }

  const conversionRate = (data.totalCustomers > 0 ? ((data.todayOrders || 0) / data.totalCustomers) : 0) * 100

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {isFinanceVisible && (
        <AdminStatsCard 
          label="Doanh thu hôm nay"
          value={formatCurrency(data.todayRevenue || 0)}
          icon={DollarSign}
          trend={data.revenueGrowth >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(data.revenueGrowth || 0).toFixed(1)}%`}
          color="green"
        />
      )}
      
      <AdminStatsCard 
        label="Đơn hàng hôm nay"
        value={data.todayOrders || 0}
        icon={ShoppingCart}
        trend={data.orderGrowth >= 0 ? 'up' : 'down'}
        trendValue={`${Math.abs(data.orderGrowth || 0).toFixed(1)}%`}
        color="orange"
      />

      <AdminStatsCard 
        label="Tỷ lệ chuyển đổi"
        value={`${conversionRate.toFixed(1)}%`}
        icon={Activity}
        color="blue"
      />

      <AdminStatsCard 
        label="Giá trị đơn AOV"
        value={formatCurrency(data.averageOrderValue || 0)}
        icon={CreditCard}
        color="purple"
      />
    </div>
  )
}

export default DashboardKPIs

export default DashboardKPIs
