import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';
import { useDebounce } from '../../hooks/useDebounce';
import { fireError, fireSuccess } from '../../utils/swalError';
import { getApiErrorMessage } from '../../utils/apiError';
import Swal from 'sweetalert2';
import { unwrapAdminResult } from './responseHelpers';

export const useProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [summary, setSummary] = useState({ totalProducts: 0, activeProducts: 0, lowStockProducts: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'active' | 'inactive' | ''
  const [stockFilter, setStockFilter] = useState('');   // 'low' | ''
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
    setSelectedRows(checked ? products.map(p => p.id) : []);
  };

  const fetchProducts = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/products`, {
        params: {
          page,
          size: pagination.size,
          q: debouncedSearch,
          category: categoryFilter || undefined,
          brand: brandFilter || undefined,
          active: statusFilter === 'active' ? true : (statusFilter === 'inactive' ? false : undefined),
          lowStock: stockFilter === 'low' ? true : undefined
        }
      });
      const pageData = unwrapAdminResult(response.data.result);
      setProducts(pageData.items);
      setPagination(prev => ({
        ...prev,
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements,
        page: pageData.pageNumber
      }));
      setSummary(prev => ({ ...prev, totalProducts: pageData.totalElements }));
    } catch (error) {
      console.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.size, categoryFilter, brandFilter, statusFilter, stockFilter]);

  const fetchFilters = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/brands')
      ]);
      setCategories(unwrapAdminResult(catRes.data.result).items);
      setBrands(unwrapAdminResult(brandRes.data.result).items);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get('/admin/analytics/dashboard');
      if (res.data?.result) {
        setSummary({
          totalProducts: res.data.result.totalProducts || 0,
          activeProducts: res.data.result.activeProducts || 0,
          lowStockProducts: res.data.result.lowStockProducts?.length || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch product summary:', error);
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
      await api.put(`/admin/products/${id}/status`);
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
    statusFilter, setStatusFilter,
    stockFilter, setStockFilter,
    pagination, setPagination,
    handleDeleteProduct,
    handleToggleStatus,
    fetchProducts
  };
};
