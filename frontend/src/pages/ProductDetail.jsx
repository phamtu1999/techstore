import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, clearCurrentProduct } from '../store/slices/productsSlice'
import { addToCart } from '../store/slices/cartSlice'
import { Star, ShoppingCart, Plus, Minus, CheckCircle, Truck, Shield, Store, ChevronRight, Gift, Zap, CreditCard, Award, X } from 'lucide-react'
import Toast from '../components/Toast'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'
import ProductCard from '../components/ProductCard'
import WishlistButton from '../components/WishlistButton'
import { addToRecentlyViewed } from '../components/RecentlyViewed'
import {
  getProductGalleryImages,
  getProductImageSources,
  handleProductImageError,
} from '../utils/productImageFallback'
import { Rotate3d } from 'lucide-react'
import React, { Suspense, lazy } from 'react'

const Product3DViewer = lazy(() => import('../components/products/Product3DViewer'))

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentProduct, isLoading, products: allProducts } = useSelector((state) => state.products)
  const { isLoading: isCartLoading } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const [selectedImage, setSelectedImage] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [toast, setToast] = useState(null)
  const [show3D, setShow3D] = useState(false)
  
  const images = useMemo(
    () => (currentProduct ? getProductGalleryImages(currentProduct) : []),
    [currentProduct]
  )
  const { fallback: productImageFallback } = useMemo(
    () => getProductImageSources(currentProduct || {}),
    [currentProduct]
  )
  const brandName = currentProduct?.brand?.name || 'CHÍNH HÃNG'
  
  const variants = useMemo(() => currentProduct?.variants || [], [currentProduct])
  const uniqueSizes = useMemo(() => [...new Set(variants.map(v => v.size))].filter(Boolean), [variants])
  const uniqueColors = useMemo(() => [...new Set(variants.map(v => v.color))].filter(Boolean), [variants])

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  useEffect(() => {
    if (variants.length > 0) {
      setSelectedSize(variants[0].size || '')
      setSelectedColor(variants[0].color || '')
    }
  }, [variants])

  const currentVariant = useMemo(() => {
    return variants.find(v => v.size === selectedSize && v.color === selectedColor) || variants[0] || {}
  }, [variants, selectedSize, selectedColor])

  const price = currentVariant.price || 0
  const stockQuantity = currentVariant.stockQuantity || 0

  useEffect(() => {
    window.scrollTo(0, 0)
    dispatch(fetchProductById(slug))
    return () => {
      dispatch(clearCurrentProduct())
    }
  }, [dispatch, slug])

  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0])
    }
  }, [currentProduct, images])

  // Track recently viewed products
  useEffect(() => {
    if (currentProduct && currentProduct.id) {
      addToRecentlyViewed({
        id: currentProduct.id,
        name: currentProduct.name,
        slug: currentProduct.slug,
        imageUrls: images,
        variants: currentProduct.variants,
        rating: currentProduct.rating,
        reviewCount: currentProduct.reviewCount,
        soldCount: currentProduct.soldCount,
        discountPercentage: currentProduct.discountPercentage,
        isNew: currentProduct.isNew,
      })
    }
  }, [currentProduct, images])

  const handleAddToCart = async () => {
    if (!currentVariant.id || isCartLoading) return
    try {
      await dispatch(
        addToCart({
          productId: currentProduct.id,
          variantId: currentVariant.id,
          quantity,
        })
      ).unwrap()
      setToast({ message: 'Đã thêm sản phẩm vào giỏ hàng thành công!', type: 'success' })
    } catch (error) {
      setToast({ message: typeof error === 'string' ? error : (error.message || 'Không thể thêm vào giỏ hàng'), type: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-MAIN"></div>
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div className="text-center py-40">
        <Store className="h-16 w-16 mx-auto text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-400">Không tìm thấy sản phẩm</h2>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-4 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-[11px] sm:text-sm text-gray-400 mb-4 sm:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link to="/" className="hover:text-primary-MAIN transition-colors">Trang chủ</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-primary-MAIN transition-colors">Sản phẩm</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-secondary-800 font-medium truncate">{currentProduct.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-3 sm:space-y-6 lg:sticky lg:top-32 h-fit">
          <div className="group relative aspect-square bg-white rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center p-2.5 sm:p-4 transition-all hover:shadow-2xl">
            {show3D ? (
              <Suspense fallback={<div className="animate-pulse bg-gray-100 w-full h-full rounded-2xl flex items-center justify-center text-xs font-bold text-gray-400">Đang tải mô hình 3D...</div>}>
                <Product3DViewer type={
                  currentProduct.category?.slug?.includes('laptop') ? 'laptop' : 
                  (currentProduct.category?.slug?.includes('dong-ho') ? 'watch' : 'phone')
                } />
              </Suspense>
            ) : (
              <img
                src={selectedImage || images[0]}
                alt={currentProduct.name}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-8"
                onError={(e) => handleProductImageError(e, productImageFallback)}
              />
            )}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
               {currentProduct.discountPercentage > 0 && (
                 <div className="bg-red-600 text-white font-black px-4 py-2 rounded-2xl shadow-xl shadow-red-500/30 animate-bounce">
                   GIẢM {currentProduct.discountPercentage}%
                 </div>
               )}
               <div className="bg-secondary-800/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-2">
                 <Award className="h-3 w-3 text-amber-400" />
                 SẢN PHẨM CAO CẤP
               </div>
            </div>

            {/* 3D Toggle Button */}
            <button 
              onClick={() => setShow3D(!show3D)}
              className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${show3D ? 'bg-primary-600 text-white glow-primary' : 'bg-white text-secondary-900 shadow-black/10'}`}
            >
              <Rotate3d className={`h-4 w-4 ${show3D ? 'animate-spin-slow' : ''}`} />
              {show3D ? 'Thoát 3D' : 'Xem 360°'}
            </button>
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide justify-start sm:justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white ${
                    (selectedImage || images[0]) === img 
                      ? 'border-primary-MAIN shadow-lg ring-4 ring-primary-50 scale-105' 
                      : 'border-gray-100 hover:border-primary-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${currentProduct.name} ${idx + 1}`}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => handleProductImageError(e, productImageFallback)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               <div className="flex items-center gap-2">
                 <span className="px-3 py-1 bg-secondary-900 text-white rounded-lg text-[10px] font-black tracking-widest uppercase">
                   {brandName}
                 </span>
                 {stockQuantity > 0 ? (
                   <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black px-2.5 py-1 bg-emerald-50 rounded-lg uppercase tracking-wider">
                     <CheckCircle className="h-3 w-3" />
                     Còn hàng
                   </span>
                 ) : (
                   <span className="flex items-center gap-1 text-red-600 text-[10px] font-black px-2.5 py-1 bg-red-50 rounded-lg uppercase tracking-wider">
                     <X className="h-3 w-3" />
                     Hết hàng
                   </span>
                 )}
               </div>
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                  Mã SP: #TS-{currentProduct.id}
               </div>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-secondary-900 leading-[1.1] tracking-tight">
              {currentProduct.name}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
                   <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                   <span className="text-amber-900 font-black">{currentProduct.rating > 0 ? currentProduct.rating.toFixed(1) : 'Chưa có'}</span>
                </div>
                <span className="text-gray-400 font-bold text-sm underline cursor-pointer hover:text-primary-600">
                   {currentProduct.reviewCount || 0} đánh giá
                </span>
              </div>
              <div className="h-4 w-[1px] bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-bold text-sm">Đã bán:</span>
                <span className="text-secondary-900 font-black pr-1 tracking-tighter text-lg">{currentProduct.soldCount || 0}</span>
              </div>
              <div className="hidden lg:flex items-center gap-1 text-primary-600 animate-pulse">
                 <Zap className="h-4 w-4 fill-current" />
                 <span className="text-[10px] font-black uppercase tracking-wider">Sắp cháy hàng</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-5 sm:space-y-6">
              {uniqueSizes.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-black text-secondary-800 uppercase tracking-widest">Chọn dung lượng:</p>
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {uniqueSizes.map((s) => (
                      <button 
                        key={s} 
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm border-2 transition-all ${selectedSize === s ? 'border-primary-MAIN bg-primary-50 text-primary-MAIN' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                      >
                         {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {uniqueColors.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-black text-secondary-800 uppercase tracking-widest">Chọn màu sắc:</p>
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {uniqueColors.map((c) => (
                      <button 
                        key={c} 
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-[13px] border-2 transition-all flex items-center gap-2 ${selectedColor === c ? 'border-primary-MAIN bg-primary-50 text-primary-MAIN' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                      >
                         <div className={`w-3 h-3 rounded-full ${
                           c.toLowerCase().includes('titan') ? 'bg-amber-700' : 
                           (c.toLowerCase().includes('xanh') ? 'bg-blue-800' : 
                           (c.toLowerCase().includes('den') ? 'bg-gray-800' : 'bg-primary-500'))
                         }`}></div>
                         {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="price-box bg-white p-3 sm:p-2 rounded-[1.5rem] sm:rounded-[2rem] space-y-1">
            <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
              <p className="text-2xl sm:text-5xl font-black text-primary-MAIN tracking-tighter leading-none">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(price)}
              </p>
              {currentVariant.originalPrice > price ? (
                 <div className="flex flex-col mb-1">
                    <span className="text-gray-400 line-through font-bold text-lg opacity-60">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentVariant.originalPrice)}
                    </span>
                    <span className="text-red-600 font-black text-xs uppercase tracking-widest">
                       Tiết kiệm {Math.round(((currentVariant.originalPrice - price) / currentVariant.originalPrice) * 100)}%
                    </span>
                 </div>
              ) : (
                <div className="flex flex-col mb-1 text-gray-400 font-bold text-sm italic">Giá đã bao gồm VAT</div>
              )}
            </div>
          </div>

          {/* Offers Block - NEW */}
          <div className="bg-amber-50 rounded-3xl border-2 border-amber-100 p-6 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-primary-600" />
                <h3 className="font-black text-amber-900 uppercase text-xs tracking-widest">Đặc quyền mua hàng</h3>
             </div>
             <div className="space-y-3">
                <div className="flex items-start gap-3">
                   <div className="bg-white p-1.5 rounded-lg shadow-sm mt-0.5"><Zap className="h-3 w-3 text-amber-600" /></div>
                   <p className="text-sm font-semibold text-amber-800">Tặng Voucher giảm 20% cho lần mua phụ kiện tiếp theo</p>
                </div>
                <div className="flex items-start gap-3">
                   <div className="bg-white p-1.5 rounded-lg shadow-sm mt-0.5"><CreditCard className="h-3 w-3 text-amber-600" /></div>
                   <p className="text-sm font-semibold text-amber-800">Giảm thêm 1.000.000đ khi thanh toán qua thẻ TPBank</p>
                </div>
                <div className="flex items-start gap-3">
                   <div className="bg-white p-1.5 rounded-lg shadow-sm mt-0.5"><Award className="h-3 w-3 text-amber-600" /></div>
                   <p className="text-sm font-semibold text-amber-800">Ưu đãi Thu cũ Đổi mới trợ giá lên đến 2.000.000đ</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6 pt-2 sm:pt-4">
            <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
               <div className="qty-box flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100 h-14 sm:h-16 w-full sm:w-40 justify-between px-2 sm:px-3 flex-shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white rounded-xl hover:bg-gray-100 transition-colors text-secondary-800 shadow-sm disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg sm:text-xl font-black text-secondary-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white rounded-xl hover:bg-gray-100 transition-colors text-secondary-800 shadow-sm disabled:opacity-30"
                    disabled={quantity >= stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
               </div>
               
               <button
                  onClick={handleAddToCart}
                  disabled={stockQuantity === 0 || isCartLoading}
                  className="w-full sm:flex-1 h-14 sm:h-16 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 border-2 border-primary-MAIN bg-primary-50/30 text-primary-MAIN font-black text-xs sm:text-sm hover:bg-primary-50 transition-all uppercase tracking-widest no-hover-scale whitespace-nowrap px-4 disabled:opacity-50 shadow-sm"
               >
                  <ShoppingCart className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${isCartLoading ? 'animate-spin' : ''}`} />
                  {isCartLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
               </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={async () => {
                  await handleAddToCart()
                  if (!isCartLoading) navigate('/checkout')
                }}
                disabled={stockQuantity === 0 || isCartLoading}
                className="flex-1 bg-primary-MAIN h-14 sm:h-[72px] rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale no-hover-scale"
              >
                <span className="font-black text-lg sm:text-xl tracking-wide">MUA NGAY</span>
                <span className="text-[10px] font-bold opacity-80 uppercase text-center px-2">Giao hàng tận nơi hoặc Nhận tại cửa hàng</span>
              </button>
              <div className="flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-white/5 px-4 rounded-2xl border border-gray-100 dark:border-white/5">
                <WishlistButton 
                  productId={currentProduct.id} 
                  onToggle={() => !user && navigate('/login')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-8 mt-4">
             <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-50 shadow-sm">
                <Shield className="h-5 w-5 text-primary-MAIN" />
                <span className="text-[10px] font-black text-secondary-800 uppercase tracking-tight text-center">Bảo hành 12th</span>
             </div>
             <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Truck className="h-5 w-5 text-primary-MAIN" />
                <span className="text-[10px] font-black text-secondary-800 uppercase tracking-tight text-center">Giao nhanh 2h</span>
             </div>
             <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-50 shadow-sm">
                <CheckCircle className="h-5 w-5 text-primary-MAIN" />
                <span className="text-[10px] font-black text-secondary-800 uppercase tracking-tight text-center">CHÍNH HÃNG 100%</span>
             </div>
          </div>
        </div>
        </div>

      {/* Tabs Section */}
      <div className="mt-14 sm:mt-24 space-y-8 sm:space-y-12">
        <div className="flex items-center justify-start overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-gray-100 p-1.5 rounded-2xl flex flex-nowrap items-center gap-1 min-w-max">
            <button 
              onClick={() => setActiveTab('description')}
              className={`px-4 sm:px-6 md:px-8 py-3 text-xs sm:text-sm md:text-base font-black transition-all rounded-xl whitespace-nowrap ${activeTab === 'description' ? 'bg-white text-secondary-900 shadow-sm' : 'text-gray-500 hover:text-secondary-900'}`}
            >
              Mô tả sản phẩm
            </button>
            <button 
              onClick={() => setActiveTab('specifications')}
              className={`px-4 sm:px-6 md:px-8 py-3 text-xs sm:text-sm md:text-base font-black transition-all rounded-xl whitespace-nowrap ${activeTab === 'specifications' ? 'bg-white text-secondary-900 shadow-sm' : 'text-gray-500 hover:text-secondary-900'}`}
            >
              Thông số kỹ thuật
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-4 sm:px-6 md:px-8 py-3 text-xs sm:text-sm md:text-base font-black transition-all rounded-xl whitespace-nowrap ${activeTab === 'reviews' ? 'bg-white text-secondary-900 shadow-sm' : 'text-gray-500 hover:text-secondary-900'}`}
            >
              Đánh giá ({currentProduct.reviewCount || 120})
            </button>
          </div>
        </div>

        <div className="max-w-[900px] min-h-[400px]">
          {activeTab === 'description' && (
            <div className="description text-lg text-gray-700 leading-loose space-y-8 animate-fade-in">
                <div className="prose prose-orange max-w-none prose-p:font-medium text-gray-600">
                   {currentProduct.description || "Sản phẩm hiện đang được cập nhật mô tả chi tiết từ nhà sản xuất..."}
                </div>

                {/* Phân đoạn chính sách bổ sung để đỡ trống */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                   <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                          <Shield className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-gray-900">Chính sách bảo hành</h4>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        Bảo hành chính hãng 12 tháng tại các trung tâm bảo hành ủy quyền. Lỗi 1 đổi 1 trong 30 ngày nếu có lỗi từ nhà sản xuất.
                      </p>
                   </div>
                   <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                          <Truck className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-gray-900">Giao hàng tận nơi</h4>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        Miễn phí giao hàng cho đơn hàng từ 2.000.000đ. Giao nhanh trong 2h tại nội thành Hồ Chí Minh và Hà Nội.
                      </p>
                   </div>
                </div>

                <div className="bg-gradient-to-br from-secondary-900 to-black p-8 rounded-[2rem] border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                   <div>
                      <h4 className="font-black text-white text-xl mb-1 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary-500" />
                        Bạn cần tư vấn thêm?
                      </h4>
                      <p className="text-sm text-gray-400 font-bold">Đội ngũ chuyên gia của TECHZONE luôn sẵn sàng hỗ trợ 24/7</p>
                   </div>
                   <button className="bg-primary-MAIN text-white px-10 py-4 rounded-full font-black text-sm hover:scale-105 transition-all shadow-lg shadow-primary-500/20">GỌI CHO TÔI NGAY</button>
                </div>
              </div>
          )}
          {activeTab === 'specifications' && (
             <div className="animate-fade-in">
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                  <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-secondary-900 uppercase tracking-tight">Thông số chi tiết</h3>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentProduct.name}</div>
                  </div>
                  <table className="w-full text-sm">
                     <tbody>
                        {[
                           { icon: <Store className="h-4 w-4 text-gray-400" />, label: 'Thương hiệu', value: brandName },
                           { icon: <Zap className="h-4 w-4 text-gray-400" />, label: 'Dung lượng', value: '256GB' },
                           { icon: <Star className="h-4 w-4 text-gray-400" />, label: 'Màu sắc', value: 'Titan Tự Nhiên' },
                           { icon: <CheckCircle className="h-4 w-4 text-gray-400" />, label: 'Bản quốc tế', value: 'Có' },
                           { icon: <Shield className="h-4 w-4 text-gray-400" />, label: 'Bảo hành', value: '12 Tháng' },
                           { icon: <Award className="h-4 w-4 text-gray-400" />, label: 'Tình trạng', value: 'Mới 100%' }
                        ].map((item, idx) => (
                           <tr key={item.label} className="group hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0">
                              <td className="py-5 px-8 w-1/3">
                                 <div className="flex items-center gap-3">
                                   {item.icon}
                                   <span className="font-bold text-gray-500 border-b border-transparent group-hover:border-gray-300 transition-colors">{item.label}</span>
                                 </div>
                              </td>
                              <td className="py-5 px-8 font-black text-secondary-900">{item.value}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
             </div>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-12 animate-fade-in">
              {user && <ReviewForm productId={currentProduct.id} />}
              <ReviewList productId={currentProduct.id} />
            </div>
          )}
        </div>
      </div>
      {/* Related Products Section */}
      <section className="mt-32">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight">CÓ THỂ BẠN <span className="text-primary-600 italic">CŨNG THÍCH</span></h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Sản phẩm tương tự dành riêng cho bạn</p>
          </div>
          <Link to="/products" className="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-secondary-900 transition-colors">Xem tất cả</Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {(allProducts || [])
            .filter(p => p && p.id !== currentProduct.id && p.category?.id === currentProduct.category?.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          }
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ProductDetail
