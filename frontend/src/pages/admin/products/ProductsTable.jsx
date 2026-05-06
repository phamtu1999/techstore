import React from 'react';
import { Search, Edit, Trash2, Eye, EyeOff, Box, Tag, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../../../components/admin/AdminTable';
import AdminPagination from '../../../components/admin/shared/AdminPagination';
import AdminPill from '../../../components/admin/shared/AdminPill';

const ProductsTable = ({
  products,
  loading,
  searchTerm,
  setSearchTerm,
  categories,
  brands,
  categoryFilter,
  setCategoryFilter,
  brandFilter,
  setBrandFilter,
  pagination,
  setPagination,
  handleDeleteProduct,
  handleToggleStatus,
  formatCurrency
}) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-primary-600/20 transition-all"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select 
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-primary-600/20 transition-all"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 hidden lg:block">
            {products.length} / {pagination.totalElements} sản phẩm
          </div>
        </div>
      </div>

      <AdminTable 
        columns={[
          {
            key: 'product',
            label: 'Sản phẩm',
            render: (_, row) => (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {row.imageUrls?.[0] ? (
                    <img src={row.imageUrls[0]} alt={row.name} className="w-full h-full object-contain" />
                  ) : (
                    <Box className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 text-[14px] truncate max-w-[200px]">{row.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1"><Tag className="w-3 h-3" /> {row.brand?.name}</span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1"><Layers className="w-3 h-3" /> {row.category?.name}</span>
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'price',
            label: 'Giá bán',
            render: (_, row) => (
              <span className="text-[14px] font-black text-gray-900">
                {row.minPrice === row.maxPrice ? formatCurrency(row.minPrice) : `${formatCurrency(row.minPrice)} - ${formatCurrency(row.maxPrice)}`}
              </span>
            )
          },
          {
            key: 'stock',
            label: 'Kho hàng',
            align: 'center',
            render: (stock) => (
              <div className="flex flex-col items-center">
                <span className={`text-[14px] font-black ${stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{stock}</span>
                {stock <= 5 && <span className="text-[8px] font-black text-red-500 uppercase">SẮP HẾT</span>}
              </div>
            )
          },
          {
            key: 'status',
            label: 'Trạng thái',
            align: 'center',
            render: (_, row) => (
              <AdminPill 
                label={row.active ? 'HIỂN THỊ' : 'ĐANG ẨN'} 
                type={row.active ? 'success' : 'danger'} 
                size="sm" 
              />
            )
          }
        ]}
        data={products}
        isLoading={loading}
        showIndex={true}
        itemTitle="sản phẩm"
        actions={(row, closeDropdown) => (
          <div className="space-y-1">
            <button 
              onClick={() => { navigate(`/admin/products/edit/${row.id}`); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Edit className="h-4 w-4 text-primary-500" /> Chỉnh sửa sản phẩm
            </button>
            <button 
              onClick={() => { handleToggleStatus(row.id, row.active); closeDropdown?.() }}
              className={`w-full px-4 py-2.5 text-left text-[13px] font-bold flex items-center gap-3 transition-colors ${row.active ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
            >
              {row.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {row.active ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
            </button>
            <button 
              onClick={() => { handleDeleteProduct(row.id, row.name); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-50 mt-1"
            >
              <Trash2 className="h-4 w-4" /> Xóa vĩnh viễn
            </button>
          </div>
        )}
        renderMobileCard={(row, index, renderActions) => (
          <div key={row.id || index} className="p-3 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-white/5 p-1 border border-gray-100 dark:border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {row.imageUrls?.[0] ? (
                      <img src={row.imageUrls[0]} alt={row.name} className="w-full h-full object-contain" />
                    ) : (
                      <Box className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[14px] font-black text-gray-900 dark:text-white tracking-tight truncate">{row.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <AdminPill 
                        label={row.active ? 'HIỂN THỊ' : 'ẨN'} 
                        type={row.active ? 'success' : 'danger'} 
                        size="xs" 
                      />
                      <span className="text-[11px] font-black text-primary-600">{formatCurrency(row.minPrice)}</span>
                    </div>
                  </div>
                </div>
                {renderActions(row, index)}
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5">
                 <div className="flex flex-col items-center justify-center border-r border-gray-200/50 dark:border-white/5 last:border-0">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Thương hiệu</span>
                    <span className="text-[11px] font-black text-gray-900 dark:text-white truncate max-w-full px-1">{row.brand?.name}</span>
                 </div>
                 <div className="flex flex-col items-center justify-center border-r border-gray-200/50 dark:border-white/5 last:border-0">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Danh mục</span>
                    <span className="text-[11px] font-black text-gray-900 dark:text-white truncate max-w-full px-1">{row.category?.name}</span>
                 </div>
                 <div className="flex flex-col items-center justify-center last:border-0">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Tồn kho</span>
                    <span className={`text-[12px] font-black ${row.totalStock <= 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{row.totalStock}</span>
                 </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { navigate(`/admin/products/edit/${row.id}`) }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-500/5 px-3 py-2 rounded-xl active:scale-95 transition-all uppercase tracking-wider"
                >
                  <Edit className="w-3.5 h-3.5" />
                  SỬA
                </button>
                <button 
                  onClick={() => handleToggleStatus(row.id, row.active)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black px-3 py-2 rounded-xl active:scale-95 transition-all uppercase tracking-wider ${row.active ? 'text-orange-600 bg-orange-50 dark:bg-orange-500/5' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/5'}`}
                >
                  {row.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {row.active ? 'ẨN' : 'HIỆN'}
                </button>
                <button 
                  onClick={() => handleDeleteProduct(row.id, row.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-500/5 px-3 py-2 rounded-xl active:scale-95 transition-all uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  XÓA
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

export default ProductsTable;


