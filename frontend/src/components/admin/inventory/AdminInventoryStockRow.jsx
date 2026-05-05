import { memo } from 'react'
import { Package, ArrowRightLeft } from 'lucide-react'
import AdminPill from '../shared/AdminPill'

const AdminInventoryStockRow = ({
  variant,
  index,
  pagination,
  isFinanceVisible,
  formatCurrency,
  onAdjustStock,
}) => {
  const margin = variant.price > 0 && variant.costPrice > 0
    ? (((variant.price - variant.costPrice) / variant.price) * 100).toFixed(1)
    : 0

  const getStockPill = (qty) => {
    if (qty <= 0) return <AdminPill label="Hết hàng" type="danger" />
    if (qty <= 20) return <AdminPill label="Sắp hết" type="warning" />
    return <AdminPill label="Sẵn sàng" type="success" />
  }

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-8 py-5 text-[11px] font-black text-gray-400">
        {pagination.page * pagination.size + index + 1}
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
            {variant.imageUrl ? (
              <img src={variant.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <div className="font-black text-gray-900 leading-tight uppercase tracking-tight line-clamp-1">{variant.productName}</div>
            <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
              <span className="text-primary-600">{variant.variantName}</span> • <span className="font-mono">#{variant.sku}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-gray-900">{variant.stockQuantity}</span>
          </div>
          {getStockPill(variant.stockQuantity)}
        </div>
      </td>
      {isFinanceVisible && (
        <td className="px-8 py-5">
          <p className="text-[14px] font-bold text-pink-600">{formatCurrency(variant.costPrice)}</p>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Giá nhập</p>
        </td>
      )}
      {isFinanceVisible && (
        <td className="px-8 py-5 text-center">
          <div className={`text-lg font-black ${parseFloat(margin) > 30 ? 'text-emerald-500' : 'text-primary-600'}`}>
            {margin}%
          </div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Biên lợi nhuận</p>
        </td>
      )}
      <td className="px-8 py-5 text-right">
        <button
          onClick={() => onAdjustStock(variant)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-primary-600 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Sửa kho
        </button>
      </td>
    </tr>
  )
}

export default memo(AdminInventoryStockRow)
