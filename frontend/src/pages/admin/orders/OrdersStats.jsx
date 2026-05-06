import React from 'react';
import { ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import AdminStatsCard from '../../../components/admin/shared/AdminStatsCard';

const OrdersStats = ({ summary, formatCurrency }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
      <AdminStatsCard 
        title="Tổng đơn hàng"
        value={summary.totalOrders}
        icon={ShoppingBag}
        type="primary"
      />
      <AdminStatsCard 
        title="Doanh thu (Tháng)"
        value={formatCurrency(summary.totalRevenue)}
        icon={TrendingUp}
        type="success"
      />
      <AdminStatsCard 
        title="Chờ xử lý"
        value={summary.pendingOrders}
        icon={Clock}
        type="orange"
      />
    </div>
  );
};

export default OrdersStats;
