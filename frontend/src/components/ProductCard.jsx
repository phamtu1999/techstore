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

  const formatSoldCount = (count) => {
    if (!count || count === 0) return 'Mới'
    if (count >= 1000) {
      return `Đã bán ${(count / 1000).toFixed(1)}k`
    }
    return `Đã bán ${count}`
  }

  return (
    <Link to={`/${product.slug}`} className="block group h-full">
      <div className="bg-white dark:bg-dark-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_50px_-12px_rgba(234,88,12,0.25)] border border-gray-100/50 dark:border-dark-border/50 flex flex-col h-full relative group/card">
        
        {/* Badges */}
        <div className="absolute left-0 top-3 z-10 flex flex-col gap-1.5 items-start">
            {product.discountPercentage > 0 && (
              <div className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-r-xl shadow-lg shadow-rose-500/20 uppercase tracking-widest">
                -{product.discountPercentage}%
              </div>
            )}
            {showBadge === 'bestseller' && (
              <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-r-xl shadow-lg shadow-orange-500/20 uppercase tracking-widest flex items-center gap-1">
                🔥 HOT
              </div>
            )}
        </div>

        {/* Wishlist Button Overlay */}
        <div className="absolute right-4 top-4 z-10 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-2 group-hover/card:translate-x-0">
          <WishlistButton 
            productId={product.id} 
            onToggle={() => !user && navigate('/login')}
          />
        </div>

        {/* Image Container - Strictly 1:1 Aspect Ratio */}
        <div className="relative aspect-square w-full overflow-hidden bg-white dark:bg-black/5 flex items-center justify-center p-8 sm:p-10">
          <LazyImage
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
            fallback={fallbackImageUrl}
          />
          
          {/* Quick View Button on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10 hidden sm:block">
            <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md text-gray-900 dark:text-white text-[11px] font-black py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest border border-gray-100 dark:border-white/5">
               Xem chi tiết
            </div>
          </div>
        </div>

        {/* Content Info */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col gap-3">
          <div className="space-y-1">
            <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-800 dark:text-white line-clamp-2 leading-snug min-h-[2.75rem] group-hover:text-primary-600 transition-colors">
                {product.name}
            </h3>
            
            <div className="flex items-center gap-3">
                <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-200 dark:text-dark-border'}`} />
                    ))}
                </div>
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                    {formatSoldCount(product.soldCount)}
                </span>
            </div>
          </div>

          <div className="mt-auto pt-2">
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap mb-3 sm:mb-4">
                <span className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
                {product.originalPrice > price && (
                <span className="text-[10px] sm:text-[12px] text-gray-400 line-through font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                </span>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <button 
                    onClick={handleCompare} 
                    title="So sánh"
                    className={`h-10 w-10 sm:h-12 sm:w-12 shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl border-2 transition-all ${isComparing ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/25' : 'border-gray-100 dark:border-dark-border text-gray-400 hover:border-primary-500 hover:text-primary-600'}`}
                >
                    <GitCompare className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                
                <button 
                    onClick={handleAddToCart} 
                    disabled={isCartLoading}
                    className="flex-1 flex items-center justify-center h-10 sm:h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl sm:rounded-2xl hover:bg-black dark:hover:bg-gray-100 transition-all gap-2 sm:gap-3 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.1em] shadow-xl shadow-black/5 disabled:opacity-50 active:scale-[0.98]"
                >
                    <ShoppingCart className={`h-4 w-4 ${isCartLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{isCartLoading ? 'ĐANG THÊM...' : 'THÊM VÀO GIỎ'}</span>
                </button>
            </div>
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
