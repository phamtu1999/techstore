import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';
import { useDebounce } from '../../hooks/useDebounce';
import { fireError, fireSuccess } from '../../utils/swalError';
import { getApiErrorMessage } from '../../utils/apiError';
import Swal from 'sweetalert2';

export const useProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [summary, setSummary] = useState({ totalProducts: 0, activeProducts: 0, lowStockProducts: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const fetchProducts = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/products`, {
        params: {
          page,
          size: pagination.size,
          search: debouncedSearch,
          categoryId: categoryFilter,
          brandId: brandFilter
        }
      });
      const data = response.data.result;
      setProducts(data.content || []);
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
  }, [debouncedSearch, pagination.size, categoryFilter, brandFilter]);

  const fetchFilters = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/admin/categories/all'),
        api.get('/admin/brands/all')
      ]);
      setCategories(catRes.data.result || []);
      setBrands(brandRes.data.result || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/admin/products/summary');
      setSummary(response.data.result || { totalProducts: 0, activeProducts: 0, lowStockProducts: 0 });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchProducts(pagination.page);
  }, [fetchProducts, pagination.page]);

  useEffect(() => {
    fetchFilters();
    fetchSummary();
  }, [fetchFilters, fetchSummary]);

  const handleDeleteProduct = async (id, name) => {
    const result = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: `Bạn có chắc muốn xóa "${name}"? Hành động này không thể hoàn tác.`,
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
        await api.delete(`/admin/products/${id}`);
        fireSuccess('Thành công', 'Sản phẩm đã được xóa!');
        fetchProducts(pagination.page);
        fetchSummary();
      } catch (error) {
        fireError(error, 'Lỗi khi xóa sản phẩm');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/products/${id}/status`, { active: !currentStatus });
      fireSuccess('Thành công', currentStatus ? 'Sản phẩm đã được ẩn!' : 'Sản phẩm đã được hiển thị!');
      fetchProducts(pagination.page);
    } catch (error) {
      fireError(error, 'Lỗi cập nhật trạng thái');
    }
  };

  return {
    loading,
    products,
    categories,
    brands,
    summary,
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    brandFilter, setBrandFilter,
    pagination, setPagination,
    handleDeleteProduct,
    handleToggleStatus,
    fetchProducts
  };
};
