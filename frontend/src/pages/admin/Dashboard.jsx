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
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
      <div className="flex bg-white dark:bg-dark-card p-1 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm overflow-x-auto scrollbar-none max-w-[calc(100vw-80px)] sm:max-w-none no-scrollbar">
        {['today', '7d', '30d', 'all'].map(range => (
          <button 
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap shrink-0 uppercase tracking-tight ${
              timeRange === range ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {range === 'today' ? 'Hôm nay' : range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : 'Tất cả'}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <button onClick={fetchDashboardData} className="p-2 sm:p-2.5 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-white/5 text-gray-400 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm transition-all group">
            <RefreshCcw className={`h-4 w-4 group-active:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
        
        {isFinanceVisible && (
            <button onClick={handleExport} className="h-10 sm:h-11 bg-primary-600 text-white px-3 sm:px-6 rounded-xl font-black text-[10px] sm:text-[13px] flex items-center gap-1.5 sm:gap-2 shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 uppercase tracking-widest">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">XUẤT BÁO CÁO</span>
            <span className="xs:hidden">XUẤT</span>
            </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12 sm:pb-0">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />}>
        <AdminPageHeader 
          title="Thống Kê" 
          accentTitle="Tổng Quan"
          subtitle="Chào mừng trở lại! Dưới đây là những gì đang diễn ra với Tech Store hôm nay."
          rightElement={headerRight}
        />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />}>
            <DashboardKPIs data={data} isLoading={isLoading} userRole={userRole} />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />}>
            <DashboardCharts 
            revenueHistory={data.revenueHistory} 
            statusDistribution={data.orderStatusDistribution} 
            isLoading={isLoading} 
            userRole={userRole}
            />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />}>
            <DashboardRecentOrders isLoading={isLoading} />
          </Suspense>
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />}>
            <DashboardTopProducts products={data.topProducts} isLoading={isLoading} userRole={userRole} />
          </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />}>
            <DashboardInsights stats={data} isLoading={isLoading} userRole={userRole} />
          </Suspense>
      </div>

      {/* Mini tip section */}
      {!isLoading && (
        <div className="bg-gray-900 dark:bg-admin-primary/10 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 relative overflow-hidden group shadow-2xl border border-white/5">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8">
            <div className="bg-white/10 p-4 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-md group-hover:rotate-12 transition-transform duration-500">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-primary-500" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-white italic tracking-tight">Lên lịch chiến dịch mới?</h4>
              <p className="text-gray-400 text-[13px] sm:text-[15px] mt-2 max-w-sm font-bold leading-relaxed">Chúng tôi nhận thấy lưu lượng truy cập tăng cao vào cuối tuần. Hãy thử một coupon giảm giá vào Thứ 7 này!</p>
            </div>
          </div>
          <button className="relative z-10 w-full sm:w-auto bg-primary-600 text-white px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[13px] sm:text-sm hover:bg-primary-700 hover:scale-105 transition-all shadow-xl shadow-primary-600/30 whitespace-nowrap uppercase tracking-[0.2em] italic">
            TẠO KHUYẾN MÃI NGAY
          </button>
          
          {/* Decorative Orbs */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary-600/30 transition-colors"></div>
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-primary-400/10 rounded-full blur-[80px] -ml-24 -mb-24 group-hover:bg-primary-400/20 transition-colors"></div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
