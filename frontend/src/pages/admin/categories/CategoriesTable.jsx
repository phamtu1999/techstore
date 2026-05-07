import React from 'react';
import { Edit, Trash2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../../../components/admin/AdminTable';
import AdminPill from '../../../components/admin/shared/AdminPill';

const CategoriesTable = ({ categories, loading, handleDelete }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <AdminTable 
        columns={[
          {
            key: 'category',
            label: 'Danh mục',
            width: 'minmax(200px, 1fr)',
            render: (_, row) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100 shrink-0 overflow-hidden">
                  {row.imageUrl ? <img src={row.imageUrl} alt={row.name} className="w-full h-full object-contain" /> : <Layers className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 text-[13px] truncate">{row.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium">ID: {row.id}</span>
                </div>
              </div>
            )
          },
          {
            key: 'description',
            label: 'Mô tả',
            width: '2fr',
            render: (val) => <span className="text-[12px] text-gray-500 line-clamp-1">{val || 'Không có mô tả'}</span>
          },
          {
            key: 'status',
            label: 'Trạng thái',
            align: 'center',
            width: '140px',
            render: (val) => (
              <AdminPill 
                label={val ? 'HIỂN THỊ' : 'ĐANG ẨN'} 
                type={val ? 'success' : 'danger'} 
              />
            )
          }
        ]}
        data={categories}
        isLoading={loading}
        showIndex={true}
        itemTitle="danh mục"
        onEdit={(row) => navigate(`/admin/categories/edit/${row.id}`)}
        onDelete={(row) => handleDelete(row.id, row.name)}
      />
    </div>
  );
};

export default CategoriesTable;


