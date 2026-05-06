import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';
import { fireError, fireSuccess } from '../../utils/swalError';
import Swal from 'sweetalert2';

export const useBrands = () => {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/brands');
      setBrands(response.data.result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Xóa thương hiệu?',
      text: `Xóa "${name}" có thể ảnh hưởng đến các sản phẩm thuộc thương hiệu này.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-6 py-2 rounded-lg'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/brands/${id}`);
        fireSuccess('Thành công', 'Thương hiệu đã được xóa!');
        fetchBrands();
      } catch (error) {
        fireError(error, 'Không thể xóa thương hiệu');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/brands/${id}/status`);
      fireSuccess('Thành công', currentStatus ? 'Thương hiệu đã được ẩn!' : 'Thương hiệu đã được hiển thị!');
      fetchBrands();
    } catch (error) {
      fireError(error, 'Lỗi cập nhật trạng thái');
    }
  };

  return {
    loading,
    brands,
    handleDelete,
    handleToggleStatus,
    fetchBrands
  };
};
