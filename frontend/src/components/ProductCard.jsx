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

  // Mock sold count if 0 to make it look active, or show "Mới về"
  const displaySoldCount = product.soldCount > 0 
    ? `${product.soldCount} ĐÃ BÁN` 
    : (product.isNew ? 'VỪA CẬP BẾN' : 'SẢN PHẨM MỚI')

  return (
    <Link to={`/${product.slug}`} className="block group h-full">
      <div className="bg-white dark:bg-dark-card rounded-2xl sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(234,88,12,0.15)] dark:hover:shadow-[0_30px_60px_-15px_rgba(234,88,12,0.3)] border border-gray-100 dark:border-dark-border flex flex-col h-full relative group/card">
        
        {/* Badges Overlay */}
        <div className="absolute left-3 top-3 sm:left-5 sm:top-5 z-10 flex flex-col gap-2">
            {product.discountPercentage > 0 && (
              <div className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-rose-500/20 uppercase tracking-widest ring-2 ring-white dark:ring-dark-card">
                -{product.discountPercentage}%
              </div>
            )}
            {showBadge === 'bestseller' && (
              <div className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/20 uppercase tracking-widest flex items-center gap-1 ring-2 ring-white dark:ring-dark-card">
                🔥 Bestseller
              </div>
            )}
            {showBadge === 'new' && (
              <div className="bg-primary-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-primary-600/20 uppercase tracking-widest flex items-center gap-1 ring-2 ring-white dark:ring-dark-card">
                ⭐ Mới
              </div>
            )}
        </div>

        {/* Wishlist Button Overlay */}
        <div className="absolute right-3 top-3 sm:right-5 sm:top-5 z-10">
          <WishlistButton 
            productId={product.id} 
            onToggle={() => !user && navigate('/login')}
          />
        </div>

        {/* Image Container */}
        <div className="relative h-[200px] sm:h-[240px] w-full overflow-hidden bg-gray-50/50 dark:bg-black/20 flex items-center justify-center">
          <LazyImage
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-4 sm:p-6 transition-transform duration-700 group-hover:scale-110"
            fallback={fallbackImageUrl}
          />
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
             <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-200 dark:text-dark-border'}`} />
                ))}
             </div>
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
               {displaySoldCount}
             </span>
          </div>

          <h3 className="mb-4 text-[15px] sm:text-[17px] font-bold text-secondary-900 dark:text-white line-clamp-2 leading-tight min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[22px] font-black text-primary-600 tracking-tight leading-none">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
                {product.originalPrice > price && (
                  <span className="text-xs text-gray-400 line-through font-bold opacity-70">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-tight">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Còn hàng</span>
              </div>
            </div>

            {/* Action Buttons - Always Visible */}
            <div className="flex items-center gap-2">
                <button 
                  onClick={handleCompare} 
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border-2 transition-all gap-2 font-bold text-[11px] uppercase tracking-wider ${isComparing ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-100 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-primary-600 hover:text-primary-600'}`}
                >
                   <GitCompare className="h-3.5 w-3.5" />
                   <span>So sánh</span>
                </button>
                
                <button 
                  onClick={handleAddToCart} 
                  disabled={isCartLoading}
                  className="flex-[1.5] flex items-center justify-center py-2.5 bg-[#1a1a2e] text-white rounded-xl hover:bg-black transition-all gap-2 font-bold text-[11px] uppercase tracking-wider disabled:opacity-50"
                >
                  <ShoppingCart className={`h-3.5 w-3.5 ${isCartLoading ? 'animate-spin' : ''}`} />
                  <span>{isCartLoading ? 'ĐANG THÊM' : '+ Thêm vào giỏ'}</span>
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
