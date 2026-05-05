import { memo } from 'react'
import { Package, ArrowRightLeft } from 'lucide-react'

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

  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-white/5 even:bg-gray-50/20 dark:even:bg-white/[0.02] transition-colors group">
      <td className="px-4 sm:px-8 py-5 text-xs font-black text-gray-400">
        {pagination.page * pagination.size + index + 1}
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border overflow-hidden flex-shrink-0">
            {variant.imageUrl ? <img src={variant.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="h-6 w-6" /></div>}
          </div>
          <div>
            <div className="font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight line-clamp-1">{variant.productName}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
              <span className="text-primary-500">{variant.variantName}</span> • <span className="font-mono">#{variant.sku}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-gray-900 dark:text-white">{variant.stockQuantity}</span>
          </div>
          {variant.stockQuantity <= 0 ? (
            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit">Hết hàng</span>
          ) : variant.stockQuantity <= 20 ? (
            <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit animate-pulse">Sắp hết</span>
          ) : (
            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit">Sẵn sàng</span>
          )}
        </div>
      </td>
      {isFinanceVisible && (
        <td className="px-8 py-5">
          <p className="text-sm font-bold text-pink-600 font-mono tracking-tighter">{formatCurrency(variant.costPrice)}</p>
          <p className="text-[9px] font-black uppercase text-gray-400">Giá nhập</p>
        </td>
      )}
      {isFinanceVisible && (
        <td className="px-8 py-5 text-center">
          <div className={`text-lg font-black ${parseFloat(margin) > 30 ? 'text-emerald-500' : 'text-primary-500'}`}>
            {margin}%
          </div>
        </td>
      )}
      <td className="px-8 py-5 text-right">
        <button
          onClick={() => onAdjustStock(variant)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <ArrowRightLeft className="h-3 w-3" />
          Sửa kho
        </button>
      </td>
    </tr>
  )
}

export default memo(AdminInventoryStockRow)
