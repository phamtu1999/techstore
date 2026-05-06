import React from 'react';
import { Users, UserPlus, ShieldCheck } from 'lucide-react';
import AdminStatsCard from '../../../components/admin/shared/AdminStatsCard';

const UsersStats = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
      <AdminStatsCard 
        title="Tổng người dùng"
        value={summary.totalUsers}
        icon={Users}
        type="primary"
      />
      <AdminStatsCard 
        title="Đăng ký mới (Tháng)"
        value={summary.newUsers}
        icon={UserPlus}
        type="success"
      />
      <AdminStatsCard 
        title="Đang hoạt động"
        value={summary.activeUsers}
        icon={ShieldCheck}
        type="orange"
      />
    </div>
  );
};

export default UsersStats;
