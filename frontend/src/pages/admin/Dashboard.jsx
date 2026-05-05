import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Calendar, RefreshCcw, Download, Filter } from 'lucide-react'
import { analyticsAPI } from '../../api/analytics'

// Refactored Components
import DashboardKPIs from '../../components/admin/dashboard/DashboardKPIs'
import DashboardCharts from '../../components/admin/dashboard/DashboardCharts'
import DashboardTopProducts from '../../components/admin/dashboard/DashboardTopProducts'
import DashboardInsights from '../../components/admin/dashboard/DashboardInsights'

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

  return (
    <div className="space-y-5 sm:space-y-10 pb-12 sm:pb-20 animate-fade-in px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight break-words">Thống Kê <span className="text-primary-600">Tổng Quan</span></h2>
          <p className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">Chào mừng trở lại! Đây là tình hình kinh doanh của bạn.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="flex bg-white dark:bg-dark-card p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto max-w-full w-full md:w-auto">
                {['today', '7d', '30d', 'all'].map(range => (
                    <button 
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                            timeRange === range ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        {range === 'today' ? 'Hôm nay' : range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : 'Tất cả'}
                    </button>
                ))}
            </div>
            
            <button onClick={fetchDashboardData} className="p-3 bg-white hover:bg-gray-50 text-gray-600 rounded-2xl border border-gray-100 shadow-sm transition-all flex items-center justify-center flex-shrink-0">
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {isFinanceVisible && (
                <button onClick={handleExport} className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-primary-500/20 transition-all flex-shrink-0">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Xuất báo cáo</span>
                </button>
            )}
        </div>
      </div>

      <DashboardKPIs data={data} isLoading={isLoading} userRole={userRole} />

      <DashboardCharts 
        revenueHistory={data.revenueHistory} 
        statusDistribution={data.orderStatusDistribution} 
        isLoading={isLoading} 
        userRole={userRole}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <DashboardTopProducts products={data.topProducts} isLoading={isLoading} userRole={userRole} />
          <DashboardInsights stats={data} isLoading={isLoading} userRole={userRole} />
      </div>

      {/* Mini tip section */}
      {!isLoading && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            <div className="bg-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-md flex-shrink-0">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-orange-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-lg sm:text-xl font-black break-words">Lên lịch chiến dịch mới?</h4>
              <p className="text-gray-400 text-sm mt-1 max-w-sm leading-relaxed">Chúng tôi nhận thấy lưu lượng truy cập tăng cao vào cuối tuần. Hãy thử một coupon giảm giá vào Thứ 7 này!</p>
            </div>
          </div>
          <button className="relative z-10 bg-white text-black px-6 sm:px-10 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black text-xs sm:text-sm hover:scale-105 transition-all shadow-xl shadow-white/5 w-full sm:w-auto whitespace-nowrap">
            Tạo khuyến mãi ngay
          </button>
          
          <div className="absolute right-0 top-0 w-48 h-48 sm:w-64 sm:h-64 bg-orange-500/10 rounded-full blur-[100px] -mr-24 sm:-mr-32 -mt-24 sm:-mt-32"></div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
