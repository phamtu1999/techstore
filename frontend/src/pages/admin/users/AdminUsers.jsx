import React from 'react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import { useUsers } from '../../hooks/admin/useUsers';
import UsersStats from './UsersStats';
import UsersTable from './UsersTable';

const AdminUsers = () => {
  const {
    loading,
    users,
    summary,
    searchTerm, setSearchTerm,
    pagination, setPagination,
    handleUpdateRole,
    handleChangePassword,
    handleToggleStatus
  } = useUsers();

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-24">
      <AdminPageHeader title="Quản lý người dùng" />

      <UsersStats summary={summary} />

      <UsersTable 
        users={users}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        pagination={pagination}
        setPagination={setPagination}
        handleUpdateRole={handleUpdateRole}
        handleChangePassword={handleChangePassword}
        handleToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default AdminUsers;
