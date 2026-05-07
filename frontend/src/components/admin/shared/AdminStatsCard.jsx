import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const AdminStatsCard = ({ 
  title,
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  type = 'orange',
  onClick,
  isActive
}) => {
  const displayLabel = title || label;
  const colorMap = {
    primary: {
      bg: 'bg-primary-100',
      icon: 'text-primary-800',
    },
    success: {
      bg: 'bg-emerald-100',
      icon: 'text-emerald-800',
    },
    orange: {
      bg: 'bg-orange-100',
      icon: 'text-orange-800',
    },
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-800',
    },
    purple: {
      bg: 'bg-purple-100',
      icon: 'text-purple-800',
    },
    red: {
      bg: 'bg-rose-100',
      icon: 'text-rose-800',
    }
  }

  const styles = colorMap[type] || colorMap.orange

  return (
    <div 
      onClick={onClick}
      className={`
        bg-white p-6 rounded-2xl border transition-all duration-300 group
        ${onClick ? 'cursor-pointer' : ''}
        ${isActive 
          ? 'border-primary-500 shadow-lg shadow-primary-500/10 scale-[1.02] ring-2 ring-primary-500/5' 
          : 'border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01]'
        }
      `}
    >
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
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{displayLabel}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  )
}

export default AdminStatsCard
