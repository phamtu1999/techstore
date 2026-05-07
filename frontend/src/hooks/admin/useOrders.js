import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../../store/slices/ordersSlice';
import api from '../../utils/axios';
import { useDebounce } from '../../hooks/useDebounce';
import { fireError, fireSuccess } from '../../utils/swalError';
import { getApiErrorMessage } from '../../utils/apiError';
import Swal from 'sweetalert2';
import { unwrapAdminResult } from './responseHelpers';

export const useOrders = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectRow = (id, checked) => {
    setSelectedRows(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
  };

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? orders.map(o => o.id) : []);
  };

  const fetchOrders = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/orders`, {
        params: {
          page,
          size: pagination.size,
          search: debouncedSearch,
          status: statusFilter || undefined
        }
      });
      const pageData = unwrapAdminResult(response.data.result);
      setOrders(pageData.items);
      setPagination(prev => ({
        ...prev,
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements,
        page: pageData.pageNumber
      }));
      setSummary(prev => ({ ...prev, totalOrders: pageData.totalElements }));
    } catch (error) {
      console.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.size, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get('/admin/analytics/dashboard');
      if (res.data?.result) {
        const stats = res.data.result;
        setSummary(prev => ({
          ...prev,
          totalRevenue: stats.totalRevenue || 0,
          pendingOrders: stats.orderStatusDistribution?.['PENDING'] || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch order summary:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrders(pagination.page);
  }, [fetchOrders, pagination.page]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const { value: status } = await Swal.fire({
      title: 'Cập nhật trạng thái đơn hàng',
      input: 'select',
      inputOptions: {
        'PENDING': 'Chờ xử lý',
        'CONFIRMED': 'Đã xác nhận',
        'PROCESSING': 'Đang xử lý',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'CANCELLED': 'Đã hủy'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy',
      customClass: {
        confirmButton: 'bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2 rounded-lg transition-all',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-6 py-2 rounded-lg transition-all'
      },
      buttonsStyling: false
    });

    if (status) {
      try {
        await dispatch(updateOrderStatus({ orderId, status })).unwrap();
        fireSuccess('Thành công', 'Trạng thái đơn hàng đã được cập nhật!');
        fetchOrders(pagination.page);
        fetchSummary();
      } catch (error) {
        fireError(error, 'Không thể cập nhật trạng thái');
      }
    }
  };

  const handleExportInvoice = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      fireError(error, 'Lỗi xuất hóa đơn');
    }
  };

  return {
    loading,
    orders,
    summary,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    pagination, setPagination,
    handleUpdateStatus,
    handleExportInvoice,
    fetchOrders
  };
};
