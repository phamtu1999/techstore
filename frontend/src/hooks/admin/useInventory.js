import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/axios';
import Swal from 'sweetalert2';
import { useDebounce } from '../../hooks/useDebounce';
import { fireError, fireSuccess } from '../../utils/swalError';
import { getApiErrorMessage } from '../../utils/apiError';

const extractPaginatedPayload = (payload) => {
  const visited = new Set();
  const queue = [payload];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);

    if (Array.isArray(current)) {
      return { content: current, totalPages: 1, totalElements: current.length, number: 0 };
    }

    if (Array.isArray(current.content)) {
      return {
        content: current.content,
        totalPages: current.totalPages ?? current.page?.totalPages ?? 1,
        totalElements: current.totalElements ?? current.content.length,
        number: current.number ?? current.pageNumber ?? 0
      };
    }
    queue.push(current.result, current.data, current.page);
  }

  return { content: [], totalPages: 0, totalElements: 0, number: 0 };
};

export const useInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role;
  const isFinanceVisible = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState('stock');
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({ totalValue: 0, lowStockCount: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const fetchMainStats = useCallback(async () => {
    try {
      const [lowStockRes, valuationRes] = await Promise.all([
        api.get('/admin/inventory/low-stock'),
        isFinanceVisible ? api.get('/admin/inventory/valuation') : Promise.resolve({ data: { result: 0 } })
      ]);
      setSummary({
        lowStockCount: lowStockRes.data.result?.length || 0,
        totalValue: valuationRes.data.result || 0
      });
    } catch (error) {
      console.error(getApiErrorMessage(error));
    }
  }, [isFinanceVisible]);

  const fetchStock = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/inventory/variants`, {
        params: {
          page,
          size: pagination.size,
          search: debouncedSearch,
          filter: stockFilter
        }
      });
      const { content, totalPages, totalElements, number } = extractPaginatedPayload(response.data);
      setVariants(content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: totalPages || 0,
        totalElements: totalElements || 0,
        page: number || 0
      }));
    } catch (error) {
      console.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.size, stockFilter]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/inventory/history?size=25');
      setHistory(response.data.result?.content || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMainStats(); }, [fetchMainStats]);

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStock(pagination.page);
    } else {
      fetchHistory();
    }
  }, [activeTab, debouncedSearch, pagination.page, stockFilter, fetchStock, fetchHistory]);

  const handleAdjustStock = useCallback(async (variant) => {
    const { value: formValues } = await Swal.fire({
      title: 'Điều chỉnh kho hàng',
      html: `
        <div class="text-left mb-4">
          <p class="text-sm font-bold text-gray-600">Sản phẩm: ${variant.productName}</p>
          <p class="text-xs text-gray-400">Biến thể: ${variant.variantName} (${variant.sku})</p>
        </div>
        <div class="space-y-4">
           <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Loại giao dịch</label>
            <select id="swal-type" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-600">
              <option value="IMPORT">Nhập thêm hàng (+)</option>
              <option value="ADJUSTMENT">Cập nhật số lượng thực tế (=)</option>
              <option value="DAMAGED">Hủy hàng / Hỏng (-)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Số lượng</label>
            <input id="swal-quantity" type="number" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-600" placeholder="VD: 50">
          </div>
          ${isFinanceVisible ? `
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Giá vốn mới (Bỏ trống nếu không đổi)</label>
            <input id="swal-cost" type="number" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-600" placeholder="VD: 15000000">
          </div>
          ` : ''}
          <div>
            <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Ghi chú</label>
            <textarea id="swal-note" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-600" placeholder="Lý do thay đổi kho..."></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật ngay',
      cancelButtonText: 'Hủy bỏ',
      customClass: {
        confirmButton: 'bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary-600/20 transition-all',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-8 py-3 rounded-xl transition-all'
      },
      buttonsStyling: false,
      preConfirm: () => ({
        type: document.getElementById('swal-type').value,
        quantity: parseInt(document.getElementById('swal-quantity').value),
        costPrice: isFinanceVisible ? document.getElementById('swal-cost').value : null,
        note: document.getElementById('swal-note').value
      })
    });

    if (formValues) {
      try {
        await api.post('/admin/inventory/transaction', {
          variantId: variant.id,
          type: formValues.type,
          quantity: formValues.quantity,
          costPrice: formValues.costPrice || null,
          note: formValues.note,
          warehouse: 'Kho Chính'
        });
        fireSuccess('Thành công', 'Kho hàng đã được cập nhật!');
        fetchStock(pagination.page);
        fetchMainStats();
      } catch (error) {
        fireError(error, 'Không thể cập nhật kho');
      }
    }
  }, [isFinanceVisible, pagination.page, fetchStock, fetchMainStats]);

  const toggleLowStockFilter = useCallback(() => {
    setStockFilter(prev => prev === 'low-stock' ? '' : 'low-stock');
    setPagination(p => ({ ...p, page: 0 }));
  }, []);

  return {
    isFinanceVisible,
    activeTab, setActiveTab,
    loading,
    variants,
    history,
    summary,
    searchTerm, setSearchTerm,
    stockFilter, setStockFilter,
    selectedIds, setSelectedIds,
    pagination, setPagination,
    handleAdjustStock,
    toggleLowStockFilter,
    fetchStock
  };
};
