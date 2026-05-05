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
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/users', icon: Users, label: 'Người dùng', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    { path: '/admin/coupons', icon: Tags, label: 'Mã giảm giá', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MANAGER'] },
    { path: '/admin/logs', icon: ClipboardList, label: 'Nhật ký', roles: ['ROLE_SUPER_ADMIN'] },
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
    <div className="min-h-screen bg-admin-bg transition-colors duration-300 font-sans">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-[240px] bg-admin-sidebar text-gray-400 min-h-screen fixed left-0 top-0 z-40 flex-col shadow-xl">
          <div className="p-8">
            <Link to="/" className="flex items-center gap-3 group" title="Về trang chủ">
              <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight italic">Tech Store</span>
            </Link>
          </div>

          <nav className="mt-4 px-4 flex-1 overflow-y-auto custom-scrollbar">
            <div className="px-4 mb-4 text-[12px] font-semibold text-gray-500 uppercase tracking-[0.1em]">Quản trị</div>
            <div className="space-y-1.5 pb-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium text-[14px]">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="mt-auto p-6 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-200 w-full font-bold group"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-[14px]">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[280px] bg-admin-sidebar text-white shadow-2xl flex flex-col">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-xl italic tracking-tight">Tech Store</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 mt-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-white/5 space-y-3">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span>{isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-bold"
                >
                  <LogOut className="h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-[240px] min-w-0 min-h-screen">
          <header className="bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border sticky top-0 z-30 transition-colors duration-300 h-[72px] flex items-center">
            <div className="px-8 w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                  aria-label="Mở menu admin"
                >
                  <Menu className="h-6 w-6 text-gray-600 dark:text-dark-text" />
                </button>
                <div className="min-w-0">
                  <h1 className="admin-h1 truncate">
                    {currentLabel}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <button
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors duration-200"
                    title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                  >
                    {isDarkMode ? (
                      <Sun className="h-5 w-5 text-gray-600 dark:text-dark-text" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-600 dark:text-dark-text" />
                    )}
                  </button>
                </div>

                <div className="h-8 w-[1px] bg-gray-100"></div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-dark-text leading-tight">{user?.email?.split('@')[0] || 'Admin'}</p>
                    <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">{formatRole(user?.role)}</p>
                  </div>
                  <div className="h-10 w-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold border border-primary-100 shadow-sm relative group cursor-pointer">
                    {(user?.email || 'A').charAt(0).toUpperCase()}
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8 max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
