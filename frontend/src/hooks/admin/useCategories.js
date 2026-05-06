import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';
import { fireError, fireSuccess } from '../../utils/swalError';
import Swal from 'sweetalert2';

export const useCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Xóa danh mục?',
      text: `Xóa "${name}" có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.`,
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
        await api.delete(`/admin/categories/${id}`);
        fireSuccess('Thành công', 'Danh mục đã được xóa!');
        fetchCategories();
      } catch (error) {
        fireError(error, 'Không thể xóa danh mục');
      }
    }
  };

  return {
    loading,
    categories,
    handleDelete,
    fetchCategories
  };
};
