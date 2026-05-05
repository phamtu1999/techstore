import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const AdminStatsCard = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'orange' 
}) => {
  const colorMap = {
    green: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      trend: 'text-emerald-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      trend: 'text-orange-600'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      trend: 'text-blue-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      trend: 'text-purple-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      trend: 'text-red-600'
    }
  }

  const styles = colorMap[color] || colorMap.orange

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${styles.bg} rounded-xl ${styles.icon} transition-colors`}>
          <Icon className="h-6 w-6" />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-[12px] font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  )
}

export default AdminStatsCard
