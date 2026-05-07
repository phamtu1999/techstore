import React from 'react';
import { Search, Edit, Trash2, Eye, EyeOff, Box, Tag, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../../../components/admin/AdminTable';
import AdminPagination from '../../../components/admin/shared/AdminPagination';
import AdminPill from '../../../components/admin/shared/AdminPill';

const ProductsTable = ({
  products,
  loading,
  categories,
  brands,
  searchTerm, setSearchTerm,
  categoryFilter, setCategoryFilter,
  brandFilter, setBrandFilter,
  pagination, setPagination,
  handleDeleteProduct,
  handleToggleStatus,
  selectedRows,
  handleSelectRow,
  handleSelectAll,
  formatCurrency
}) => {
  const navigate = useNavigate();

  const bulkActions = (
    <>
      <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2">
        <EyeOff className="w-4 h-4" /> Ẩn sản phẩm
      </button>
      <button className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2">
        <Trash2 className="w-4 h-4" /> Xóa đã chọn
      </button>
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border-none rounded-lg text-[12px] font-bold outline-none focus:ring-2 focus:ring-primary-600/20 transition-all cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select 
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border-none rounded-lg text-[12px] font-bold outline-none focus:ring-2 focus:ring-primary-600/20 transition-all cursor-pointer"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden lg:block" />
          <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
            {products.length} / {pagination.totalElements} SẢN PHẨM
          </div>
        </div>
      </div>

      <AdminTable 
        columns={[
          {
            key: 'product',
            label: 'Sản phẩm',
            width: 'minmax(300px, 2fr)',
            render: (_, row) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 p-1 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {row.imageUrls?.[0] ? (
                    <img src={row.imageUrls[0]} alt={row.name} className="w-full h-full object-contain" />
                  ) : (
                    <Box className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 text-[13px] truncate">{row.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tight"><Tag className="w-2.5 h-2.5" /> {row.brand?.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tight"><Layers className="w-2.5 h-2.5" /> {row.category?.name}</span>
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'price',
            label: 'Giá bán',
            align: 'right',
            width: '180px',
            render: (_, row) => (
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-black text-gray-900">
                  {formatCurrency(row.minPrice)}
                </span>
                {row.maxPrice > row.minPrice && (
                  <span className="text-[10px] text-gray-400 font-bold">đến {formatCurrency(row.maxPrice)}</span>
                )}
              </div>
            )
          },
          {
            key: 'stock',
            label: 'Tồn kho',
            align: 'center',
            width: '100px',
            render: (stock) => (
              <div className="flex flex-col items-center">
                <span className={`text-[13px] font-black ${stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>{stock}</span>
                {stock <= 10 && <span className="text-[8px] font-black text-red-500 uppercase leading-none mt-0.5">SẮP HẾT</span>}
              </div>
            )
          },
          {
            key: 'status',
            label: 'Trạng thái',
            align: 'center',
            width: '120px',
            render: (_, row) => (
              <AdminPill 
                label={row.active ? 'HIỂN THỊ' : 'ĐANG ẨN'} 
                type={row.active ? 'success' : 'danger'} 
              />
            )
          }
        ]}
        data={products}
        isLoading={loading}
        showIndex={true}
        itemTitle="sản phẩm"
        currentPage={pagination.page}
        pageSize={pagination.size}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        bulkActions={bulkActions}
        onEdit={(row) => navigate(`/admin/products/edit/${row.id}`)}
        onDelete={(row) => handleDeleteProduct(row.id, row.name)}
        onToggleStatus={(row) => handleToggleStatus(row.id, row.active)}
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

export default ProductsTable;


