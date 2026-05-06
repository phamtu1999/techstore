import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Store, LayoutDashboard, Heart, Search, ChevronDown, Menu, X } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { logout } from '../store/slices/authSlice'
import NotificationDropdown from './NotificationDropdown'
import CompareBar from './CompareBar'
import ThemeToggle from './ThemeToggle'
import { settingsAPI } from '../api/settings'
import { productsAPI } from '../api/products'
import { getProductImageSources, handleProductImageError } from '../utils/productImageFallback'
import { fetchWishlist } from '../store/slices/wishlistSlice'
import ChatWidget from './chat/ChatWidget'

const Layout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)
  const { totalItems: wishlistCount } = useSelector((state) => state.wishlist)
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_STAFF';
  const [searchQuery, setSearchQuery] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [storeSettings, setStoreSettings] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

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
    if (user) {
      dispatch(fetchWishlist())
    }
  }, [dispatch, user])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          const response = await productsAPI.getAll({ 
            q: searchQuery, 
            limit: 6,
            active: true 
          })
          setSearchResults(response.data.result.content || [])
          setShowResults(true)
        } catch (error) {
          console.error(getApiErrorMessage(error))
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`)
      setShowResults(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.querySelector('input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSuggestionClick = (slug) => {
    navigate(`/${slug}`)
    setShowResults(false)
    setSearchQuery('')
  }

  const categories = [
    { name: 'Điện thoại', icon: '📱', path: '/products?category=phone' },
    { name: 'Laptop', icon: '💻', path: '/products?category=laptop' },
    { name: 'Tablet', icon: '📲', path: '/products?category=tablet' },
    { name: 'Phụ kiện', icon: '🎧', path: '/products?category=accessory' },
    { name: 'Đồng hồ', icon: '⌚', path: '/products?category=watch' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/95 backdrop-blur-2xl shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:bg-dark-bg/95 dark:border-dark-border">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col gap-3 md:grid md:grid-cols-12 md:items-center md:justify-between min-h-[72px] py-3 md:py-0">
            
            {/* Top row on mobile */}
            <div className="flex items-center justify-between gap-3 md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="shrink-0 p-2.5 -ml-1 text-secondary-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl transition-all"
              >
                <Menu className="h-6 w-6" />
              </button>

              <Link to="/" className="flex items-center gap-2 group no-hover-scale min-w-0 flex-1">
                {storeSettings?.logoUrl ? (
                  <img src={storeSettings.logoUrl} alt="Logo" className="h-8 w-8 rounded-xl object-contain bg-white shadow-sm border border-gray-100 p-1 shrink-0" />
                ) : (
                  <div className="bg-gradient-to-tr from-primary-MAIN to-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform shrink-0">
                    <Store className="h-5 w-5" />
                  </div>
                )}
                <span className="text-base font-black tracking-tight text-secondary-800 dark:text-white block truncate">
                  {storeSettings?.storeName || 'TECHZONE'}
                </span>
              </Link>

              <div className="flex items-center gap-1 shrink-0">
                <ThemeToggle />
                <Link 
                  to="/cart" 
                  className="p-2.5 text-gray-500 hover:text-primary-MAIN hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl transition-all relative"
                  title="Giỏ hàng"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-primary-MAIN rounded-full border-2 border-white dark:border-dark-bg text-[8px] font-black text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Left: Hamburger (Mobile) & Logo & Explore (Desktop) */}
            <div className="hidden md:flex w-auto md:col-span-3 items-center gap-2 sm:gap-6">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="xl:hidden p-2 -ml-2 text-secondary-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                <Menu className="h-6 w-6" />
              </button>

              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group no-hover-scale shrink-0">
                {storeSettings?.logoUrl ? (
                  <img src={storeSettings.logoUrl} alt="Logo" className="h-8 sm:h-10 max-w-[100px] sm:max-w-[120px] rounded-xl object-contain bg-white shadow-sm border border-gray-100 p-1" />
                ) : (
                  <div className="bg-gradient-to-tr from-primary-MAIN to-primary-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform">
                    <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                )}
                <span className="text-lg sm:text-xl font-black tracking-tighter text-secondary-800 dark:text-white block">
                  {storeSettings?.storeName || 'TECHZONE'}
                </span>
              </Link>

              <Link to="/products" className="hidden xl:flex items-center gap-1.5 text-secondary-800 dark:text-gray-300 font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary-MAIN transition-colors">
                 <span>Khám phá</span>
                 <ChevronDown className="h-3 w-3" />
              </Link>
            </div>

            {/* Center: Search (Unified & Wide) */}
            <div className="w-full md:col-span-6 relative order-3 md:order-none" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Hôm nay bạn muốn mua gì?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
                  className="w-full pl-11 sm:pl-14 pr-11 sm:pr-12 h-11 sm:h-12 bg-gray-50 dark:bg-dark-card border-2 border-transparent rounded-2xl focus:outline-none focus:border-primary-MAIN focus:bg-white dark:focus:bg-dark-bg transition-all duration-300 shadow-sm text-sm font-bold text-black dark:text-white placeholder:text-gray-400 placeholder:font-bold"
                />
                <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-primary-MAIN transition-colors" />
                
                {searchQuery && (
                   <button 
                     type="button"
                     onClick={() => { setSearchQuery(''); setShowResults(false); }}
                     className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400"
                   >
                     <X className="h-4 w-4" />
                   </button>
                )}

                {/* Trending Keywords (Desktop only) */}
                <div className="hidden lg:flex items-center gap-4 mt-2 px-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Gợi ý cho bạn:</span>
                   <div className="flex gap-3 overflow-x-auto scrollbar-none">
                      {['iPhone 15', 'MacBook M3', 'S24 Ultra', 'Bàn phím cơ', 'Tai nghe Sony'].map(kw => (
                        <button 
                          key={kw}
                          type="button"
                          onClick={() => { setSearchQuery(kw); navigate(`/products?search=${kw}`); }}
                          className="text-[10px] font-bold text-gray-500 hover:text-primary-MAIN transition-colors whitespace-nowrap"
                        >
                          #{kw}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Search Results Dropdown */}
                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-3 sm:mt-5 glass backdrop-blur-3xl rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.2)] overflow-hidden animate-scale-up z-[60]">
                    <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
                      {isSearching ? (
                        <div className="p-16 text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Đang tìm kiếm...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="p-4 space-y-1">
                          <div className="px-5 py-3 flex justify-between items-center bg-gray-50 dark:bg-white/5 rounded-2xl mb-2">
                             <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Sản phẩm gợi ý</p>
                             <span className="text-[10px] text-gray-500 font-bold uppercase">Tìm thấy {searchResults.length} kêt quả</span>
                          </div>
                          {searchResults.map((product) => {
                            const { primary: imageUrl, fallback: fallbackImageUrl } = getProductImageSources(product)
                            return (
                              <button
                                key={product.id}
                                onClick={() => handleSuggestionClick(product.slug)}
                                className="w-full flex items-center gap-5 p-3 hover:bg-gray-50 dark:hover:bg-white/10 rounded-2xl transition-all group text-left"
                              >
                                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 p-2 group-hover:scale-105 transition-transform duration-500">
                                  <img 
                                    src={imageUrl} 
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => handleProductImageError(e, fallbackImageUrl)}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-primary-MAIN transition-colors">
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-primary-MAIN font-black text-base tracking-tighter">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.variants?.[0]?.price)}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="p-10 text-center">
                           <p className="text-gray-500 font-bold">Không tìm thấy sản phẩm phù hợp</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right: Actions */}
            <div className="hidden md:flex w-auto md:col-span-3 items-center justify-end gap-3 sm:gap-4">
               {/* Search/Theme/Cart Group */}
               <div className="flex items-center gap-1.5 bg-gray-50/50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5">
                  <ThemeToggle />
                  
                  <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10 mx-1"></div>
                  
                  <Link 
                    to="/wishlist" 
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all relative group"
                    title="Yêu thích"
                  >
                    <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg text-[8px] font-black text-white flex items-center justify-center animate-bounce">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link 
                    to="/cart" 
                    className="p-2 text-gray-500 hover:text-primary-MAIN hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all relative group"
                    title="Giỏ hàng"
                  >
                    <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-MAIN rounded-full border-2 border-white dark:border-dark-bg text-[8px] font-black text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                        {totalItems}
                      </span>
                    )}
                  </Link>
               </div>

                {user ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-50/50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5">
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          className="p-2 text-gray-500 hover:text-primary-MAIN hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all group"
                          title="Quản trị"
                        >
                          <LayoutDashboard className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </Link>
                      )}
                      <NotificationDropdown />
                    </div>

                    <Link to="/profile" className="flex items-center gap-3 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 pl-1.5 pr-2 sm:pr-5 py-1.5 rounded-full hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/10 transition-all border-2 border-transparent hover:border-primary-500">
                       <div className="w-8 h-8 bg-white/20 dark:bg-secondary-900/10 rounded-full flex items-center justify-center font-black text-xs">
                          {(user.fullName || user.email)?.charAt(0).toUpperCase()}
                       </div>
                       <div className="hidden sm:block text-left">
                          <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{user.fullName || 'User'}</p>
                          <p className="text-[7px] font-bold opacity-60 uppercase mt-1">
                             {user.role?.replace('ROLE_', '')}
                          </p>
                       </div>
                    </Link>
                 </div>
               ) : (
                 <Link to="/login" className="bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 px-7 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-all shadow-lg shadow-black/20 active:scale-95">
                    Đăng nhập
                 </Link>
               )}
            </div>

          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className={`absolute top-0 left-0 w-[86vw] max-w-[340px] h-full bg-white dark:bg-dark-card shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-lg sm:text-xl font-black text-secondary-900 dark:text-white tracking-widest">MENU</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-8">
                    <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh mục</div>
                    {categories.map((cat, i) => (
                        <Link 
                            key={i} 
                            to={cat.path} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/10 rounded-2xl transition-all group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                            <span className="font-bold text-secondary-800 dark:text-gray-200">{cat.name}</span>
                        </Link>
                    ))}
                    
                    <div className="h-4"></div>
                    <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cửa hàng</div>
                    <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/10 rounded-2xl transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-MAIN flex items-center justify-center">
                            <Store className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-secondary-800 dark:text-gray-200">Tất cả sản phẩm</span>
                    </Link>
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/5">
                    {user ? (
                        <button onClick={handleLogout} className="w-full h-12 rounded-xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                            Đăng xuất
                        </button>
                    ) : (
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full h-14 rounded-2xl bg-secondary-900 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center active:scale-[0.98] transition-transform">
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 min-h-[calc(100vh-72px-300px)]">
        <div className="pb-24 sm:pb-6">
          <Outlet />
        </div>
        <CompareBar />
        <ChatWidget />
      </main>

      {/* Mobile Bottom Navigation - Sticky at the bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 px-6 py-3 z-[60] flex items-center justify-between shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
        <Link to="/" className="flex flex-col items-center gap-1 group">
          <div className="p-1 rounded-xl group-active:scale-90 transition-transform">
            <Store className="h-5 w-5 text-gray-400 group-hover:text-primary-MAIN" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-primary-MAIN">Trang chủ</span>
        </Link>
        <Link to="/products" className="flex flex-col items-center gap-1 group">
          <div className="p-1 rounded-xl group-active:scale-90 transition-transform">
            <Search className="h-5 w-5 text-gray-400 group-hover:text-primary-MAIN" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-primary-MAIN">Cửa hàng</span>
        </Link>
        <Link to="/cart" className="relative flex flex-col items-center gap-1 group -mt-8">
           <div className="w-14 h-14 bg-primary-MAIN rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 border-4 border-white dark:border-dark-bg group-active:scale-90 transition-transform">
              <ShoppingCart className="h-6 w-6 text-white" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-dark-bg">
                  {totalItems}
                </span>
              )}
           </div>
           <span className="text-[10px] font-black uppercase tracking-tighter text-primary-MAIN mt-1">Giỏ hàng</span>
        </Link>
        <Link to="/wishlist" className="flex flex-col items-center gap-1 group">
          <div className="p-1 rounded-xl group-active:scale-90 transition-transform relative">
            <Heart className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white dark:border-dark-bg"></span>
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-red-500">Yêu thích</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 group">
          <div className="p-1 rounded-xl group-active:scale-90 transition-transform">
            <User className="h-5 w-5 text-gray-400 group-hover:text-primary-MAIN" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-primary-MAIN">Tôi</span>
        </Link>
      </nav>

      <footer className="bg-secondary-900 text-white mt-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-5 sm:mb-6">
                {storeSettings?.logoUrl ? (
                  <img src={storeSettings.logoUrl} alt="Logo" className="h-10 rounded bg-white p-1" />
                ) : (
                   <div className="bg-primary-600 p-2 rounded-lg"><Store className="h-6 w-6" /></div>
                )}
                <span className="text-xl sm:text-2xl font-black">{storeSettings?.storeName || 'TECHZONE'}</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                Hệ thống bán lẻ thiết bị công nghệ hàng đầu, cam kết mang lại trải nghiệm mua sắm tuyệt vời và sản phẩm chính hãng 100%.
              </p>
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest mb-5 sm:mb-6 underline decoration-primary-MAIN decoration-4 underline-offset-8">Liên kết</h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-gray-400 text-sm font-bold sm:block sm:space-y-4">
                 <li className="hover:text-white transition-colors cursor-pointer">Về chúng tôi</li>
                 <li className="hover:text-white transition-colors cursor-pointer">Chính sách bảo mật</li>
                 <li className="hover:text-white transition-colors cursor-pointer">Điều khoản dịch vụ</li>
                 <li className="hover:text-white transition-colors cursor-pointer">Tuyển dụng</li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest mb-5 sm:mb-6 underline decoration-primary-MAIN decoration-4 underline-offset-8">Hỗ trợ</h3>
              <ul className="space-y-3 text-gray-400 text-sm font-bold">
                 <li>Email: {storeSettings?.supportEmail || 'support@techstore.com'}</li>
                 <li>Hotline: {storeSettings?.hotlinePhone || '1900 xxxx'}</li>
                 <li className="mt-4 leading-relaxed">{storeSettings?.address}</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5">
            <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-relaxed">&copy; 2024 TECHZONE PREMIUM STORE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
