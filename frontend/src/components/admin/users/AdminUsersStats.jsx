import { memo } from 'react'

const AdminUsersStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-dark-card p-5 rounded-[1.75rem] shadow-sm border border-border dark:border-dark-border flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-text-primary dark:text-dark-text">{stat.value}</p>
          </div>
          <div className={`p-4 bg-${stat.color}-50 rounded-2xl`}>
            <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default memo(AdminUsersStats)
