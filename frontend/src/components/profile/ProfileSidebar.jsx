import { User, Package, MapPin, Heart, Lock, LogOut, ChevronRight, Camera, CreditCard, Bell } from 'lucide-react'

const ProfileSidebar = ({ profile, activeTab, setActiveTab, handleLogout }) => {
  const menuItems = [
    { 
      id: 'info', 
      icon: User, 
      label: 'Thông tin cá nhân',
      color: 'bg-blue-50 text-blue-600',
      activeColor: 'bg-white/20 text-white'
    },
    { 
      id: 'orders', 
      icon: Package, 
      label: 'Đơn hàng của tôi',
      color: 'bg-orange-50 text-orange-600',
      activeColor: 'bg-white/20 text-white'
    },
    { 
      id: 'addresses', 
      icon: MapPin, 
      label: 'Địa chỉ nhận hàng',
      color: 'bg-emerald-50 text-emerald-600',
      activeColor: 'bg-white/20 text-white'
    },
    { 
      id: 'wishlist', 
      icon: Heart, 
      label: 'Sản phẩm yêu thích',
      color: 'bg-rose-50 text-rose-600',
      activeColor: 'bg-white/20 text-white'
    },
    { 
      id: 'security', 
      icon: Lock, 
      label: 'Bảo mật tài khoản',
      color: 'bg-amber-50 text-amber-600',
      activeColor: 'bg-white/20 text-white'
    },
  ]

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden">
      {/* Header Info */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-50/50 to-white dark:from-white/5 dark:to-transparent border-b border-gray-100 dark:border-dark-border flex flex-col items-center">
        <div className="group relative mb-4">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-[2rem] border-4 border-white dark:border-dark-card shadow-2xl bg-white dark:bg-dark-bg flex items-center justify-center overflow-hidden">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} className="h-full w-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-3xl font-black">
                {profile?.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 bg-white dark:bg-dark-card p-2.5 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border text-primary-600 hover:scale-110 active:scale-95 transition-all">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white text-center leading-tight mb-1">{profile?.fullName}</h3>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest">
           ✨ Premium Member
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-3 sm:p-5 space-y-2">
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? item.activeColor : item.color
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={`font-black text-xs uppercase tracking-widest text-left truncate ${
                  isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 text-white animate-pulse" />}
            </button>
          )
        })}
        
        <div className="h-[1px] bg-gray-100 dark:bg-white/5 my-4 mx-4" />
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-black text-xs uppercase tracking-widest">Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

export default ProfileSidebar
