import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'

const AdminLayout = () => {
  const { user } = useSelector((state: any) => state.auth)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const getPageTitle = (): string => {
    const path = location.pathname
    if (path === '/admin') return 'Dashboard'
    if (path.includes('/products')) return 'Sản phẩm'
    if (path.includes('/orders')) return 'Đơn hàng'
    if (path.includes('/inventory')) return 'Kho hàng'
    if (path.includes('/categories')) return 'Danh mục'
    if (path.includes('/brands')) return 'Thương hiệu'
    if (path.includes('/coupons')) return 'Mã giảm giá'
    if (path.includes('/livestreams')) return 'Livestream'
    if (path.includes('/analytics')) return 'Analytics'
    if (path.includes('/users')) return 'Người dùng'
    if (path.includes('/logs')) return 'Nhật ký'
    if (path.includes('/settings')) return 'Cài đặt'
    return 'Dashboard'
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onLogout={handleLogout} 
        />
        
        <main className={`flex-1 transition-all duration-300 w-full ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
          <Header
            title={getPageTitle()}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            username={user?.email || 'Admin'}
            role={user?.role}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
