import React from 'react';
import { TrendingUp, AlertTriangle, Package } from 'lucide-react';
import AdminStatsCard from '../../../components/admin/shared/AdminStatsCard';

const InventoryStats = ({ summary, isFinanceVisible, stockFilter, toggleLowStockFilter, totalElements, formatCurrency }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
      {isFinanceVisible ? (
        <>
          <div className="col-span-2 md:col-span-1">
            <AdminStatsCard 
              title="Tổng giá trị kho"
              value={formatCurrency(summary.totalValue)}
              icon={TrendingUp}
              type="orange"
            />
          </div>
          <div onClick={toggleLowStockFilter} className="cursor-pointer">
            <AdminStatsCard 
              title="Sắp hết hàng"
              value={`${summary.lowStockCount} mã`}
              icon={AlertTriangle}
              type={stockFilter === 'low-stock' ? 'orange' : 'success'}
            />
          </div>
        </>
      ) : (
        <div onClick={toggleLowStockFilter} className="col-span-1 cursor-pointer">
          <AdminStatsCard 
            title="Sắp hết hàng"
            value={`${summary.lowStockCount} mã`}
            icon={AlertTriangle}
            type={stockFilter === 'low-stock' ? 'orange' : 'success'}
          />
        </div>
      )}
      <AdminStatsCard 
        title="Tổng SKU"
        value={`${totalElements} mã`}
        icon={Package}
        type="blue"
      />
    </div>
  );
};

export default InventoryStats;


