import React from 'react';
import { Search, KeyRound, ShieldAlert, Lock, Unlock, Mail, Phone, Calendar, ShoppingBag, CreditCard } from 'lucide-react';
import AdminTable from '../../../components/admin/AdminTable';
import AdminPagination from '../../../components/admin/shared/AdminPagination';
import AdminPill from '../../../components/admin/shared/AdminPill';

const UsersTable = ({
  users,
  loading,
  searchTerm,
  setSearchTerm,
  pagination,
  setPagination,
  handleUpdateRole,
  handleChangePassword,
  handleToggleStatus,
  selectedRows,
  handleSelectRow,
  handleSelectAll
}) => {
  const bulkActions = (
    <>
      <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" /> Đổi quyền hàng loạt
      </button>
      <button className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2">
        <Lock className="w-4 h-4" /> Khóa đã chọn
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
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
          />
        </div>
        <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden lg:block" />
        <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
          Hiển thị {users.length} / {pagination.totalElements} NGƯỜI DÙNG
        </div>
      </div>

      <AdminTable 
        columns={[
          {
            key: 'user',
            label: 'Người dùng',
            width: 'minmax(250px, 2fr)',
            render: (_, row) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm border border-primary-100 shrink-0 uppercase">
                  {row.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 text-[13px] truncate">{row.fullName}</span>
                  <span className="text-[11px] text-gray-400 font-medium truncate">{row.email}</span>
                </div>
              </div>
            )
          },
          {
            key: 'role',
            label: 'Quyền hạn',
            align: 'center',
            width: '120px',
            render: (_, row) => (
              <AdminPill 
                label={(row.roles && row.roles[0] === 'ROLE_SUPER_ADMIN') ? 'S-ADMIN' : (row.roles && row.roles[0] === 'ROLE_ADMIN') ? 'ADMIN' : 'USER'} 
                type={(row.roles && row.roles[0]?.includes('ADMIN')) ? 'primary' : 'success'} 
              />
            )
          },
          {
            key: 'contact',
            label: 'Liên hệ',
            width: '180px',
            render: (_, row) => (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-[12px] text-gray-700 font-bold">
                  <Phone className="w-3 h-3 text-gray-400" /> {row.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                  <Calendar className="w-3 h-3" /> {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                </div>
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
                 label={row.status === 'LOCKED' ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'} 
                 type={row.status === 'LOCKED' ? 'danger' : 'success'} 
               />
             )
          }
        ]}
        data={users}
        isLoading={loading}
        showIndex={true}
        itemTitle="người dùng"
        currentPage={pagination.page}
        pageSize={pagination.size}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        bulkActions={bulkActions}
        actions={(row, closeDropdown) => (
          <>
            <button 
              onClick={() => { handleChangePassword(row.id); closeDropdown?.() }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <KeyRound className="h-4 w-4 text-blue-500" /> Đổi mật khẩu
            </button>
            <button 
              onClick={() => { handleUpdateRole(row.id, row.role); closeDropdown?.() }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <ShieldAlert className="h-4 w-4 text-orange-500" /> Cập nhật quyền
            </button>
            <button 
              onClick={() => { handleToggleStatus(row); closeDropdown?.() }}
              className={`w-full px-4 py-2 text-left text-[13px] font-bold flex items-center gap-3 transition-colors border-t border-gray-50 mt-1 ${row.status === 'LOCKED' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
            >
              {row.status === 'LOCKED' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {row.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
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

export default UsersTable;


