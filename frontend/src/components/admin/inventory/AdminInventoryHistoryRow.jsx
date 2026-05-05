import { memo } from 'react'
import { Plus, Minus } from 'lucide-react'

const getTransactionLabel = (type) => {
  switch (type) {
    case 'IMPORT': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Nhập kho</span>
    case 'EXPORT': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Xuất bán</span>
    case 'RETURN': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Trả hàng</span>
    case 'DAMAGED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Hủy hàng</span>
    case 'ADJUSTMENT': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Điều chỉnh</span>
    default: return type
  }
}

const AdminInventoryHistoryRow = ({ log, index }) => {
  const isPositive = log.transactionType === 'IMPORT' || log.transactionType === 'RETURN'

  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-white/5 even:bg-gray-50/20 dark:even:bg-white/[0.02] transition-colors">
      <td className="px-4 sm:px-8 py-5 text-xs font-black text-gray-400">
        {index + 1}
      </td>
      <td className="px-8 py-5">
        <div className="text-sm font-bold text-gray-900 dark:text-white">{new Date(log.createdAt).toLocaleString('vi-VN')}</div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: #{log.id}</div>
      </td>
      <td className="px-8 py-5">
        <div>{getTransactionLabel(log.transactionType)}</div>
        <div className="text-[10px] font-black text-gray-500 mt-1 uppercase tracking-widest font-mono">{log.sku}</div>
      </td>
      <td className="px-8 py-5">
        <div className={`flex items-center gap-1 font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          {log.quantity}
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="font-black text-gray-900 dark:text-white text-lg">{log.balanceAfter}</div>
      </td>
      <td className="px-8 py-5">
        <div className="text-sm text-gray-500 font-medium italic line-clamp-1 max-w-[200px]" title={log.note}>"{log.note || '---'}"</div>
        <div className="text-[9px] text-gray-400 font-bold uppercase mt-1 truncate max-w-[150px]">Ref: {log.referenceNumber || 'N/A'}</div>
      </td>
    </tr>
  )
}

export default memo(AdminInventoryHistoryRow)
