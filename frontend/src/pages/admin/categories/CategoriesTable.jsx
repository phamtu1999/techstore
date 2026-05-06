import React from 'react';
import { Edit, Trash2, Layers } from 'lucide-react';
import AdminTable from '../../../components/admin/AdminTable';

const CategoriesTable = ({ categories, loading, handleDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <AdminTable 
        columns={[
          {
            key: 'category',
            label: 'Danh mục',
            render: (_, row) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100 shrink-0 overflow-hidden">
                  {row.imageUrl ? <img src={row.imageUrl} alt={row.name} className="w-full h-full object-contain" /> : <Layers className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-[14px]">{row.name}</span>
                  <span className="text-[11px] text-gray-400">ID: {row.id}</span>
                </div>
              </div>
            )
          },
          {
            key: 'description',
            label: 'Mô tả',
            render: (val) => <span className="text-[13px] text-gray-500 line-clamp-1">{val || 'Không có mô tả'}</span>
          },
          {
            key: 'status',
            label: 'Trạng thái',
            align: 'center',
            render: (val) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${val ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {val ? 'HIỂN THỊ' : 'ĐANG ẨN'}
              </span>
            )
          }
        ]}
        data={categories}
        isLoading={loading}
        showIndex={true}
        itemTitle="danh mục"
        actions={(row, closeDropdown) => (
          <div className="space-y-1">
            <button 
              onClick={() => { window.location.href = `/admin/categories/edit/${row.id}`; closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Edit className="h-4 w-4 text-primary-500" /> Chỉnh sửa
            </button>
            <button 
              onClick={() => { handleDelete(row.id, row.name); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-50 mt-1"
            >
              <Trash2 className="h-4 w-4" /> Xóa vĩnh viễn
            </button>
          </div>
        )}
        renderMobileCard={(row, index, renderActions) => (
          <div key={row.id || index} className="p-3 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-500/5 flex items-center justify-center text-primary-600 border border-primary-100 dark:border-white/5 shrink-0 overflow-hidden">
                  {row.imageUrl ? <img src={row.imageUrl} alt={row.name} className="w-full h-full object-contain" /> : <Layers className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-black text-gray-900 dark:text-white tracking-tight truncate">{row.name}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{row.description || 'Không có mô tả'}</p>
                </div>
              </div>
              {renderActions(row, index)}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default CategoriesTable;
