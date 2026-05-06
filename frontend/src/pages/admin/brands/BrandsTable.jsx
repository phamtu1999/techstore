import React from 'react';
import { Edit, Trash2, Tag, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../../../components/admin/AdminTable';
import AdminPill from '../../../components/admin/shared/AdminPill';

const BrandsTable = ({ brands, loading, handleDelete, handleToggleStatus }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <AdminTable 
        columns={[
          {
            key: 'brand',
            label: 'Thương hiệu',
            render: (_, row) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0 overflow-hidden">
                  {row.logoUrl ? <img src={row.logoUrl} alt={row.name} className="w-full h-full object-contain" /> : <Tag className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-[14px]">{row.name}</span>
                  <span className="text-[11px] text-gray-400">ID: {row.id}</span>
                </div>
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
        data={brands}
        isLoading={loading}
        showIndex={true}
        itemTitle="thương hiệu"
        actions={(row, closeDropdown) => (
          <div className="space-y-1">
            <button 
              onClick={() => { navigate(`/admin/brands/edit/${row.id}`); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Edit className="h-4 w-4 text-primary-500" /> Chỉnh sửa
            </button>
            <button 
              onClick={() => { handleToggleStatus(row.id, row.active); closeDropdown?.() }}
              className={`w-full px-4 py-2.5 text-left text-[13px] font-bold flex items-center gap-3 transition-colors ${row.active ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
            >
              {row.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {row.active ? 'Ẩn thương hiệu' : 'Hiện thương hiệu'}
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
                <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/5 shrink-0 overflow-hidden">
                   {row.logoUrl ? <img src={row.logoUrl} alt={row.name} className="w-full h-full object-contain" /> : <Tag className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-black text-gray-900 dark:text-white tracking-tight truncate">{row.name}</h4>
                  <div className="mt-1">
                    <AdminPill 
                      label={row.active ? 'HIỂN THỊ' : 'ĐANG ẨN'} 
                      type={row.active ? 'success' : 'danger'} 
                      size="xs" 
                    />
                  </div>
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

export default BrandsTable;


