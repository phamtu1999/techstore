import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import { formatCurrency } from '../../utils/format';
import { useProducts } from '../../hooks/admin/useProducts';
import ProductsStats from './ProductsStats';
import ProductsTable from './ProductsTable';

const AdminProducts = () => {
  const {
    loading,
    products,
    categories,
    brands,
    summary,
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    brandFilter, setBrandFilter,
    pagination, setPagination,
    handleDeleteProduct,
    handleToggleStatus
  } = useProducts();

  const navigate = useNavigate();
  const headerRight = (
    <button 
      onClick={() => navigate('/admin/products/add')}
      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
    >
      <Plus className="w-5 h-5" />
      <span>Thêm sản phẩm</span>
    </button>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-24">
      <AdminPageHeader 
        title="Quản lý sản phẩm" 
        rightContent={headerRight}
      />

      <ProductsStats summary={summary} />

      <ProductsTable 
        products={products}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={categories}
        brands={brands}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        brandFilter={brandFilter}
        setBrandFilter={setBrandFilter}
        pagination={pagination}
        setPagination={setPagination}
        handleDeleteProduct={handleDeleteProduct}
        handleToggleStatus={handleToggleStatus}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default AdminProducts;
