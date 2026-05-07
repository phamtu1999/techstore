import React from 'react'

const AdminPill = ({ 
  label, 
  type = 'info', 
  className = '' 
}) => {
  const types = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    primary: 'bg-orange-100 text-orange-800 border-orange-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${types[type] || types.info} ${className}`}>
      {label}
    </span>
  )
}

export default AdminPill
