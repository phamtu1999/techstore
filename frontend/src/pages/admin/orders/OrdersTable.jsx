import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, FileText, ExternalLink, Calendar, User, Package, CreditCard, ShoppingBag, Truck, RefreshCw } from 'lucide-react';
import AdminTable from '../../../components/admin/AdminTable';
import AdminPagination from '../../../components/admin/shared/AdminPagination';
import AdminPill from '../../../components/admin/shared/AdminPill';

const getStatusLabel = (status) => {
  const map = {
    'PENDING': 'Chờ xử lý',
    'CONFIRMED': 'Đã xác nhận',
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
    'CONFIRMED': 'success',
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
  formatCurrency,
  selectedRows,
  handleSelectRow,
  handleSelectAll
}) => {
  const navigate = useNavigate();

  const bulkActions = (
    <>
      <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2">
        <FileText className="w-4 h-4" /> Xuất hàng loạt
      </button>
      <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2">
        <Truck className="w-4 h-4" /> Giao hàng loạt
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
            placeholder="Mã đơn, khách hàng, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border-none rounded-lg text-[12px] font-bold outline-none focus:ring-2 focus:ring-primary-600/20 transition-all cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao hàng</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden lg:block" />
          <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
            {orders.length} / {pagination.totalElements} ĐƠN HÀNG
          </div>
        </div>
      </div>

      <AdminTable 
        columns={[
          {
            key: 'orderNumber',
            label: 'Đơn hàng',
            width: '140px',
            render: (val) => <span className="font-mono font-black text-[13px] text-primary-600 tracking-tight">#{val}</span>
          },
          {
            key: 'receiver',
            label: 'Khách hàng',
            width: 'minmax(200px, 1.5fr)',
            render: (_, row) => (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 text-[13px] truncate">{row.receiverName}</span>
                <span className="text-[11px] text-gray-400 font-medium">{row.receiverPhone}</span>
              </div>
            )
          },
          {
            key: 'amount',
            label: 'Thanh toán',
            align: 'right',
            width: '160px',
            render: (_, row) => (
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-black text-gray-900">{formatCurrency(row.totalAmount)}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{row.paymentMethod}</span>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Trạng thái',
            align: 'center',
            width: '140px',
            render: (status) => (
              <AdminPill label={getStatusLabel(status)} type={getStatusType(status)} />
            )
          },
          {
            key: 'createdAt',
            label: 'Ngày đặt',
            align: 'right',
            width: '120px',
            render: (date) => (
              <div className="flex flex-col items-end">
                <span className="text-[12px] font-bold text-gray-700">{date ? format(new Date(date), 'dd/MM/yyyy', { locale: vi }) : '-'}</span>
                <span className="text-[10px] text-gray-400 font-medium">{date ? format(new Date(date), 'HH:mm', { locale: vi }) : '-'}</span>
              </div>
            )
          }
        ]}
        data={orders}
        isLoading={loading}
        showIndex={true}
        itemTitle="đơn hàng"
        currentPage={pagination.page}
        pageSize={pagination.size}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        bulkActions={bulkActions}
        actions={(row, closeDropdown) => (
          <>
            <button 
              onClick={() => { navigate(`/admin/orders/${row.id}`); closeDropdown?.() }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-blue-500" /> Xem chi tiết
            </button>
            <button 
              onClick={() => { handleUpdateStatus(row.id, row.status); closeDropdown?.() }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Truck className="h-4 w-4 text-orange-500" /> Đổi trạng thái
            </button>
            <button 
              onClick={() => { handleExportInvoice(row.id); closeDropdown?.() }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-t border-gray-50 mt-1"
            >
              <FileText className="h-4 w-4" /> Xuất hóa đơn (PDF)
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

export default OrdersTable;
