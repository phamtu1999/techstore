import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Eye, Store, GitCompare, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { addToCompare, removeFromCompare } from '../store/slices/comparisonSlice'
import Toast from './Toast'
import LazyImage from './LazyImage'
import { getProductImageSources, handleProductImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/productImageFallback'

const ProductCard = ({ product, showBadge }) => {
  const dispatch = useDispatch()
  const { items: compareItems } = useSelector((state) => state.comparison)
  const { isLoading: isCartLoading } = useSelector((state) => state.cart)
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
      await dispatch(addToCart({ 
        productId: product.id, 
        variantId: currentVariant.id,
        quantity: 1 
      })).unwrap()
      setToast({ message: 'Đã thêm vào giỏ hàng!', type: 'success' })
    } catch (error) {
      setToast({ message: error || 'Không thể thêm vào giỏ hàng', type: 'error' })
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

        {/* Image Container */}
        <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden bg-gray-50/50 dark:bg-black/20">
          <img 
            src={imageUrl || DEFAULT_PRODUCT_PLACEHOLDER} 
            alt={product.name}
            className="h-full w-full object-contain p-4 sm:p-8 transition-transform duration-700 group-hover:scale-110"
            onError={(e) => handleProductImageError(e, fallbackImageUrl)}
          />
          
          {/* Action Bar Overlay (Desktop) */}
          <div className="absolute bottom-4 left-4 right-4 hidden sm:block translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
             <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-[1.5rem] p-1.5 flex items-center gap-1 shadow-2xl border border-white/30 dark:border-white/10">
                <button 
                  onClick={handleCompare} 
                  className={`flex-1 flex items-center justify-center py-3.5 rounded-[1.25rem] transition-all gap-2 font-black text-[10px] uppercase tracking-widest ${isComparing ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-secondary-800 dark:text-gray-200'}`}
                  title={isComparing ? "Xóa khỏi so sánh" : "So sánh"}
                >
                   <GitCompare className="h-4 w-4" />
                   <span>So sánh</span>
                </button>
                
                <button 
                  onClick={handleAddToCart} 
                  disabled={isCartLoading}
                  className="flex-[1.2] flex items-center justify-center py-3.5 bg-primary-600 text-white rounded-[1.25rem] hover:bg-primary-700 transition-all gap-2 font-black text-[10px] uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-primary-600/20"
                >
                  <ShoppingCart className={`h-4 w-4 ${isCartLoading ? 'animate-spin' : ''}`} />
                  <span>{isCartLoading ? 'ĐANG THÊM' : 'THÊM NGAY'}</span>
                </button>
             </div>
          </div>

          {/* Quick Action (Mobile Only) */}
          <div className="absolute bottom-3 right-3 sm:hidden z-20">
              <button 
                onClick={handleAddToCart}
                disabled={isCartLoading}
                className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30 active:scale-90 transition-transform"
              >
                {isCartLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Plus className="h-6 w-6" />}
              </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 sm:p-7 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
             <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-200 dark:text-dark-border'}`} />
                ))}
             </div>
             <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
               {displaySoldCount}
             </span>
          </div>

          <h3 className="mb-4 text-[15px] sm:text-[17px] font-black text-secondary-900 dark:text-white line-clamp-2 leading-tight min-h-[3rem] group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-primary-600 tracking-tight leading-none">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
                {product.originalPrice > price && (
                  <span className="mt-1 text-[11px] sm:text-xs text-gray-400 line-through font-bold opacity-70">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Sẵn sàng</span>
              </div>
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
