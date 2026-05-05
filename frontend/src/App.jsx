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
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'
import Analytics from './pages/admin/Analytics'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminSettings from './pages/admin/AdminSettings'
import AdminInventory from './pages/admin/AdminInventory'
import AdminLivestreams from './pages/admin/AdminLivestreams'
import AdminBrands from './pages/admin/AdminBrands'
import AdminLogs from './pages/admin/AdminLogs'
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
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
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
