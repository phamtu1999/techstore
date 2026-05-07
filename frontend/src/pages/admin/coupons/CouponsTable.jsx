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
          width: 'minmax(180px, 1fr)',
          render: (val) => (
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg">
                <Ticket className="h-4 w-4" />
              </div>
              <span className="font-black text-gray-900 uppercase tracking-widest text-[13px]">{val}</span>
            </div>
          )
        },
        { 
          key: 'discountValue', 
          label: 'Giảm giá',
          align: 'right',
          width: '120px',
          render: (val, row) => (
            <span className="font-black text-emerald-600 text-[14px]">
              {row.discountType === 'PERCENT' ? `${val}%` : formatCurrency(val)}
            </span>
          )
        },
        { 
          key: 'minPurchase', 
          label: 'Đơn tối thiểu',
          align: 'right',
          width: '150px',
          render: (val) => <span className="font-bold text-gray-600 text-[12px]">{formatCurrency(val)}</span>
        },
        { 
          key: 'usedCount', 
          label: 'Sử dụng',
          align: 'center',
          width: '120px',
          render: (val, row) => (
            <div className="flex flex-col items-center">
              <span className="text-[13px] font-black text-gray-900">{val} / {row.usageLimit === 0 ? '∞' : row.usageLimit}</span>
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Lượt dùng</span>
            </div>
          )
        },
        { 
          key: 'expirationDate', 
          label: 'Hết hạn',
          width: '150px',
          render: (val) => (
            <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(val).toLocaleDateString('vi-VN')}
            </div>
          )
        },
        { 
          key: 'active', 
          label: 'Trạng thái',
          align: 'center',
          width: '120px',
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
        />
    )
}

export default CouponsTable;


