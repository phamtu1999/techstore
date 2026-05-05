import { Heart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice'

const WishlistButton = ({ productId, onToggle }) => {
  const dispatch = useDispatch()
  const { items } = useSelector((state) => state.wishlist)
  
  const isInWishlist = items.some((item) => item.productId === productId)
  
  const handleToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onToggle) {
      onToggle()
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap()
      } else {
        await dispatch(addToWishlist(productId)).unwrap()
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    }
  }
  
  return (
    <button
      onClick={handleToggle}
      className={`p-2.5 rounded-2xl transition-all duration-300 shadow-sm border-2 ${
        isInWishlist
          ? 'bg-red-50 border-red-100 text-red-500 shadow-red-200/50'
          : 'bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 dark:bg-dark-card dark:border-dark-border'
      }`}
      title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
    </button>
  )
}

export default WishlistButton
