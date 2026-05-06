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
    <div className="space-y-6 sm:space-y-12 pb-12">
      {/* Branding Section */}
      <div className="bg-white dark:bg-dark-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="mb-6 sm:mb-10">
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 sm:gap-3">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-admin-primary" />
                Nhận diện thương hiệu
            </h3>
            <p className="text-[11px] sm:text-[13px] text-gray-500 font-bold mt-1.5 sm:mt-2 max-w-2xl leading-relaxed">Quản lý Logo và hình ảnh đại diện chính thức của cửa hàng Tech Store trên các nền tảng.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-12">
            <div className="relative group flex-shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl sm:rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center transition-all group-hover:border-admin-primary/50 group-hover:bg-white dark:group-hover:bg-white/10">
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 border-3 border-admin-primary border-t-transparent animate-spin rounded-full"></div>
                            <span className="text-[10px] font-black text-admin-primary uppercase tracking-widest">Đang tải...</span>
                        </div>
                    ) : (
                        <img src={logo} alt="Store Logo" className="w-full h-full object-contain p-4 sm:p-6" />
                    )}
                </div>
                
                <label className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-2.5 sm:p-3 bg-admin-primary text-white rounded-xl sm:rounded-2xl shadow-lg shadow-admin-primary/40 cursor-pointer hover:scale-110 active:scale-95 transition-all">
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} disabled={uploading} />
                </label>
            </div>

            <div className="space-y-4 sm:space-y-6 flex-1 text-center md:text-left">
                <div>
                    <h4 className="text-[13px] sm:text-[15px] font-black text-gray-900 dark:text-white uppercase tracking-wider">Logo chính thức</h4>
                    <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-bold">
                        Hình ảnh này sẽ xuất hiện trên thanh điều hướng, hóa đơn bán hàng và các email tự động gửi cho khách hàng. 
                        <br className="hidden sm:block" />
                        Khuyên dùng định dạng <span className="text-admin-primary">PNG hoặc SVG</span> với nền trong suốt.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-white/5 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                        PNG, SVG, WEBP
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-white/5 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                        <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-admin-primary" />
                        Tối đa 2MB
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Info Section */}
      <div className="bg-white dark:bg-dark-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div>
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 sm:gap-3">
                    <Globe2 className="h-5 w-5 sm:h-6 sm:w-6 text-admin-primary" />
                    Thông tin liên hệ
                </h3>
                <p className="text-[11px] sm:text-[13px] text-gray-500 font-bold mt-1 sm:mt-2">Thông tin hiển thị công khai trên website và các kênh truyền thông.</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 dark:bg-white/5 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-white/5 w-fit">
                <span className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Trạng thái:</span>
                <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-widest ${
                    storeStatus 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                }`}>
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${storeStatus ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                    {storeStatus ? 'Đang hoạt động' : 'Tạm đóng cửa'}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 sm:gap-y-8">
            <div className="group space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1 group-focus-within:text-admin-primary transition-colors">Tên cửa hàng</label>
                <div className="relative">
                   <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-4 sm:h-4.5 w-4 sm:w-4.5 text-gray-400 group-focus-within:text-admin-primary transition-colors" />
                   <input
                        type="text"
                        className="w-full h-12 sm:h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="VD: Tech Store Premium"
                    />
                </div>
            </div>
            <div className="group space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1 group-focus-within:text-admin-primary transition-colors">Email hỗ trợ</label>
                <div className="relative">
                   <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 sm:h-4.5 w-4 sm:w-4.5 text-gray-400 group-focus-within:text-admin-primary transition-colors" />
                   <input
                        type="email"
                        className={`w-full h-12 sm:h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none ${
                            errors.email ? 'border-rose-500 bg-rose-50' : 'focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg'
                        }`}
                        value={supportEmail}
                        onChange={handleEmailChange}
                        placeholder="support@techstore.vn"
                    />
                </div>
                {errors.email && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{errors.email}</p>}
            </div>
            <div className="group space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1 group-focus-within:text-admin-primary transition-colors">Hotline CSKH</label>
                <div className="relative">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 sm:h-4.5 w-4 sm:w-4.5 text-gray-400 group-focus-within:text-admin-primary transition-colors" />
                   <input
                        type="text"
                        className={`w-full h-12 sm:h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none ${
                            errors.phone ? 'border-rose-500 bg-rose-50' : 'focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg'
                        }`}
                        value={hotlinePhone}
                        onChange={handlePhoneChange}
                        placeholder="09xx.xxx.xxx"
                    />
                </div>
                {errors.phone && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{errors.phone}</p>}
            </div>
            <div className="group space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1 group-focus-within:text-admin-primary transition-colors">Cho phép hoạt động</label>
                <div className="flex items-center justify-between h-12 sm:h-14 px-4 sm:px-5 bg-gray-50 dark:bg-white/5 rounded-xl sm:rounded-[1.25rem] border border-transparent group-focus-within:border-admin-primary/20 transition-all">
                    <span className="text-[11px] sm:text-[13px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-tight">Kinh doanh trực tuyến</span>
                    <label className="relative inline-flex items-center cursor-pointer scale-100 sm:scale-110">
                        <input type="checkbox" className="sr-only peer" checked={storeStatus} onChange={(e) => setStoreStatus(e.target.checked)} />
                        <div className="w-10 h-5.5 sm:w-11 sm:h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                    </label>
                </div>
            </div>
        </div>

        <div className="group mt-6 sm:mt-10 space-y-2 sm:space-y-3">
            <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1 group-focus-within:text-admin-primary transition-colors">Địa chỉ trụ sở chính</label>
            <textarea
                className="w-full min-h-[100px] sm:min-h-[120px] p-4 sm:p-5 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white outline-none resize-none leading-relaxed"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ đầy đủ của trụ sở..."
            />
        </div>
      </div>

      {/* Commercial Config Section */}
      <div className="bg-white dark:bg-dark-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="mb-6 sm:mb-10">
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 sm:gap-3">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-admin-primary" />
                Cấu hình thương mại
            </h3>
            <p className="text-[11px] sm:text-[13px] text-gray-500 font-bold mt-1 sm:mt-2">Thiết lập tiền tệ, múi giờ và các quy tắc tài chính mặc định.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            <div className="group space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1 group-focus-within:text-admin-primary transition-colors">Tiền tệ</label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 sm:h-4.5 w-4 sm:w-4.5 text-gray-400 group-focus-within:text-admin-primary transition-colors" />
                    <select
                        className="w-full h-12 sm:h-14 pl-12 pr-10 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none appearance-none cursor-pointer"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        <option value="VND">Vietnamese Dong (₫)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                    </select>
                </div>
            </div>

            <div className="group space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1 group-focus-within:text-admin-primary transition-colors">Múi giờ hệ thống</label>
                <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 sm:h-4.5 w-4 sm:w-4.5 text-gray-400 group-focus-within:text-admin-primary transition-colors" />
                    <select
                        className="w-full h-12 sm:h-14 pl-12 pr-10 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none appearance-none cursor-pointer"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                    >
                        <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                        <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                    </select>
                </div>
            </div>

            <div className="group space-y-2 sm:space-y-3 sm:col-span-2 md:col-span-1">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1 group-focus-within:text-admin-primary transition-colors">Thuế suất VAT (%)</label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 sm:h-4.5 w-4 sm:w-4.5 text-gray-400 group-focus-within:text-admin-primary transition-colors" />
                    <input
                        type="number"
                        className="w-full h-12 sm:h-14 pl-12 pr-12 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
                        value={vatRate}
                        onChange={(e) => setVatRate(e.target.value)}
                        placeholder="10"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400">%</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings
