import { memo } from 'react'
import { Plus, Minus } from 'lucide-react'
import AdminPill from '../shared/AdminPill'

const getTransactionPill = (type) => {
  switch (type) {
    case 'IMPORT': return <AdminPill label="Nhập kho" type="success" />
    case 'EXPORT': return <AdminPill label="Xuất bán" type="info" />
    case 'RETURN': return <AdminPill label="Trả hàng" type="warning" />
    case 'DAMAGED': return <AdminPill label="Hủy hàng" type="danger" />
    case 'ADJUSTMENT': return <AdminPill label="Điều chỉnh" type="gray" />
    default: return <AdminPill label={type} type="info" />
  }
}

const AdminInventoryHistoryRow = ({ log, index }) => {
  const isPositive = log.transactionType === 'IMPORT' || log.transactionType === 'RETURN'

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-8 py-5 text-[12px] font-black text-gray-400">
        {index + 1}
      </td>
      <td className="px-8 py-5">
        <div className="text-[14px] font-bold text-gray-900">{new Date(log.createdAt).toLocaleString('vi-VN')}</div>
        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">ID: #{log.id}</div>
      </td>
      <td className="px-8 py-5">
        <div>{getTransactionPill(log.transactionType)}</div>
        <div className="text-[11px] font-black text-gray-500 mt-1 uppercase tracking-widest font-mono">{log.sku}</div>
      </td>
      <td className="px-8 py-5">
        <div className={`flex items-center gap-1 font-black text-[15px] ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          {log.quantity}
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="font-black text-gray-900 text-[18px]">{log.balanceAfter}</div>
      </td>
      <td className="px-8 py-5">
        <div className="text-[13px] text-gray-500 font-medium italic line-clamp-1 max-w-[200px]" title={log.note}>"{log.note || '---'}"</div>
        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 truncate max-w-[150px]">Ref: {log.referenceNumber || 'N/A'}</div>
      </td>
    </tr>
  )
}

export default memo(AdminInventoryHistoryRow)
