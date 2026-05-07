import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/shared/AdminPageHeader';
import { useCategories } from '../../../hooks/admin/useCategories';
import CategoriesTable from './CategoriesTable';

const AdminCategories = () => {
  const { loading, categories = [], handleDelete } = useCategories();
  const navigate = useNavigate();

  const headerRight = (
    <button 
      onClick={() => navigate('/admin/categories/add')}
      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
    >
      <Plus className="w-5 h-5" />
      <span>Thêm danh mục</span>
    </button>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6 pb-24">
      <AdminPageHeader 
        title="Quản lý danh mục" 
        rightContent={headerRight}
      />

      <CategoriesTable 
        categories={categories}
        loading={loading}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default AdminCategories;


