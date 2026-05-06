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
  handleToggleStatus
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
          />
        </div>
        <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
          Hiển thị {users.length} / {pagination.totalElements} người dùng
        </div>
      </div>

      <AdminTable 
        columns={[
          {
            key: 'user',
            label: 'Người dùng',
            render: (_, row) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm border border-primary-100 shrink-0">
                  {row.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 text-[14px] truncate">{row.fullName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 truncate">{row.email}</span>
                    <AdminPill 
                      label={(row.roles && row.roles[0] === 'ROLE_SUPER_ADMIN') ? 'S-ADMIN' : (row.roles && row.roles[0] === 'ROLE_ADMIN') ? 'ADMIN' : 'USER'} 
                      type={(row.roles && row.roles[0]?.includes('ADMIN')) ? 'primary' : 'success'} 
                      size="xs" 
                    />
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'contact',
            label: 'Liên hệ',
            render: (_, row) => (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
                  <Phone className="w-3 h-3 text-gray-400" /> {row.phone || 'Chưa cập nhật'}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Calendar className="w-3 h-3" /> {new Date(row.createdAt).toLocaleDateString('vi-VN')}
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
                 label={row.status === 'LOCKED' ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'} 
                 type={row.status === 'LOCKED' ? 'danger' : 'success'} 
                 size="sm" 
               />
             )
          }
        ]}
        data={users}
        isLoading={loading}
        showIndex={true}
        itemTitle="người dùng"
        actions={(row, closeDropdown) => (
          <div className="space-y-1">
            <button 
              onClick={() => { handleChangePassword(row.id); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <KeyRound className="h-4 w-4 text-primary-500" /> Đổi mật khẩu
            </button>
            <button 
              onClick={() => { handleUpdateRole(row.id, row.role); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <ShieldAlert className="h-4 w-4 text-orange-500" /> Cập nhật quyền
            </button>
            <button 
              onClick={() => { handleToggleStatus(row); closeDropdown?.() }}
              className={`w-full px-4 py-2.5 text-left text-[13px] font-bold flex items-center gap-3 transition-colors ${row.status === 'LOCKED' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
            >
              {row.status === 'LOCKED' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {row.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
            </button>
          </div>
        )}
        renderMobileCard={(row, index, renderActions) => (
          <div key={row.id || index} className="p-3 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-500/5 flex items-center justify-center text-primary-600 font-black text-sm border border-primary-100 dark:border-white/5 shrink-0">
                    {row.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-black text-gray-900 dark:text-white tracking-tight truncate">{row.fullName}</h4>
                      <AdminPill 
                        label={(row.roles && row.roles[0] === 'ROLE_SUPER_ADMIN') ? 'S-ADMIN' : (row.roles && row.roles[0] === 'ROLE_ADMIN') ? 'ADMIN' : 'USER'} 
                        type={(row.roles && row.roles[0]?.includes('ADMIN')) ? 'primary' : 'success'} 
                        size="xs" 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                       <AdminPill 
                         label={row.status === 'LOCKED' ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'} 
                         type={row.status === 'LOCKED' ? 'danger' : 'success'} 
                         size="xs" 
                       />
                       <span className="text-[10px] font-bold text-gray-400">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                {renderActions(row, index)}
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5">
                 <div className="flex flex-col items-center justify-center border-r border-gray-200/50 dark:border-white/5 last:border-0">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Đơn hàng</span>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-primary-500" />
                      <span className="text-[12px] font-black text-gray-900 dark:text-white">{row.totalOrders || 0}</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-center justify-center border-r border-gray-200/50 dark:border-white/5 last:border-0">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Chi tiêu</span>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-500" />
                      <span className="text-[12px] font-black text-gray-900 dark:text-white">{row.totalSpent?.toLocaleString('vi-VN') || 0}đ</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-center justify-center last:border-0">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Liên hệ</span>
                    <a href={`tel:${row.phone}`} className="p-1 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 active:scale-90 transition-transform">
                      <Phone className="w-3 h-3 text-primary-600" />
                    </a>
                 </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleChangePassword(row.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-500/5 px-3 py-2 rounded-xl active:scale-95 transition-all uppercase tracking-wider"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  PW
                </button>
                <button 
                  onClick={() => handleUpdateRole(row.id, row.role)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-500/5 px-3 py-2 rounded-xl active:scale-95 transition-all uppercase tracking-wider"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  ROLE
                </button>
                <button 
                  onClick={() => handleToggleStatus(row)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black px-3 py-2 rounded-xl active:scale-95 transition-all uppercase tracking-wider ${row.status === 'LOCKED' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/5' : 'text-red-600 bg-red-50 dark:bg-red-500/5'}`}
                >
                  {row.status === 'LOCKED' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {row.status === 'LOCKED' ? 'OPEN' : 'LOCK'}
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

export default UsersTable;
