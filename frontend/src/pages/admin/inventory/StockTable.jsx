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
      <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-4">
         <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm theo SKU hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
            />
         </div>
         <div className="flex items-center gap-4 w-full lg:w-auto">
            {stockFilter && (
              <button 
                onClick={() => setStockFilter('')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-red-100 transition-colors shrink-0"
              >
                Bỏ lọc: Sắp hết <Filter className="h-3 w-3" />
              </button>
            )}
            <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden lg:block" />
            <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Hiển thị {variants.length} / {totalElements} MÃ HÀNG
            </div>
         </div>
      </div>

      <AdminTable 
        columns={[
          {
            key: 'product',
            label: 'Sản phẩm & Biến thể',
            width: 'minmax(250px, 1fr)',
            render: (_, row) => (
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-gray-900 text-[13px] line-clamp-1">{row.productName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-400 truncate">{row.variantName}</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-gray-400 uppercase tracking-tighter shrink-0">{row.sku}</span>
                </div>
              </div>
            )
          },
          {
            key: 'stock',
            label: 'Tồn kho',
            align: 'right',
            width: '100px',
            render: (_, row) => (
              <div className="flex flex-col items-end">
                <span className={`text-[14px] font-black ${row.stockQuantity <= row.lowStockThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                  {row.stockQuantity}
                </span>
                {row.stockQuantity <= row.lowStockThreshold && (
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Sắp hết</span>
                )}
              </div>
            )
          },
          ...(isFinanceVisible ? [
            {
              key: 'finance',
              label: 'Giá vốn / Bán',
              align: 'right',
              width: '180px',
              render: (_, row) => (
                <div className="flex flex-col items-end">
                  <span className="text-[13px] font-bold text-emerald-600">{formatCurrency(row.costPrice)}</span>
                  <span className="text-[11px] font-medium text-gray-400 line-through opacity-70">{formatCurrency(row.price)}</span>
                </div>
              )
            },
            {
              key: 'margin',
              label: 'Biên LN',
              align: 'center',
              width: '100px',
              render: (_, row) => {
                const margin = row.price > 0 ? ((row.price - row.costPrice) / row.price * 100).toFixed(1) : 0;
                return (
                  <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">
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
          <>
            <button 
              onClick={() => { handleAdjustStock(row); closeDropdown?.() }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4 text-blue-500" /> Điều chỉnh kho
            </button>
            <button 
              onClick={() => { window.location.href = `/admin/products?search=${row.productName}`; closeDropdown?.() }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-50 mt-1"
            >
              <Package className="h-4 w-4 text-emerald-500" /> Xem sản phẩm
            </button>
          </>
        )}
      />

      <AdminPagination 
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.size}
        onPageChange={(p) => setPagination(prev => ({...prev, page: p}))}
        onPageSizeChange={(s) => setPagination(prev => ({...prev, size: s, page: 0}))}
      />
    </div>
  );
};

export default StockTable;


