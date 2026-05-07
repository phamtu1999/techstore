import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/user/Checkout'
import Orders from './pages/user/Orders'
import Wishlist from './pages/user/Wishlist'
import Notifications from './pages/user/Notifications'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Compare from './pages/Compare'
import Livestream from './pages/Livestream'
import LivestreamDetail from './pages/LivestreamDetail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Admin Pages
import Dashboard from './pages/admin/dashboard/Dashboard'
import AdminProducts from './pages/admin/products/AdminProducts'
import AdminProductForm from './pages/admin/products/AdminProductForm'
import AdminBrands from './pages/admin/brands/AdminBrands'
import AdminBrandForm from './pages/admin/brands/AdminBrandForm'
import AdminCategories from './pages/admin/categories/AdminCategories'
import AdminCategoryForm from './pages/admin/categories/AdminCategoryForm'
import Analytics from './pages/admin/analytics/Analytics'
import AdminUsers from './pages/admin/users/AdminUsers'
import AdminOrders from './pages/admin/orders/AdminOrders'
import AdminOrderDetail from './pages/admin/orders/AdminOrderDetail'
import AdminCoupons from './pages/admin/coupons/AdminCoupons'
import AdminSettings from './pages/admin/settings/AdminSettings'
import AdminInventory from './pages/admin/inventory/AdminInventory'
import AdminLivestreams from './pages/admin/livestreams/AdminLivestreams'
import AdminLogs from './pages/admin/logs/AdminLogs'

import Profile from './pages/user/Profile'
import OrbisNft from './pages/OrbisNft'
import PaymentResult from './pages/user/PaymentResult'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { syncOfflineCart } from './store/slices/cartSlice'
import ScrollToTop from './components/ScrollToTop'

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_STAFF'

  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online. Syncing cart...')
      dispatch(syncOfflineCart())
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [dispatch])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={user ? <Checkout /> : <Navigate to={`/login?redirect=${location.pathname}`} replace />} />
          <Route path="orders" element={user ? <Orders /> : <Navigate to={`/login?redirect=${location.pathname}`} replace />} />
          <Route path="profile" element={user ? <Profile /> : <Navigate to={`/login?redirect=${location.pathname}`} replace />} />
          <Route path="notifications" element={user ? <Notifications /> : <Navigate to={`/login?redirect=${location.pathname}`} replace />} />
          <Route path="compare" element={<Compare />} />
          <Route path="livestreams" element={<Livestream />} />
          <Route path="livestreams/:id" element={<LivestreamDetail />} />
          <Route path="orbis-nft" element={<OrbisNft />} />
          <Route path="payment-result" element={<PaymentResult />} />
          <Route path=":slug" element={<ProductDetail />} />
        </Route>
        
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to={`/login?redirect=${location.pathname}`} replace />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          
          <Route path="brands" element={<AdminBrands />} />
          <Route path="brands/add" element={<AdminBrandForm />} />
          <Route path="brands/edit/:id" element={<AdminBrandForm />} />

          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/add" element={<AdminCategoryForm />} />
          <Route path="categories/edit/:id" element={<AdminCategoryForm />} />
          
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="livestreams" element={<AdminLivestreams />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
