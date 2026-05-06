import React from 'react';
import { Plus } from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import { useBrands } from '../../hooks/admin/useBrands';
import BrandsTable from './brands/BrandsTable';

const AdminBrands = () => {
  const { loading, brands, handleDelete, handleToggleStatus } = useBrands();

  const headerRight = (
    <button 
      onClick={() => window.location.href = '/admin/brands/add'}
      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
    >
      <Plus className="w-5 h-5" />
      <span>Thêm thương hiệu</span>
    </button>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6 pb-24">
      <AdminPageHeader 
        title="Quản lý thương hiệu" 
        rightContent={headerRight}
      />

      <BrandsTable 
        brands={brands}
        loading={loading}
        handleDelete={handleDelete}
        handleToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default AdminBrands;
