import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, Info, Package, ShoppingCart, Download, Loader2 } from 'lucide-react'
import { fetchDashboardAnalytics } from '../../store/slices/analyticsSlice'
import { analyticsAPI } from '../../api/analytics'
import Swal from 'sweetalert2'

const Analytics = () => {
  const dispatch = useDispatch()
  const { data, isLoading } = useSelector((state) => state.analytics)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    dispatch(fetchDashboardAnalytics())
  }, [dispatch])

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await analyticsAPI.exportReport('30d')
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bao_cao_phan_tich_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      Swal.fire({
        icon: 'success',
        title: 'Xuất báo cáo thành công',
        text: 'Bản báo cáo Excel đã được tải xuống máy của bạn.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    } catch (error) {
      console.error('Export failed:', error)
      Swal.fire({
        icon: 'error',
        title: 'Lỗi xuất báo cáo',
        text: 'Đã có lỗi xảy ra khi tạo bản báo cáo.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    } finally {
      setExporting(false)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-black text-gray-500 uppercase tracking-widest">Đang phân tích dữ liệu AI...</p>
      </div>
    )
  }

  const formatCurrency = (value = 0) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  const formatNumber = (value = 0) => new Intl.NumberFormat('vi-VN').format(value)

  const revenueHistory = data.revenueHistory || []
  const orderStatusData = Object.entries(data.orderStatusDistribution || {}).map(([status, count]) => ({
    status,
    count,
  }))
  const topProducts = data.topProducts || []
  const lowStockProducts = data.lowStockProducts || []
  const abandonedCarts = data.abandonedCartInsights || []

  return (
    <div className="space-y-5 sm:space-y-8 pb-12 sm:pb-16 animate-fade-in">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-dark-text tracking-tight">
            Phân tích <span className="text-primary-main">thông minh</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-text-secondary dark:text-gray-400 leading-relaxed">Dữ liệu phân tích và dự báo từ hệ thống Tech Store v2.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button className="h-12 bg-white dark:bg-dark-card border border-border dark:border-dark-border px-4 rounded-2xl text-sm font-semibold text-text-primary dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition-all flex items-center gap-2">
                7 Ngày qua
            </button>
            <button 
                onClick={handleExport}
                disabled={exporting}
                className="h-12 bg-primary-main text-white px-5 rounded-2xl text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-primary-main/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                )}
                {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
            </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-dark-card rounded-[1.5rem] border border-border dark:border-dark-border p-5 shadow-sm border-l-4 border-l-primary-main">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Doanh thu tháng này</p>
              <p className="text-2xl font-black text-secondary-900">{formatCurrency(data.monthlyRevenue)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-[10px] font-bold text-green-500">+{data.revenueGrowth?.toFixed(1)}% so với hôm qua</span>
              </div>
            </div>
            <div className="rounded-2xl bg-primary-50 p-3 text-primary-MAIN">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-[1.5rem] border border-border dark:border-dark-border p-5 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dự báo tháng tới (AI)</p>
              <p className="text-2xl font-black text-blue-600">{formatCurrency(data.predictedNextMonthRevenue)}</p>
              <div className="flex items-center gap-1 mt-2">
                <Info className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 italic">Dựa trên tăng trưởng 15%</span>
              </div>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-500">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-[1.5rem] border border-border dark:border-dark-border p-5 shadow-sm border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tỉ lệ bỏ giỏ hàng</p>
              <p className="text-2xl font-black text-orange-600">{data.abandonedCartRate?.toFixed(1)}%</p>
              <p className="text-[10px] font-bold text-gray-400 mt-2">Cần cải thiện phễu thanh toán</p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-500">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-[1.5rem] border border-border dark:border-dark-border p-5 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cảnh báo kho</p>
               <p className="text-2xl font-black text-red-600">{lowStockProducts.length}</p>
               <p className="text-[10px] font-bold text-red-400 mt-2">Sản phẩm sắp hết hàng</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-dark-card rounded-[1.75rem] border border-border dark:border-dark-border p-5 sm:p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-secondary-800">Xu hướng doanh thu</h3>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-MAIN"></span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Thực tế</span>
            </div>
          </div>
          <div className="h-80 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ff6a00" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis hide />
                <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    formatter={(value) => [formatCurrency(value), 'Doanh thu']} 
                />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ff6a00" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock AI Insights */}
        <div className="bg-white dark:bg-dark-card rounded-[1.75rem] border border-border dark:border-dark-border p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-secondary-800">Cảnh báo kho hàng</h3>
            <span className="bg-red-50 text-red-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">AI Detected</span>
          </div>
          <div className="space-y-4">
             {lowStockProducts.length > 0 ? lowStockProducts.map((p, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl ${p.status === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>
                        <Package className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-secondary-900 group-hover:text-primary-MAIN transition-colors">{p.name}</p>
                        <p className="text-xs font-bold text-gray-500">{p.variantName}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-sm font-black ${p.status === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}`}>Còn lại: {p.currentStock}</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Ngưỡng safe: {p.threshold}</p>
                  </div>
               </div>
             )) : (
               <div className="py-20 text-center">
                  <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Kho hàng hiện tại an toàn</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Abandoned Cart Table */}
        <div className="bg-white dark:bg-dark-card rounded-[1.75rem] border border-border dark:border-dark-border p-5 sm:p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-secondary-800">Thất thoát giỏ hàng</h3>
                <span className="text-gray-400 text-xs font-bold italic">Top 5 sản phẩm đang chờ chốt đơn</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5">
                            <th className="px-4 py-4 text-left">Sản phẩm</th>
                            <th className="px-4 py-4 text-center">Số giỏ hàng</th>
                            <th className="px-4 py-4 text-right text-orange-500">Doanh thu treo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {abandonedCarts.map((item, idx) => (
                            <tr key={idx} className="group">
                                <td className="px-4 py-4">
                                    <p className="text-sm font-black text-gray-700 dark:text-gray-200 group-hover:text-primary-MAIN transition-all">{item.productName}</p>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-xs font-black text-gray-600 dark:text-gray-400">{item.cartCount}</span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <p className="text-sm font-black text-orange-500">{formatCurrency(item.potentialLoss)}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-dark-card rounded-[1.75rem] border border-border dark:border-dark-border p-5 sm:p-6 shadow-sm">
            <h3 className="text-lg font-black text-secondary-800 mb-6 uppercase tracking-widest text-center">Trạng thái đơn hàng</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderStatusData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="status" type="category" tick={{ fontSize: 10, fontWeight: 900 }} width={80} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                            {orderStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Mới</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Đã giao</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

