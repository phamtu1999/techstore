import { Ticket, Calendar } from 'lucide-react'
import AdminTable from '../../../components/admin/AdminTable'
import AdminPill from '../../../components/admin/shared/AdminPill'
import { formatCurrency } from '../../../utils/format'

const CouponsTable = ({ 
    coupons, 
    isLoading, 
    selectedIds, 
    onSelectOne, 
    onSelectAll, 
    onEdit, 
    onDelete 
}) => {
    const couponColumns = [
        { 
          key: 'code', 
          label: 'Mã Coupon',
          render: (val) => (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-xl group-hover:scale-110 transition-transform">
                <Ticket className="h-5 w-5" />
              </div>
              <span className="font-black text-gray-900 uppercase tracking-widest text-[14px]">{val}</span>
            </div>
          )
        },
        { 
          key: 'discountValue', 
          label: 'Giảm giá',
          render: (val, row) => (
            <span className="font-black text-emerald-600 text-[15px]">
              {row.discountType === 'PERCENT' ? `${val}%` : formatCurrency(val)}
            </span>
          )
        },
        { 
          key: 'minPurchase', 
          label: 'Đơn tối thiểu',
          render: (val) => <span className="font-bold text-gray-600">{formatCurrency(val)}</span>
        },
        { 
          key: 'usedCount', 
          label: 'Lượt dùng',
          align: 'center',
          render: (val, row) => (
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-black text-gray-900">{val} / {row.usageLimit === 0 ? '∞' : row.usageLimit}</span>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Lượt dùng</span>
            </div>
          )
        },
        { 
          key: 'expirationDate', 
          label: 'Hết hạn',
          render: (val) => (
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
              <Calendar className="h-4 w-4" />
              {new Date(val).toLocaleDateString('vi-VN')}
            </div>
          )
        },
        { 
          key: 'active', 
          label: 'Trạng thái',
          align: 'center',
          render: (val) => (
            <AdminPill 
              label={val ? 'Hoạt động' : 'Vô hiệu'} 
              type={val ? 'success' : 'danger'} 
            />
          )
        }
    ]

    return (
        <AdminTable 
            columns={couponColumns} 
            data={coupons} 
            isLoading={isLoading}
            selectedRows={selectedIds}
            onSelectRow={(row) => onSelectOne(row.id)}
            onSelectAll={(e) => onSelectAll(e.target.checked)}
            showIndex={true}
            itemTitle="mã giảm giá"
            onEdit={onEdit}
            onDelete={(row) => onDelete(row.id)}
            renderMobileCard={(row, index, renderActions) => (
                <div key={row.id || index} className="p-3 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border animate-fade-in hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100 dark:border-primary-500/20">
                                    <Ticket className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-black text-gray-900 dark:text-white tracking-widest uppercase leading-none">
                                        {row.code}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-tighter">
                                            {row.discountType === 'PERCENT' ? `Giảm ${row.discountValue}%` : `Giảm ${formatCurrency(row.discountValue)}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {renderActions(row, index)}
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-2 px-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Đơn tối thiểu</span>
                                <span className="text-[13px] font-black text-gray-900 dark:text-white mt-0.5">
                                    {formatCurrency(row.minPurchase)}
                                </span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Hết hạn</span>
                                <div className="flex items-center justify-end gap-1.5 text-[12px] font-bold text-gray-600 dark:text-gray-300">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    {new Date(row.expirationDate).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-black text-gray-900 dark:text-white leading-none">
                                        {row.usedCount} / {row.usageLimit === 0 ? '∞' : row.usageLimit}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mt-1">Lượt dùng</span>
                                </div>
                            </div>
                            <AdminPill 
                                label={row.active ? 'Hoạt động' : 'Vô hiệu'} 
                                type={row.active ? 'success' : 'danger'} 
                                size="xs"
                            />
                        </div>
                    </div>
                </div>
            )}
        />
    )
}

export default CouponsTable


