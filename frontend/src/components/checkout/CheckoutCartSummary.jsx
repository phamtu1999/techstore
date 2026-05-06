import { Package, Truck, Check, ShieldCheck, Zap, X } from 'lucide-react'
import { useState } from 'react'
import { couponApi } from '../../api/coupons'

const CheckoutCartSummary = ({ 
  cartItems, 
  totalPrice, 
  onSubmit, 
  couponCode, 
  onCouponChange,
  availablePoints = 0,
  pointsToSpend = 0,
  onPointsChange
}) => {
  const [isValidating, setIsValidating] = useState(false)
  const [couponResult, setCouponResult] = useState(null)
  const [usePoints, setUsePoints] = useState(false)

  const POINT_VALUE = 1000 // 1 point = 1000 VND

  const currencyFormatter = (amount) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)

  const handleValidateCoupon = async () => {
    if (!couponCode || couponCode.trim() === '') {
      setCouponResult(null)
      return
    }

    setIsValidating(true)
    try {
      const res = await couponApi.public.validate(couponCode, totalPrice)
      setCouponResult(res.data.result)
    } catch (err) {
      setCouponResult({
        valid: false,
        message: err.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra mã',
        discountAmount: 0
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleClearCoupon = () => {
    onCouponChange('')
    setCouponResult(null)
  }

  const discountAmount = couponResult?.valid ? couponResult.discountAmount : 0
  const pointDiscount = pointsToSpend * POINT_VALUE
  const totalDiscount = discountAmount + pointDiscount
  const subTotalAfterDiscount = totalPrice - totalDiscount > 0 ? totalPrice - totalDiscount : 0
  const shippingFee = subTotalAfterDiscount >= 2000000 ? 0 : 30000
  const finalTotal = subTotalAfterDiscount + shippingFee

  return (
    <div className="glass border border-white/40 rounded-[2.5rem] p-5 sm:p-8 sticky top-28 shadow-premium animate-fade-in overflow-hidden relative group">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-600/5 rounded-full blur-3xl group-hover:bg-primary-600/10 transition-colors duration-700"></div>
      
      <h2 className="text-lg sm:text-xl font-black text-secondary-900 mb-6 sm:mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Package className="w-5 h-5 text-white" />
        </div>
        TÓM TẮT <span className="text-primary-600">ĐƠN HÀNG</span>
      </h2>

      <div className="space-y-4 mb-8">
        {/* Promo Code Section */}
        <div className="bg-white/40 p-5 rounded-3xl border border-white/60 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Mã giảm giá (Voucher)</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
               <input 
                 type="text" 
                 placeholder="NHẬP MÃ TẠI ĐÂY"
                 className={`w-full bg-white/50 border-2 rounded-xl px-4 py-3 pr-10 text-xs font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-300 ${couponResult?.valid ? 'border-emerald-400 text-emerald-600' : (couponResult?.valid === false ? 'border-red-400 text-red-500' : 'border-gray-100 focus:border-primary-500')}`}
                 value={couponCode}
                 onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
                 readOnly={couponResult?.valid}
               />
               {couponResult?.valid && (
                 <button onClick={handleClearCoupon} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200">
                    <X className="w-3 h-3" />
                 </button>
               )}
            </div>
            
            {!couponResult?.valid && (
               <button 
                  onClick={handleValidateCoupon}
                  disabled={!couponCode || isValidating}
                  className="px-4 bg-secondary-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isValidating ? '...' : 'ÁP DỤNG'}
               </button>
            )}
          </div>
          
          {couponResult && (
             <div className={`mt-2 text-[10px] font-bold ${couponResult.valid ? 'text-emerald-500' : 'text-red-500'}`}>
                {couponResult.message}
             </div>
          )}
        </div>

        {/* Loyalty Points Section */}
        {availablePoints > 0 && (
          <div className="bg-primary-50/50 p-5 rounded-3xl border border-primary-100 mb-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-600">Điểm tích lũy (Loyalty)</p>
              <span className="text-[10px] font-black text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                HÀNG HIẾM: {availablePoints} ĐIỂM
              </span>
            </div>
            
            <div className="flex items-center gap-3">
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={usePoints}
                    onChange={(e) => {
                      setUsePoints(e.target.checked)
                      if (!e.target.checked) onPointsChange(0)
                      else onPointsChange(availablePoints)
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
               </label>
               <span className="text-xs font-bold text-secondary-900">Sử dụng điểm đổi quà</span>
            </div>
            
            {usePoints && (
               <div className="mt-3 animate-fade-in">
                  <input 
                    type="range"
                    min="0"
                    max={availablePoints}
                    step="1"
                    value={pointsToSpend}
                    onChange={(e) => onPointsChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-primary-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-gray-400">{pointsToSpend} điểm</span>
                    <span className="text-[10px] font-black text-emerald-600">- {currencyFormatter(pointDiscount)}</span>
                  </div>
               </div>
            )}
          </div>
        )}

        <div className="bg-white/40 p-5 rounded-3xl border border-white/60">
           <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Package className="w-4 h-4" />
                   Sản phẩm ({cartItems.length})
                </span>
                <span className="text-sm font-black text-secondary-900">{currencyFormatter(totalPrice)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-500">
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                     <Zap className="w-4 h-4" />
                     Giảm giá Voucher
                  </span>
                  <span className="text-sm font-black">- {currencyFormatter(discountAmount)}</span>
                </div>
              )}

              {pointDiscount > 0 && (
                <div className="flex justify-between items-center text-primary-600">
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                     <Zap className="w-4 h-4" />
                     Điểm tích lũy
                  </span>
                  <span className="text-sm font-black">- {currencyFormatter(pointDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Truck className="w-4 h-4" />
                   Vận chuyển
                </span>
                <span className={`text-sm font-black ${shippingFee === 0 ? 'text-emerald-600' : 'text-secondary-900'}`}>
                   {shippingFee === 0 ? 'MIỄN PHÍ' : currencyFormatter(shippingFee)}
                </span>
              </div>
           </div>
           
           {shippingFee === 0 && (
              <div className="mt-4 pt-4 border-t border-white/40">
                 <div className="flex items-center gap-2 text-emerald-600 animate-pulse-soft">
                    <Zap className="w-4 h-4 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bạn đã được miễn phí vận chuyển!</span>
                 </div>
              </div>
           )}
        </div>

        <div className="px-5">
           <div className="flex justify-between items-end">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tổng tiền thanh toán</span>
              <div className="text-right">
                 <p className="text-3xl font-black text-secondary-900 tracking-tighter">
                   {currencyFormatter(finalTotal)}
                 </p>
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Đã bao gồm thuế GTGT (nếu có)</p>
              </div>
           </div>
        </div>
      </div>

      <button 
        onClick={onSubmit}
        className="w-full bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-black py-5 px-8 rounded-3xl shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group/btn uppercase tracking-widest text-xs"
      >
        <span>Đặt hàng ngay</span>
        <Check className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
      </button>

      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-gray-400">
           <ShieldCheck className="w-4 h-4 text-emerald-500" />
           <p className="text-[10px] font-black uppercase tracking-tighter">Thanh toán an toàn & Bảo mật 100%</p>
        </div>
        <div className="flex gap-4 opacity-30 grayscale saturate-0">
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-2" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/0/07/VNPAY_logo.svg" alt="VNPAY" className="h-3" />
        </div>
      </div>
    </div>
  )
}

export default CheckoutCartSummary
