import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tags, 
  Users, 
  Settings,
  LogOut,
  Store,
  Home,
  Ticket,
  type LucideIcon
} from 'lucide-react'

interface MenuItem {
  path: string
  icon: LucideIcon
  label: string
  requiredRoles: string[]
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onLogout?: () => void
}

const menuItems: MenuItem[] = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', requiredRoles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/products', icon: Package, label: 'Sản phẩm', requiredRoles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/inventory', icon: Package, label: 'Kho hàng', requiredRoles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng', requiredRoles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/categories', icon: Tags, label: 'Danh mục', requiredRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/coupons', icon: Ticket, label: 'Mã giảm giá', requiredRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/livestreams', icon: LayoutDashboard, label: 'Livestreams', requiredRoles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/users', icon: Users, label: 'Người dùng', requiredRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/logs', icon: LayoutDashboard, label: 'Nhật ký', requiredRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  { path: '/admin/settings', icon: Settings, label: 'Cài đặt', requiredRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
]

const Sidebar = ({ isOpen, onClose, onLogout }: SidebarProps) => {
  const { user } = useSelector((state: any) => state.auth)
  const location = useLocation()

  const filteredMenuItems = menuItems.filter(item => 
    item.requiredRoles.includes(user?.role)
  )

  const isActive = (path: string): boolean => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={`
      w-20 lg:w-64 bg-white dark:bg-dark-card border-r border-border dark:border-dark-border h-screen fixed lg:sticky left-0 top-0 z-50 transition-all duration-300 flex flex-col
      ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="p-3 sm:p-4 lg:p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 mx-auto lg:mx-0 min-w-0" onClick={onClose} title="Về trang chủ">
          <div className="h-10 w-10 bg-primary-main rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg">
            <Store className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary dark:text-dark-text hidden lg:block tracking-tighter truncate">Tech Store</span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg">
          <Home className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 sm:px-4 overflow-y-auto custom-scrollbar">
        <div className="px-2 mb-2 text-xs font-semibold text-text-secondary dark:text-gray-500 uppercase tracking-wider">
          Menu
        </div>
        <div className="space-y-1.5 pb-20">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center lg:gap-3 px-3 py-3 rounded-xl transition-all duration-200 justify-center lg:justify-start ${
                isActive(item.path)
                  ? 'bg-primary-main text-white shadow-lg shadow-primary-main/20'
                  : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg dark:text-dark-text font-medium'
              }`}
              title={item.label}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="hidden lg:block truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 sm:p-4 mt-2 border-t border-border dark:border-dark-border flex flex-col gap-1.5 bg-white dark:bg-dark-card shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => {
            onClose()
            onLogout?.()
          }}
          className="flex items-center lg:gap-3 px-3 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 w-full justify-center lg:justify-start font-bold"
          title="Đăng xuất"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="hidden lg:block">Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
