import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Zap, Ticket, X } from 'lucide-react'
import { fetchCart, removeFromCart, updateCartItem } from '../store/slices/cartSlice'
import { getProductImageSources, handleProductImageError } from '../utils/productImageFallback'
import { couponApi } from '../api/coupons'
import Swal from 'sweetalert2'
import Toast from '../components/Toast'
import { fireError } from '../utils/swalError'

const Cart = () => {
  const dispatch = useDispatch()
  const { cartItems, totalPrice, totalItems, isLoading } = useSelector((state) => state.cart)
  const [toast, setToast] = useState(null)
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  const handleRemoveItem = (itemId, productName) => {
    Swal.fire({
      title: 'Xóa sản phẩm?',
      text: `Bạn có chắc muốn bỏ "${productName}" khỏi giỏ hàng?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đúng, xóa nó!',
      cancelButtonText: 'Hủy bỏ',
      background: '#fff',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFromCart(itemId))
        setToast({ message: 'Đã xóa sản phẩm khỏi giỏ hàng', type: 'info' })
      }
    })
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateCartItem({ itemId, item: { quantity: newQuantity } }))
    } else {
      const item = cartItems.find(i => i.id === itemId)
      handleRemoveItem(itemId, item?.productName)
    }
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    
    try {
      setIsApplyingCoupon(true)
      const res = await couponApi.public.validate(couponCode.trim(), totalPrice)
      const couponData = res.data.result
      
      setAppliedCoupon(couponData)
      setToast({ message: `Đã áp dụng mã "${couponCode}" thành công!`, type: 'success' })
      setCouponCode('')
    } catch (error) {
      fireError(error, 'Mã giảm giá không khả dụng hoặc đã hết hạn')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setToast({ message: 'Đã hủy áp dụng mã giảm giá', type: 'info' })
  }

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.discountType === 'PERCENT') {
      let discount = (totalPrice * appliedCoupon.discountValue) / 100
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount
      }
      return discount
    }
    return appliedCoupon.discountValue
  }

  const discountAmount = calculateDiscount()
  const shippingFee = totalPrice >= 2000000 ? 0 : 30000
  const finalTotal = totalPrice - discountAmount + shippingFee

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 font-bold text-gray-400 uppercase tracking-widest text-[11px]">Đang chuẩn bị giỏ hàng...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center gap-4 mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
          GIỎ <span className="text-primary-600">HÀNG</span>
        </h1>
        <div className="h-[2px] flex-1 bg-gray-100 dark:bg-white/5 hidden sm:block"></div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{totalItems} SẢN PHẨM</span>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-dark-border shadow-sm">
          <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
             <ShoppingCart className="h-12 w-12" />
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">Giỏ hàng của bạn đang trống</p>
          <p className="text-gray-400 font-bold mb-8">Hãy khám phá những sản phẩm công nghệ tuyệt vời và thêm chúng vào đây nhé!</p>
          <Link to="/products" className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* List Section */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const { primary: itemImageUrl, fallback: itemImageFallback } = getProductImageSources({
                name: item.productName || item.variantName,
                imageUrl: item.imageUrl,
              })

              return (
                <div key={item.id} className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-[2.5rem] border border-gray-100 dark:border-dark-border shadow-sm group hover:shadow-xl hover:border-primary-100 transition-all duration-500">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-24 w-24 sm:h-32 sm:w-32 bg-gray-50 dark:bg-black/20 rounded-[2rem] overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5 p-4 transition-transform group-hover:scale-105">
                        <img
                          src={itemImageUrl}
                          alt={item.productName}
                          className="h-full w-full object-contain"
                          onError={(e) => handleProductImageError(e, itemImageFallback)}
                        />
                      </div>
  
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-900 dark:text-white text-[15px] sm:text-[18px] line-clamp-2 leading-tight uppercase tracking-tight">{item.productName}</h3>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-2">{item.variantName}</p>
                        <p className="font-black text-gray-900 dark:text-white mt-2 text-lg">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:min-w-[150px] border-t sm:border-t-0 border-gray-50 dark:border-white/5 pt-4 sm:pt-0">
                      <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-transparent focus-within:border-primary-500/30 transition-all">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-dark-bg rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-gray-500 shadow-sm disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-black text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-dark-bg rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-gray-500 shadow-sm"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-xl text-primary-600 tracking-tighter">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subTotal)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.productName)}
                          className="w-11 h-11 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <Link to="/products" className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-primary-600 transition-colors uppercase tracking-widest mt-4">
              <ArrowLeft className="w-4 h-4" />
              Tiếp tục mua thêm sản phẩm khác
            </Link>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Section */}
            <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-8 border border-gray-100 dark:border-dark-border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Ticket className="w-6 h-6 text-primary-600" />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">Mã giảm giá</h3>
                </div>
                
                {appliedCoupon ? (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Đã áp dụng mã</p>
                      <p className="text-[15px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">{appliedCoupon.code}</p>
                    </div>
                    <button onClick={removeCoupon} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl text-emerald-600 transition-all">
                       <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập mã..."
                      className="flex-1 h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-600/20 transition-all dark:text-white"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button 
                      type="submit"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-6 bg-gray-900 dark:bg-primary-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-primary-700 transition-all disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'ÁP DỤNG'}
                    </button>
                  </form>
                )}
                
                {!appliedCoupon && (
                  <p className="mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Dùng mã <span className="text-primary-600">TECHSTORE</span> để được giảm ngay 10%
                  </p>
                )}
            </div>

            <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-8 border border-gray-100 dark:border-dark-border shadow-sm sticky top-24">
              <h2 className="mb-8 text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Thanh toán</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tổng tiền ({totalItems}):</span>
                  <span className="font-black text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                  </span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-sm font-bold uppercase tracking-widest">Giảm giá ({appliedCoupon.discountType === 'PERCENT' ? `${appliedCoupon.discountValue}%` : 'Voucher'}):</span>
                    <span className="font-black">
                      -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Vận chuyển:</span>
                  <span className={`font-black ${shippingFee === 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                    {shippingFee === 0 ? 'MIỄN PHÍ' : '30.000₫'}
                  </span>
                </div>

                <div className="h-[1px] bg-gray-100 dark:bg-white/5 my-6"></div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest">Tổng cộng:</span>
                  <span className="text-3xl font-black text-primary-600 tracking-tighter">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <Link to="/checkout" className="w-full bg-primary-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary-600/30 hover:bg-primary-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[12px]">
                  <span>Đặt hàng ngay</span>
                </Link>
                
                <div className="flex items-center justify-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span>Thanh toán bảo mật 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default Cart
