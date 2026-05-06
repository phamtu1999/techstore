import React from 'react';
import { Search, FileText, ExternalLink, Calendar, User, Package, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import AdminTable from '../../../components/admin/AdminTable';
import AdminPagination from '../../../components/admin/shared/AdminPagination';
import AdminPill from '../../../components/admin/shared/AdminPill';

const getStatusLabel = (status) => {
  const map = {
    'PENDING': 'Chờ xử lý',
    'PROCESSING': 'Đang xử lý',
    'SHIPPING': 'Đang giao hàng',
    'DELIVERED': 'Đã giao hàng',
    'CANCELLED': 'Đã hủy'
  };
  return map[status] || status;
};

const getStatusType = (status) => {
  const map = {
    'PENDING': 'warning',
    'PROCESSING': 'primary',
    'SHIPPING': 'orange',
    'DELIVERED': 'success',
    'CANCELLED': 'danger'
  };
  return map[status] || 'primary';
};

const OrdersTable = ({
  orders,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  pagination,
  setPagination,
  handleUpdateStatus,
  handleExportInvoice,
  formatCurrency
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Tìm theo mã đơn, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-primary-600/20 transition-all"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao hàng</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 hidden md:block">
            {orders.length} / {pagination.totalElements} đơn hàng
          </div>
        </div>
      </div>

      <AdminTable 
        columns={[
          {
            key: 'orderNumber',
            label: 'Mã đơn',
            render: (val) => <span className="font-mono font-bold text-[13px] text-primary-600">#{val}</span>
          },
          {
            key: 'receiver',
            label: 'Khách hàng',
            render: (_, row) => (
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-[14px] line-clamp-1">{row.receiverName}</span>
                <span className="text-[11px] text-gray-500">{row.receiverPhone}</span>
              </div>
            )
          },
          {
            key: 'amount',
            label: 'Tổng tiền',
            render: (_, row) => (
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-gray-900">{formatCurrency(row.totalAmount)}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{row.paymentMethod}</span>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Trạng thái',
            align: 'center',
            render: (status) => (
              <AdminPill label={getStatusLabel(status)} type={getStatusType(status)} size="sm" />
            )
          },
          {
            key: 'createdAt',
            label: 'Ngày đặt',
            render: (date) => (
              <div className="flex flex-col text-right md:text-left">
                <span className="text-[12px] font-bold text-gray-600">{new Date(date).toLocaleDateString('vi-VN')}</span>
                <span className="text-[10px] text-gray-400">{new Date(date).toLocaleTimeString('vi-VN')}</span>
              </div>
            )
          }
        ]}
        data={orders}
        isLoading={loading}
        showIndex={true}
        itemTitle="đơn hàng"
        actions={(row, closeDropdown) => (
          <div className="space-y-1">
            <button 
              onClick={() => { window.location.href = `/admin/orders/${row.id}`; closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary-500" /> Chi tiết đơn hàng
            </button>
            <button 
              onClick={() => { handleUpdateStatus(row.id, row.status); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Truck className="h-4 w-4 text-orange-500" /> Cập nhật trạng thái
            </button>
            <button 
              onClick={() => { handleExportInvoice(row.id); closeDropdown?.() }}
              className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
            >
              <FileText className="h-4 w-4" /> Xuất hóa đơn (PDF)
            </button>
          </div>
        )}
        renderMobileCard={(row, index, renderActions) => (
          <div key={row.id || index} className="p-3 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                     <span className="text-[11px] font-black text-primary-600 bg-primary-50 dark:bg-primary-500/5 px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">
                       #{row.orderNumber}
                     </span>
                     <h4 className="text-[14px] font-black text-gray-900 dark:text-white tracking-tight truncate flex-1">{row.receiverName}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <AdminPill label={getStatusLabel(row.status)} type={getStatusType(row.status)} size="xs" />
                    <span className="text-[9px] font-bold text-gray-400">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                {renderActions(row, index)}
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 px-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5">
                 <div className="flex flex-col">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Thanh toán</span>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[13px] font-black text-gray-900 dark:text-white">{formatCurrency(row.totalAmount)}</span>
                    </div>
                 </div>
                 <div className="flex flex-col text-right border-l border-gray-200/50 dark:border-white/5 pl-3">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Phương thức</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{row.paymentMethod}</span>
                 </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { window.location.href = `/admin/orders/${row.id}` }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-primary-600 bg-primary-50 dark:bg-primary-500/5 px-3 py-2 rounded-xl active:scale-95 transition-all uppercase tracking-wider"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  CHI TIẾT
                </button>
                <button 
                  onClick={() => handleExportInvoice(row.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-2 rounded-xl active:scale-95 transition-all uppercase tracking-wider"
                >
                  <FileText className="w-3.5 h-3.5" />
                  HÓA ĐƠN
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

export default OrdersTable;


