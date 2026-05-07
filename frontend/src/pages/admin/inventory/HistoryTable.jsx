import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import AdminTable from '../../../components/admin/AdminTable';

const HistoryTable = ({ history, loading }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <AdminTable 
        columns={[
          {
            key: 'time',
            label: 'Thời gian',
            render: (_, row) => {
              if (!row.createdAt) return '-';
              const date = new Date(row.createdAt);
              const dateStr = date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
              const timeStr = date.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });
              return (
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-gray-900">{dateStr}</span>
                  <span className="text-[11px] text-gray-400">{timeStr}</span>
                </div>
              );
            }
          },
          {
            key: 'sku',
            label: 'Mã SKU',
            render: (sku) => <span className="font-mono font-bold text-[13px] text-primary-600">{sku}</span>
          },
          {
            key: 'type',
            label: 'Loại',
            render: (type) => (
              <span className={`px-2 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${
                type === 'IMPORT' ? 'bg-blue-50 text-blue-600' : 
                type === 'SALE' ? 'bg-emerald-50 text-emerald-600' : 
                type === 'DAMAGED' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {type === 'IMPORT' ? 'Nhập hàng' : 
                 type === 'SALE' ? 'Bán hàng' : 
                 type === 'DAMAGED' ? 'Hủy hàng' : 'Điều chỉnh'}
              </span>
            )
          },
          {
            key: 'quantity',
            label: 'Biến động',
            align: 'center',
            render: (qty) => (
              <span className={`text-[14px] font-black ${qty > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {qty > 0 ? `+${qty}` : qty}
              </span>
            )
          },
          {
            key: 'balance',
            label: 'Tồn cuối',
            align: 'center',
            render: (_, row) => <span className="text-[14px] font-black text-gray-900">{row.balanceAfter}</span>
          },
          {
            key: 'note',
            label: 'Ghi chú',
            render: (note) => <span className="text-[13px] text-gray-500 italic">{note || '-'}</span>
          }
        ]}
        data={history}
        isLoading={loading}
        showIndex={true}
        itemTitle="biến động"
        renderMobileCard={(row, index) => (
          <div key={row.id || index} className="p-2.5 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col flex-1 min-w-0">
                   <span className={`text-[9px] font-black uppercase tracking-widest ${
                    row.type === 'IMPORT' ? 'text-blue-600' : 
                    row.type === 'SALE' ? 'text-emerald-600' : 
                    row.type === 'DAMAGED' ? 'text-red-600' : 'text-orange-500'
                  }`}>
                    {row.type === 'IMPORT' ? 'NHẬP HÀNG' : 
                     row.type === 'SALE' ? 'BÁN HÀNG' : 
                     row.type === 'DAMAGED' ? 'HỦY HÀNG' : 'ĐIỀU CHỈNH'}
                  </span>
                  <span className="text-[12px] font-black text-gray-900 dark:text-white font-mono mt-0.5 truncate">{row.sku}</span>
                </div>
                <div className="text-right flex flex-col shrink-0">
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 leading-none">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '-'}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium mt-0.5">
                    {row.createdAt ? new Date(row.createdAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }) : '-'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Biến động</span>
                  <span className={`text-[13px] font-black mt-0.5 ${row.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Tồn cuối</span>
                  <span className="text-[13px] font-black text-gray-900 dark:text-white mt-0.5">{row.balanceAfter}</span>
                </div>
              </div>

              {row.note && (
                <div className="px-2.5 py-1.5 bg-amber-50/50 dark:bg-amber-900/5 border border-amber-100/50 dark:border-amber-900/10 rounded-lg">
                   <p className="text-[10px] text-amber-700 dark:text-amber-500 font-medium italic leading-relaxed line-clamp-2">
                     "{row.note}"
                   </p>
                </div>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default HistoryTable;


