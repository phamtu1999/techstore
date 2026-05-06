import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';
import { useDebounce } from '../../hooks/useDebounce';
import { fireError, fireSuccess } from '../../utils/swalError';
import { getApiErrorMessage } from '../../utils/apiError';
import Swal from 'sweetalert2';

export const useOrders = () => {
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

  const fetchOrders = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/orders`, {
        params: {
          page,
          size: pagination.size,
          search: debouncedSearch,
          status: statusFilter
        }
      });
      const data = response.data.result;
      setOrders(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        page: data.number
      }));
    } catch (error) {
      console.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.size, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/admin/orders/summary');
      setSummary(response.data.result || { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
    } catch (error) {
      console.error(error);
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
        await api.put(`/admin/orders/${orderId}/status`, { status });
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
