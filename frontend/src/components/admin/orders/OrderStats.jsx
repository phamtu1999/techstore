import { Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react'

const OrderStats = ({ stats, statusFilter, setStatusFilter }) => {
  const cards = [
    { key: 'PENDING', label: 'Chờ xác nhận', count: stats.pending, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-500', icon: Clock },
    { key: 'CONFIRMED', label: 'Đã xác nhận', count: stats.confirmed, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-500', icon: CheckCircle },
    { key: 'SHIPPING', label: 'Đang giao', count: stats.shipping, color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-500', icon: Truck },
    { key: 'DELIVERED', label: 'Đã giao', count: stats.delivered, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-500', icon: Package },
    { key: 'CANCELLED', label: 'Đã hủy', count: stats.cancelled, color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-500', icon: XCircle },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = statusFilter === card.key
        return (
          <div 
            key={card.key}
            className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
              isActive 
                ? `bg-white border-primary-600 ring-2 ring-primary-600/10 -translate-y-1` 
                : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
            }`}
            onClick={() => setStatusFilter(isActive ? '' : card.key)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-[12px] font-bold uppercase tracking-wider truncate transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                  {card.label}
                </p>
                <p className={`text-2xl font-black mt-1 ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                  {card.count}
                </p>
              </div>
              <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary-600 text-white' : `${card.bg} ${card.color} group-hover:scale-110`}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            
            {isActive && (
              <div className="mt-3 flex items-center gap-1.5 animate-fade-in">
                <div className="h-1 w-1 rounded-full bg-primary-600"></div>
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Đang lọc</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default OrderStats
