import React from 'react'

const AdminPill = ({ 
  label, 
  type = 'info', 
  className = '' 
}) => {
  const types = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    primary: 'bg-orange-50 text-orange-700 border-orange-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100'
  }

  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${types[type] || types.info} ${className}`}>
      {label}
    </span>
  )
}

export default AdminPill
