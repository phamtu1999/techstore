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
            width: 'minmax(200px, 1fr)',
            render: (_, row) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0 overflow-hidden">
                  {row.logoUrl ? <img src={row.logoUrl} alt={row.name} className="w-full h-full object-contain" /> : <Tag className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 text-[13px] truncate">{row.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium">ID: {row.id}</span>
                </div>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Trạng thái',
            align: 'center',
            width: '140px',
            render: (_, row) => (
              <AdminPill 
                label={row.active ? 'HIỂN THỊ' : 'ĐANG ẨN'} 
                type={row.active ? 'success' : 'danger'} 
              />
            )
          }
        ]}
        data={brands}
        isLoading={loading}
        showIndex={true}
        itemTitle="thương hiệu"
        onEdit={(row) => navigate(`/admin/brands/edit/${row.id}`)}
        onDelete={(row) => handleDelete(row.id, row.name)}
        onToggleStatus={(row) => handleToggleStatus(row.id, row.active)}
      />
    </div>
  );
};

export default BrandsTable;


