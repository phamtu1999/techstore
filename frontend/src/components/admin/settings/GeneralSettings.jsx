import { Upload, Store, DollarSign, Globe2, Clock, Hash, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const GeneralSettings = ({ 
  logo, 
  uploading, 
  handleLogoChange, 
  storeName, 
  setStoreName, 
  supportEmail, 
  setSupportEmail, 
  hotlinePhone, 
  setHotlinePhone, 
  address, 
  setAddress, 
  currency, 
  setCurrency, 
  timezone, 
  setTimezone, 
  vatRate, 
  setVatRate, 
  storeStatus, 
  setStoreStatus 
}) => {
  const [errors, setErrors] = useState({})

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/
    return phoneRegex.test(phone.replace(/[\s.-]/g, ''))
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setSupportEmail(value)
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Email không hợp lệ' }))
    } else {
      setErrors(prev => ({ ...prev, email: null }))
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    setHotlinePhone(value)
    if (value && !validatePhone(value)) {
      setErrors(prev => ({ ...prev, phone: 'Số điện thoại không hợp lệ' }))
    } else {
      setErrors(prev => ({ ...prev, phone: null }))
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Branding Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="mb-6">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                🏷️ Nhận diện thương hiệu
            </h3>
            <p className="text-[13px] text-gray-500 font-medium mt-1">Quản lý Logo và hình ảnh đại diện của cửa hàng</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start gap-8">
            <label className="relative group cursor-pointer flex-shrink-0">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center transition-all group-hover:shadow-md group-hover:scale-[1.02]">
                    {uploading ? (
                        <div className="h-8 w-8 border-3 border-admin-primary border-t-transparent animate-spin rounded-full"></div>
                    ) : (
                        <img src={logo} alt="Store Logo" className="w-full h-full object-contain p-4" />
                    )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                   <Upload className="h-6 w-6 text-white" />
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} disabled={uploading} />
            </label>
            <div className="space-y-4 flex-1">
                <div>
                    <h4 className="text-[14px] font-bold text-gray-900">Logo chính thức</h4>
                    <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">Sử dụng trên Header, hóa đơn và email thông báo. Hình ảnh nên có nền trong suốt (PNG) để hiển thị tốt nhất.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100 uppercase tracking-wider">PNG, SVG</span>
                    <span className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100 uppercase tracking-wider">MAX 2MB</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Info Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="mb-6 flex justify-between items-start">
            <div>
                <h3 className="text-[16px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    🏪 Thông tin cơ bản
                </h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Các thông tin liên hệ chính của cửa hàng</p>
            </div>
            <span className={`admin-badge ${storeStatus ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                {storeStatus ? 'Đang hoạt động' : 'Tạm đóng cửa'}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Tên cửa hàng</label>
                <input
                    type="text"
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Email hỗ trợ</label>
                <input
                    type="email"
                    className={`w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 transition-all text-[14px] font-medium outline-none ${
                        errors.email ? 'ring-2 ring-admin-danger/20' : 'focus:ring-admin-primary/20 focus:bg-white'
                    }`}
                    value={supportEmail}
                    onChange={handleEmailChange}
                />
            </div>
            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Hotline CSKH</label>
                <input
                    type="text"
                    className={`w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 transition-all text-[14px] font-medium outline-none ${
                        errors.phone ? 'ring-2 ring-admin-danger/20' : 'focus:ring-admin-primary/20 focus:bg-white'
                    }`}
                    value={hotlinePhone}
                    onChange={handlePhoneChange}
                />
            </div>
            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Trạng thái vận hành</label>
                <div className="flex items-center justify-between h-11 px-4 bg-gray-50 rounded-xl">
                    <span className="text-[13px] font-bold text-gray-600">Cho phép đặt hàng</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={storeStatus} onChange={(e) => setStoreStatus(e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                    </label>
                </div>
            </div>
        </div>

        <div className="mt-6 space-y-2">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Địa chỉ trụ sở chính</label>
            <textarea
                className="w-full min-h-[80px] px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none resize-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
        </div>
      </div>

      {/* Commercial Config Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="mb-6">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                ⚙️ Cấu hình thương mại
            </h3>
            <p className="text-[13px] text-gray-500 font-medium mt-1">Thiết lập tiền tệ, múi giờ và thuế suất mặc định</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Tiền tệ</label>
                <select
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none appearance-none cursor-pointer"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                >
                    <option value="VND">Vietnamese Dong (₫)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Múi giờ hệ thống</label>
                <select
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none appearance-none cursor-pointer"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                >
                    <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                    <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Thuế suất VAT (%)</label>
                <div className="relative">
                    <input
                        type="number"
                        className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none"
                        value={vatRate}
                        onChange={(e) => setVatRate(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings
