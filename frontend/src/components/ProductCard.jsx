import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, ShoppingCart, GitCompare } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { addToCompare, removeFromCompare } from '../store/slices/comparisonSlice'
import Toast from './Toast'
import LazyImage from './LazyImage'
import { getProductImageSources } from '../utils/productImageFallback'
import WishlistButton from './WishlistButton'
import { useNavigate } from 'react-router-dom'

const ProductCard = ({ product, showBadge }) => {
  const dispatch = useDispatch()
  const { items: compareItems } = useSelector((state) => state.comparison)
  const { isLoading: isCartLoading } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const isComparing = compareItems.find(i => i.id === product.id)
  const [toast, setToast] = useState(null)

  const currentVariant = product.variants?.[0] || {}
  const price = product.price || currentVariant.price || 0

  const { primary: imageUrl, fallback: fallbackImageUrl } = getProductImageSources(product)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCartLoading) return
    
    try {
      const variantId = currentVariant.id || product.defaultVariantId
      
      if (!variantId) {
        throw new Error('Sản phẩm không có phiên bản hợp lệ')
      }

      await dispatch(addToCart({ 
        productId: product.id, 
        variantId: variantId,
        quantity: 1 
      })).unwrap()
      setToast({ message: 'Đã thêm vào giỏ hàng!', type: 'success' })
    } catch (error) {
      setToast({ message: typeof error === 'string' ? error : (error.message || 'Không thể thêm vào giỏ hàng'), type: 'error' })
    }
  }

  const handleCompare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isComparing) {
      dispatch(removeFromCompare(product.id))
      setToast({ message: 'Đã xóa khỏi danh sách so sánh', type: 'info' })
    } else {
      if (compareItems.length >= 4) {
        setToast({ message: 'Chỉ có thể so sánh tối đa 4 sản phẩm', type: 'warning' })
        return
      }
      dispatch(addToCompare(product))
      setToast({ message: 'Đã thêm vào danh sách so sánh', type: 'success' })
    }
  }

  // Format sold count like Shopee
  const formatSoldCount = (count) => {
    if (!count || count === 0) return 'Mới'
    if (count >= 1000) {
      return `Đã bán ${(count / 1000).toFixed(1)}k`
    }
    return `Đã bán ${count}`
  }

  return (
    <Link to={`/${product.slug}`} className="block group h-full">
      <div className="bg-white dark:bg-dark-card rounded-2xl sm:rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(234,88,12,0.3)] border border-gray-100 dark:border-dark-border flex flex-col h-full relative group/card">
        
        {/* Badges Overlay */}
        <div className="absolute left-0 top-2 z-10 flex flex-col gap-1 items-start">
            {product.discountPercentage > 0 && (
              <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-r-md shadow-md uppercase tracking-tighter flex items-center gap-1">
                GIẢM {product.discountPercentage}%
              </div>
            )}
            {showBadge === 'bestseller' && (
              <div className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-r-md shadow-md uppercase tracking-tighter flex items-center gap-1">
                🔥 BÁN CHẠY
              </div>
            )}
        </div>

        {/* Wishlist Button Overlay */}
        <div className="absolute right-3 top-3 z-10 transition-transform duration-300 group-hover/card:scale-110">
          <WishlistButton 
            productId={product.id} 
            onToggle={() => !user && navigate('/login')}
          />
        </div>

        {/* Image Container */}
        <div className="relative h-[180px] sm:h-[220px] w-full overflow-hidden bg-white dark:bg-black/10 flex items-center justify-center p-4">
          <LazyImage
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
            fallback={fallbackImageUrl}
          />
          
          {/* Quick View Overlay on Hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              XEM CHI TIẾT
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2">
          <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-800 dark:text-white line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
             <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-200 dark:text-dark-border'}`} />
                ))}
             </div>
             <div className="w-[1px] h-3 bg-gray-200"></div>
             <span className="text-[11px] text-gray-500 font-medium">
               {formatSoldCount(product.soldCount)}
             </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[18px] sm:text-[20px] font-black text-rose-600 tracking-tight leading-none">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
            </span>
            {product.originalPrice > price && (
              <span className="text-[11px] text-gray-400 line-through font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex items-center gap-2">
              <button 
                onClick={handleCompare} 
                title="So sánh sản phẩm"
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${isComparing ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20' : 'border-gray-200 text-gray-400 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50'}`}
              >
                 <GitCompare className="h-4 w-4" />
              </button>
              
              <button 
                onClick={handleAddToCart} 
                disabled={isCartLoading}
                className="flex-1 flex items-center justify-center h-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl hover:from-rose-600 hover:to-orange-600 transition-all gap-2 font-black text-[11px] uppercase tracking-wider shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50"
              >
                <ShoppingCart className={`h-3.5 w-3.5 ${isCartLoading ? 'animate-spin' : ''}`} />
                <span>{isCartLoading ? '' : '+ Giỏ hàng'}</span>
              </button>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Link>
  )
}

const RefreshCw = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
)

export default memo(ProductCard)
