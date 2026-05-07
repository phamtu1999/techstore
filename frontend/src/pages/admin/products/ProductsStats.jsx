import React from 'react';
import { Package, CheckCircle, AlertTriangle } from 'lucide-react';
import AdminStatsCard from '../../../components/admin/shared/AdminStatsCard';

const ProductsStats = ({ 
  summary,
  statusFilter, setStatusFilter,
  stockFilter, setStockFilter
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
      <AdminStatsCard 
        title="Tổng sản phẩm"
        value={summary.totalProducts}
        icon={Package}
        type="primary"
        onClick={() => {
          setStatusFilter('');
          setStockFilter('');
        }}
        isActive={statusFilter === '' && stockFilter === ''}
      />
      <AdminStatsCard 
        title="Đang hiển thị"
        value={summary.activeProducts}
        icon={CheckCircle}
        type="success"
        onClick={() => {
          setStatusFilter(statusFilter === 'active' ? '' : 'active');
          setStockFilter('');
        }}
        isActive={statusFilter === 'active'}
      />
      <AdminStatsCard 
        title="Tồn kho thấp"
        value={summary.lowStockProducts}
        icon={AlertTriangle}
        type="orange"
        onClick={() => {
          setStockFilter(stockFilter === 'low' ? '' : 'low');
          setStatusFilter('');
        }}
        isActive={stockFilter === 'low'}
      />
    </div>
  );
};

export default ProductsStats;


