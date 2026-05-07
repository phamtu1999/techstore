import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell
} from 'recharts'
import { useState } from 'react'
import { Activity } from 'lucide-react'

const DashboardCharts = ({ revenueHistory, statusDistribution, isLoading, userRole }) => {
  const isFinanceVisible = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN'
  const [activeIndex, setActiveIndex] = useState(null);

  const COLORS = {
    DELIVERED: '#10b981', // Emerald 500
    CONFIRMED: '#3b82f6',  // Blue 500
    SHIPPED: '#8b5cf6',    // Violet 500
    SHIPPING: '#6366f1',   // Indigo 500
    PENDING: '#ea580c',   // Primary Orange
    REVIEWED: '#eab308',   // Yellow 500
    CANCELLED: '#ef4444',  // Red 500
  }

  const statusMap = {
    DELIVERED: 'GIAO THÀNH CÔNG',
    PENDING: 'CHỜ XÁC NHẬN',
    CANCELLED: 'ĐÃ HỦY',
    CONFIRMED: 'ĐÃ XÁC NHẬN',
    SHIPPED: 'ĐANG GIAO HÀNG',
    SHIPPING: 'ĐANG CHUYỂN',
    REVIEWED: 'ĐÃ ĐÁNH GIÁ'
  }

  const priority = ['DELIVERED', 'CONFIRMED', 'SHIPPED', 'SHIPPING', 'PENDING', 'REVIEWED', 'CANCELLED'];

  const pieData = Object.entries(statusDistribution || {})
    .sort((a, b) => priority.indexOf(a[0]) - priority.indexOf(b[0]))
    .map(([key, value]) => ({
      name: statusMap[key] || key,
      value: value,
      color: COLORS[key] || '#94a3b8'
    }))

  const totalOrders = pieData.reduce((acc, curr) => acc + curr.value, 0)

  const formatCurrencyY = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)} Tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)} K`;
    return val;
  }

  const formatFullCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const sortedHistory = [...(revenueHistory || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xl p-4">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-sm font-medium text-gray-600">
                {entry.name}: <span className="font-bold text-gray-900">
                  {entry.name === 'Doanh thu' ? formatFullCurrency(entry.value) : entry.value}
                </span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse"></div>
        <div className="h-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Area Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h3 className="text-[18px] font-bold text-gray-900">Doanh thu 30 ngày gần nhất</h3>
          <p className="text-[13px] text-gray-500 font-medium">Thống kê biến động doanh thu theo thời gian</p>
        </div>
        
        <div className="w-full h-[300px]">
          {sortedHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sortedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                  tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
                  tickLine={false} axisLine={false} dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
                  tickFormatter={formatCurrencyY} 
                  tickLine={false} axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Doanh thu" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <Activity className="h-8 w-8 opacity-20" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Không có dữ liệu doanh thu</span>
            </div>
          )}
        </div>
      </div>

      {/* Distribution Donut Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <h3 className="text-[18px] font-bold text-gray-900">Trạng thái đơn hàng</h3>
        <p className="text-[13px] text-gray-500 font-medium mb-6">Tỷ lệ phân bổ theo trạng thái</p>
        
        <div className="w-full relative h-[220px] flex-shrink-0">
          {totalOrders > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  animationDuration={1500}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      opacity={activeIndex === index || activeIndex === null ? 1 : 0.4}
                      className="transition-opacity duration-300 outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <Activity className="h-8 w-8 opacity-20" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Không có dữ liệu</span>
            </div>
          )}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-3xl font-black text-gray-900 block leading-none">{totalOrders}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">TỔNG ĐƠN</span>
          </div>
        </div>

        <div className="mt-6 space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {pieData.map((item, i) => (
            <div 
              key={i} 
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 ${
                activeIndex === i ? 'bg-gray-50 scale-[1.02]' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[13px] font-bold text-gray-600">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-black text-gray-900">{item.value}</span>
                <span className="text-[11px] font-bold text-gray-400">({totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(0) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts
