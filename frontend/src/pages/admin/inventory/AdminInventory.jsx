import React from 'react';
import { Package, History, Trash2, Download } from 'lucide-react';
import AdminPageHeader from '../../../components/admin/shared/AdminPageHeader';
import { formatCurrency } from '../../../utils/format';
import { useInventory } from '../../../hooks/admin/useInventory';
import InventoryStats from './InventoryStats';
import StockTable from './StockTable';
import HistoryTable from './HistoryTable';

const AdminInventory = () => {
  const {
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
    toggleLowStockFilter
  } = useInventory();

  const bulkActionBar = selectedIds.length > 0 && (
    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-[11px] font-black uppercase tracking-widest border border-primary-100">
        Đã chọn {selectedIds.length} biến thể
      </div>
      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa hàng loạt">
        <Trash2 className="h-5 w-5" />
      </button>
      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Xuất Excel">
        <Download className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-24">
      <AdminPageHeader 
        title="Kho hàng" 
        rightContent={bulkActionBar}
      />

      <InventoryStats 
        summary={summary}
        isFinanceVisible={isFinanceVisible}
        stockFilter={stockFilter}
        toggleLowStockFilter={toggleLowStockFilter}
        totalElements={pagination.totalElements}
        formatCurrency={formatCurrency}
      />

      <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${
            activeTab === 'stock' 
            ? 'bg-white text-primary-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          QUẢN LÝ TỒN KHO
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${
            activeTab === 'history' 
            ? 'bg-white text-primary-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          NHẬT KÝ BIẾN ĐỘNG
        </button>
      </div>

      {activeTab === 'stock' ? (
        <StockTable 
          variants={variants}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          totalElements={pagination.totalElements}
          isFinanceVisible={isFinanceVisible}
          formatCurrency={formatCurrency}
          handleAdjustStock={handleAdjustStock}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          pagination={pagination}
          setPagination={setPagination}
        />
      ) : (
        <HistoryTable 
          history={history}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AdminInventory;


