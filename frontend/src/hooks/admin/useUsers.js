import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';
import Swal from 'sweetalert2';
import { useDebounce } from '../../hooks/useDebounce';
import { fireError, fireSuccess } from '../../utils/swalError';
import { getApiErrorMessage } from '../../utils/apiError';

export const useUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalUsers: 0, newUsers: 0, activeUsers: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const fetchUsers = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users`, {
        params: {
          page,
          size: pagination.size,
          search: debouncedSearch
        }
      });
      const data = response.data.result;
      setUsers(data.content || []);
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
  }, [debouncedSearch, pagination.size]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/admin/users/summary');
      setSummary(response.data.result || { totalUsers: 0, newUsers: 0, activeUsers: 0 });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [fetchUsers, pagination.page]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleUpdateRole = async (userId, currentRole) => {
    const { value: role } = await Swal.fire({
      title: 'Thay đổi quyền hạn',
      input: 'select',
      inputOptions: {
        'ROLE_USER': 'Khách hàng (USER)',
        'ROLE_ADMIN': 'Quản trị viên (ADMIN)',
        'ROLE_SUPER_ADMIN': 'Quản trị tối cao (SUPER ADMIN)'
      },
      inputValue: currentRole,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy',
      customClass: {
        confirmButton: 'bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2 rounded-lg transition-all',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-6 py-2 rounded-lg transition-all'
      },
      buttonsStyling: false
    });

    if (role) {
      try {
        await api.put(`/admin/users/${userId}/role`, { role });
        fireSuccess('Thành công', 'Quyền hạn đã được cập nhật!');
        fetchUsers(pagination.page);
      } catch (error) {
        fireError(error, 'Không thể cập nhật quyền');
      }
    }
  };

  const handleChangePassword = async (userId) => {
    const { value: password } = await Swal.fire({
      title: 'Đặt lại mật khẩu',
      input: 'password',
      inputLabel: 'Mật khẩu mới',
      inputPlaceholder: 'Nhập mật khẩu mới...',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      customClass: {
        confirmButton: 'bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2 rounded-lg transition-all',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-6 py-2 rounded-lg transition-all'
      },
      buttonsStyling: false
    });

    if (password) {
      try {
        await api.put(`/admin/users/${userId}/password`, { password });
        fireSuccess('Thành công', 'Mật khẩu đã được thay đổi!');
      } catch (error) {
        fireError(error, 'Không thể đổi mật khẩu');
      }
    }
  };

  const handleToggleStatus = async (user) => {
    const isLocking = !user.locked;
    const result = await Swal.fire({
      title: isLocking ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?',
      text: isLocking ? `Bạn có chắc muốn khóa ${user.fullName}?` : `Mở khóa quyền truy cập cho ${user.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isLocking ? 'Khóa ngay' : 'Mở khóa',
      cancelButtonText: 'Hủy',
      customClass: {
        confirmButton: isLocking ? 'bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg' : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-lg',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-6 py-2 rounded-lg'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/users/${user.id}/status`, { locked: isLocking });
        fireSuccess('Thành công', isLocking ? 'Tài khoản đã bị khóa!' : 'Tài khoản đã được mở khóa!');
        fetchUsers(pagination.page);
      } catch (error) {
        fireError(error, 'Lỗi thao tác');
      }
    }
  };

  return {
    loading,
    users,
    summary,
    searchTerm, setSearchTerm,
    pagination, setPagination,
    handleUpdateRole,
    handleChangePassword,
    handleToggleStatus,
    fetchUsers
  };
};
