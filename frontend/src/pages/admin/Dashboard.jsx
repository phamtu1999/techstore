import { Suspense, lazy, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Calendar, RefreshCcw, Download } from 'lucide-react'
import { analyticsAPI } from '../../api/analytics'

// Refactored Components
const DashboardKPIs = lazy(() => import('../../components/admin/dashboard/DashboardKPIs'))
const DashboardRecentOrders = lazy(() => import('../../components/admin/dashboard/DashboardRecentOrders'))
const DashboardInsights = lazy(() => import('../../components/admin/dashboard/DashboardInsights'))
const DashboardCharts = lazy(() => import('../../components/admin/dashboard/DashboardCharts'))
const DashboardTopProducts = lazy(() => import('../../components/admin/dashboard/DashboardTopProducts'))
const AdminPageHeader = lazy(() => import('../../components/admin/shared/AdminPageHeader'))

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const userRole = user?.role
  const isFinanceVisible = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN'

  const [data, setData] = useState({
    totalOrders: 0, totalRevenue: 0, totalCustomers: 0,
    todayRevenue: 0, yesterdayRevenue: 0, revenueGrowth: 0,
    todayOrders: 0, yesterdayOrders: 0, orderGrowth: 0,
    monthlyRevenue: 0, averageOrderValue: 0, cancellationRate: 0,
    revenueHistory: [], topProducts: [], orderStatusDistribution: [],
    lowStockProducts: []
  })

  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const res = await analyticsAPI.getDashboardStats(timeRange)
      if (res.data?.result) setData(res.data.result)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    if (!isFinanceVisible) return;
    try {
      const response = await analyticsAPI.exportReport(timeRange);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_doanh_thu_${timeRange}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Lỗi xuất báo cáo:", error);
    }
  }

  useEffect(() => { fetchDashboardData() }, [timeRange])

  const headerRight = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex bg-white dark:bg-dark-card p-1 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm overflow-x-auto scrollbar-none max-w-[calc(100vw-80px)] sm:max-w-none">
        {['today', '7d', '30d', 'all'].map(range => (
          <button 
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              timeRange === range ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            {range === 'today' ? 'Hôm nay' : range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : 'Tất cả'}
          </button>
        ))}
      </div>
      
      <button onClick={fetchDashboardData} className="p-2.5 bg-white hover:bg-gray-50 text-gray-400 rounded-xl border border-gray-100 shadow-sm transition-all">
        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
      
      {isFinanceVisible && (
        <button onClick={handleExport} className="h-11 bg-primary-600 text-white px-6 rounded-xl font-bold text-[13px] flex items-center gap-2 shadow-sm shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95">
          <Download className="h-4 w-4" />
          XUẤT BÁO CÁO
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-gray-100" />}>
        <AdminPageHeader 
          title="Thống Kê" 
          accentTitle="Tổng Quan"
          subtitle="Chào mừng trở lại! Dưới đây là những gì đang diễn ra với Tech Store hôm nay."
          rightElement={headerRight}
        />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-gray-100" />}>
        <DashboardKPIs data={data} isLoading={isLoading} userRole={userRole} />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-gray-100" />}>
        <DashboardCharts 
          revenueHistory={data.revenueHistory} 
          statusDistribution={data.orderStatusDistribution} 
          isLoading={isLoading} 
          userRole={userRole}
        />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-gray-100" />}>
            <DashboardRecentOrders isLoading={isLoading} />
          </Suspense>
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-gray-100" />}>
            <DashboardTopProducts products={data.topProducts} isLoading={isLoading} userRole={userRole} />
          </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-8">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-gray-100" />}>
            <DashboardInsights stats={data} isLoading={isLoading} userRole={userRole} />
          </Suspense>
      </div>

      {/* Mini tip section */}
      {!isLoading && (
        <div className="bg-gray-900 p-8 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              <Calendar className="h-10 w-10 text-primary-600" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Lên lịch chiến dịch mới?</h4>
              <p className="text-gray-400 text-sm mt-1 max-w-sm font-medium">Chúng tôi nhận thấy lưu lượng truy cập tăng cao vào cuối tuần. Hãy thử một coupon giảm giá vào Thứ 7 này!</p>
            </div>
          </div>
          <button className="relative z-10 bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-primary-700 hover:scale-105 transition-all shadow-xl shadow-primary-600/20 whitespace-nowrap">
            TẠO KHUYẾN MÃI NGAY
          </button>
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
