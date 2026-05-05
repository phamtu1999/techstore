import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Settings,
  LogOut,
  Store,
  Moon,
  Sun,
  Video,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { useState, useEffect } from 'react'
import { settingsAPI } from '../../api/settings'
import { getApiErrorMessage } from '../../utils/apiError'

const AdminLayout = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [storeSettings, setStoreSettings] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsAPI.getSettings()
        setStoreSettings(response.data.result)
      } catch (error) {
        console.error(getApiErrorMessage(error))
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  const handleLogout = () => {
    dispatch(logout())
    window.location.href = '/login'
  }

  const rawMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/products', icon: Package, label: 'Sản phẩm', roles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng', roles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/inventory', icon: Package, label: 'Kho hàng', roles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/categories', icon: Tags, label: 'Danh mục', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/brands', icon: Tags, label: 'Thương hiệu', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/analytics', icon: LayoutDashboard, label: 'Analytics', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/livestreams', icon: Video, label: 'Livestream', roles: ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/users', icon: Users, label: 'Người dùng', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/coupons', icon: Tags, label: 'Mã giảm giá', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MANAGER'] },
    { path: '/admin/logs', icon: ClipboardList, label: 'Nhật ký', roles: ['ROLE_SUPER_ADMIN'] },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
  ]

  const menuItems = rawMenuItems.filter((item) => item.roles.includes(user?.role))

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const currentLabel = menuItems.find((item) => isActive(item.path))?.label || 'Dashboard'

  const formatRole = (role) => {
    if (role === 'ROLE_SUPER_ADMIN') return 'Super Admin'
    if (role === 'ROLE_ADMIN') return 'Administrator'
    if (role === 'ROLE_STAFF') return 'Staff'
    return 'Member'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="flex">
        <aside className="hidden lg:flex w-64 bg-[#0f172a] text-[#cbd5f5] border-r border-[#1e293b] min-h-screen fixed left-0 top-0 transition-colors duration-300 z-40 flex-col">
          <div className="p-6">
            <Link to="/" className="flex items-center gap-3 group" title="Về trang chủ">
              {storeSettings?.logoUrl ? (
                <img src={storeSettings.logoUrl} alt="Logo" className="h-10 w-10 rounded-xl object-contain bg-white shadow-md border border-gray-100" />
              ) : (
                <div className="h-10 w-10 bg-primary-MAIN rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <Store className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-white line-clamp-1">{storeSettings?.storeName || 'Tech Store'}</span>
            </Link>
          </div>

          <nav className="mt-4 px-4 text-left flex-1 overflow-y-auto">
            <div className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
            <div className="space-y-1 pb-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-br from-[#f97316] to-[#fb923c] text-white shadow-md'
                      : 'text-[#cbd5f5] hover:bg-[#1e293b] hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="mt-auto p-4 border-t border-[#1e293b]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-200 w-full font-bold"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[86vw] max-w-[320px] bg-[#0f172a] text-white shadow-2xl flex flex-col">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                  {storeSettings?.logoUrl ? (
                    <img src={storeSettings.logoUrl} alt="Logo" className="h-10 w-10 rounded-xl object-contain bg-white" />
                  ) : (
                    <div className="h-10 w-10 bg-primary-MAIN rounded-xl flex items-center justify-center">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <span className="font-black text-lg line-clamp-1">{storeSettings?.storeName || 'Tech Store'}</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
                      isActive(item.path)
                        ? 'bg-gradient-to-br from-[#f97316] to-[#fb923c] text-white shadow-md'
                        : 'text-[#cbd5f5] hover:bg-[#1e293b] hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-white/10 space-y-3">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span>{isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors font-bold"
                >
                  <LogOut className="h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 lg:ml-64 min-w-0">
          <header className="bg-white dark:bg-dark-card border-b border-border dark:border-dark-border sticky top-0 z-30 transition-colors duration-300">
            <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                  aria-label="Mở menu admin"
                >
                  <Menu className="h-6 w-6 text-text-primary dark:text-dark-text" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary dark:text-dark-text truncate">
                    {currentLabel}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-200"
                  title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-text-primary dark:text-dark-text" />
                  ) : (
                    <Moon className="h-5 w-5 text-text-primary dark:text-dark-text" />
                  )}
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-text-primary dark:text-dark-text">{user?.email || 'Admin'}</p>
                    <p className="text-xs text-text-secondary">{formatRole(user?.role)}</p>
                  </div>
                  <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary-MAIN rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                    {(user?.email || 'A').charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
