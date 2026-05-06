import React from 'react';
import AdminPageHeader from '../../../components/admin/shared/AdminPageHeader';
import { formatCurrency } from '../../../utils/format';
import { useOrders } from '../../../hooks/admin/useOrders';
import OrdersStats from './OrdersStats';
import OrdersTable from './OrdersTable';

const AdminOrders = () => {
  const {
    loading,
    orders,
    summary,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    pagination, setPagination,
    handleUpdateStatus,
    handleExportInvoice
  } = useOrders();

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-24">
      <AdminPageHeader title="Quản lý đơn hàng" />

      <OrdersStats 
        summary={summary} 
        formatCurrency={formatCurrency} 
      />

      <OrdersTable 
        orders={orders}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        pagination={pagination}
        setPagination={setPagination}
        handleUpdateStatus={handleUpdateStatus}
        handleExportInvoice={handleExportInvoice}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default AdminOrders;


