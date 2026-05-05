import { Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react'

const OrderStats = ({ stats, statusFilter, setStatusFilter }) => {
  const cards = [
    { key: 'PENDING', label: 'Chờ xác nhận', count: stats.pending, color: 'text-yellow-600', ring: 'ring-yellow-500', icon: Clock },
    { key: 'CONFIRMED', label: 'Đã xác nhận', count: stats.confirmed, color: 'text-blue-600', ring: 'ring-blue-500', icon: CheckCircle },
    { key: 'SHIPPING', label: 'Đang giao', count: stats.shipping, color: 'text-indigo-600', ring: 'ring-indigo-500', icon: Truck },
    { key: 'DELIVERED', label: 'Đã giao', count: stats.delivered, color: 'text-green-600', ring: 'ring-green-500', icon: Package },
    { key: 'CANCELLED', label: 'Đã hủy', count: stats.cancelled, color: 'text-red-600', ring: 'ring-red-500', icon: XCircle },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div 
            key={card.key}
            className={`cursor-pointer rounded-[1.5rem] border bg-white dark:bg-dark-card border-border dark:border-dark-border p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${statusFilter === card.key ? `ring-2 ${card.ring}` : ''}`}
            onClick={() => setStatusFilter(statusFilter === card.key ? '' : card.key)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-text-secondary dark:text-gray-400 truncate">{card.label}</p>
                <p className={`text-2xl sm:text-3xl font-black ${card.color}`}>{card.count}</p>
              </div>
              <Icon className={`w-8 h-8 sm:w-9 sm:h-9 ${card.color.replace('text', 'text')}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OrderStats
