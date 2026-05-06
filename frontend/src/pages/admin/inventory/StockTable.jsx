import React from 'react';
import { Search, Filter, ArrowRightLeft, Package } from 'lucide-react';
import AdminTable from '../../../components/admin/AdminTable';
import AdminPagination from '../../../components/admin/shared/AdminPagination';

const StockTable = ({ 
  variants, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  stockFilter, 
  setStockFilter, 
  totalElements, 
  isFinanceVisible, 
  formatCurrency,
  handleAdjustStock,
  selectedIds,
  setSelectedIds,
  pagination,
  setPagination
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm theo SKU hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
            />
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            {stockFilter && (
              <button 
                onClick={() => setStockFilter('')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-red-100 transition-colors"
              >
                Bỏ lọc: Sắp hết <Filter className="h-3 w-3" />
              </button>
            )}
            <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Hiển thị {variants.length} / {totalElements} mã hàng
            </div>
         </div>
      </div>

      <AdminTable 
        columns={[
          {
            key: 'product',
            label: 'Sản phẩm & Biến thể',
            render: (_, row) => (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-gray-900 text-[14px] line-clamp-1">{row.productName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-gray-500">{row.variantName}</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-gray-400 uppercase tracking-tighter">{row.sku}</span>
                </div>
              </div>
            )
          },
          {
            key: 'stock',
            label: 'Tồn kho',
            render: (_, row) => (
              <div className="flex flex-col">
                <span className={`text-[15px] font-black ${row.stockQuantity <= row.lowStockThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                  {row.stockQuantity}
                </span>
                {row.stockQuantity <= row.lowStockThreshold && (
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Sắp hết hàng</span>
                )}
              </div>
            )
          },
          ...(isFinanceVisible ? [
            {
              key: 'finance',
              label: 'Tài chính',
              render: (_, row) => (
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-emerald-600">{formatCurrency(row.costPrice)}</span>
                  <span className="text-[11px] font-medium text-gray-400">{formatCurrency(row.price)}</span>
                </div>
              )
            },
            {
              key: 'margin',
              label: 'Biên LN',
              align: 'center',
              render: (_, row) => {
                const margin = row.price > 0 ? ((row.price - row.costPrice) / row.price * 100).toFixed(1) : 0;
                return (
                  <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[11px] font-black">
                    {margin}%
                  </div>
                )
              }
            }
          ] : [])
        ]}
        data={variants}
        isLoading={loading}
        selectedRows={selectedIds}
        onSelectRow={(row) => {
          if (selectedIds.includes(row.id)) setSelectedIds(selectedIds.filter(i => i !== row.id))
          else setSelectedIds([...selectedIds, row.id])
        }}
        onSelectAll={(all) => {
          if (all) setSelectedIds(variants.map(v => v.id))
          else setSelectedIds([])
        }}
        showIndex={true}
        itemTitle="biến thể"
        actions={(row, closeDropdown) => (
          <div className="space-y-1">
            <button 
              onClick={() => { handleAdjustStock(row); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4 text-primary-500" /> Điều chỉnh kho
            </button>
            <button 
              onClick={() => { window.location.href = `/admin/products?search=${row.productName}`; closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <Package className="h-4 w-4 text-emerald-500" /> Xem sản phẩm
            </button>
          </div>
        )}
        renderMobileCard={(row, index, renderActions) => (
          <div key={row.id || index} className="p-2.5 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-black text-gray-900 dark:text-white tracking-tight leading-tight line-clamp-1">{row.productName}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-gray-400 truncate max-w-[100px]">{row.variantName}</span>
                    <span className="text-[8px] bg-gray-100 dark:bg-white/5 px-1 rounded font-mono font-black text-gray-400 uppercase tracking-tighter shrink-0">{row.sku}</span>
                  </div>
                </div>
                {renderActions(row, index)}
              </div>

              <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Tồn kho</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[13px] font-black ${row.stockQuantity <= row.lowStockThreshold ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {row.stockQuantity}
                    </span>
                    {row.stockQuantity <= row.lowStockThreshold && (
                      <div className="text-[7px] font-black text-red-500 bg-red-50 dark:bg-red-900/10 px-1 rounded border border-red-100/50">SẮP HẾT</div>
                    )}
                  </div>
                </div>
                {isFinanceVisible && (
                  <div className="flex flex-col text-right">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Giá vốn / Bán</span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                       <span className="text-[11px] font-black text-emerald-600">{formatCurrency(row.costPrice).replace('₫', '')}</span>
                       <span className="text-[9px] font-bold text-gray-400">{formatCurrency(row.price).replace('₫', '')}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAdjustStock(row)}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-500/5 px-2 py-1.5 rounded-lg active:scale-95 transition-all uppercase tracking-wider"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  NHẬP/XUẤT
                </button>
                <button 
                  onClick={() => { window.location.href = `/admin/products?search=${row.productName}` }}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-black text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1.5 rounded-lg active:scale-95 transition-all uppercase tracking-wider"
                >
                  <Package className="w-3 h-3" />
                  XEM SP
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {!loading && pagination.totalPages > 1 && (
          <AdminPagination 
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPagination(prev => ({...prev, page: p}))}
          />
      )}
    </div>
  );
};

export default StockTable;
