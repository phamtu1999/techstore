import { useState, useEffect } from 'react'
import { Settings, Store, CreditCard, Globe, Save, RefreshCcw, BellRing, ShieldCheck, ChevronRight, DollarSign, Database } from 'lucide-react'
import { filesAPI } from '../../api/files'
import { settingsAPI } from '../../api/settings'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'
import SecuritySettings from './SecuritySettings'

// Sub-components
import GeneralSettings from '../../components/admin/settings/GeneralSettings'
import BroadcastNotification from '../../components/admin/settings/BroadcastNotification'
import BackupManagement from '../../components/admin/BackupManagement'

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general')
    const [logo, setLogo] = useState('https://res.cloudinary.com/demo/image/upload/v1622540000/sample.jpg')
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalData, setOriginalData] = useState(null)

    // Form state for store settings
    const [storeName, setStoreName] = useState('Tech Store')
    const [supportEmail, setSupportEmail] = useState('support@techstore.com')
    const [hotlinePhone, setHotlinePhone] = useState('0987.654.321')
    const [address, setAddress] = useState('123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh')
    const [currency, setCurrency] = useState('VND')
    const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh')
    const [vatRate, setVatRate] = useState('10')
    const [storeStatus, setStoreStatus] = useState(true)

    // Payment settings states
    const [paymentMethods, setPaymentMethods] = useState({
        vnpay: true, momo: true, cod: true, bankTransfer: true
    })
    const [codFee, setCodFee] = useState('0')
    const [minOrder, setMinOrder] = useState('0')

    // SEO states
    const [metaTitle, setMetaTitle] = useState('Tech Store')
    const [metaKeywords, setMetaKeywords] = useState('điện thoại, laptop')
    const [metaDescription, setMetaDescription] = useState('Hệ thống bán lẻ điện thoại, laptop chính hãng')

    useEffect(() => {
        fetchSettings()
    }, [])

    useEffect(() => {
        if (!originalData) return;
        
        const currentData = {
            storeName, supportEmail, hotlinePhone, address, logo, currency, timezone, vatRate: parseFloat(vatRate), storeStatus,
            paymentMethods, codFee: parseFloat(codFee), minOrder: parseFloat(minOrder),
            metaTitle, metaKeywords, metaDescription
        };

        const changed = JSON.stringify(currentData) !== JSON.stringify(originalData);
        setHasChanges(changed);
    }, [storeName, supportEmail, hotlinePhone, address, logo, currency, timezone, vatRate, storeStatus, paymentMethods, codFee, minOrder, metaTitle, metaKeywords, metaDescription, originalData])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const response = await settingsAPI.getSettings()
            const settings = response.data.result
            if (settings) {
                const data = {
                    logoUrl: settings.logoUrl || 'https://res.cloudinary.com/demo/image/upload/v1622540000/sample.jpg',
                    storeName: settings.storeName || 'Tech Store',
                    supportEmail: settings.supportEmail || 'support@techstore.com',
                    hotlinePhone: settings.hotlinePhone || '0987.654.321',
                    address: settings.address || '123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh',
                    currency: settings.currency || 'VND',
                    timezone: settings.timezone || 'Asia/Ho_Chi_Minh',
                    vatRate: settings.vatRate || 10,
                    storeStatus: settings.storeStatus !== undefined ? settings.storeStatus : true
                }
                
                setLogo(data.logoUrl)
                setStoreName(data.storeName)
                setSupportEmail(data.supportEmail)
                setHotlinePhone(data.hotlinePhone)
                setAddress(data.address)
                setCurrency(data.currency)
                setTimezone(data.timezone)
                setVatRate(data.vatRate.toString())
                setStoreStatus(data.storeStatus)
                
                // Default states for non-backend settings yet
                const defaultPayment = { vnpay: true, momo: true, cod: true, bankTransfer: true };
                setPaymentMethods(defaultPayment);
                setCodFee('0');
                setMinOrder('0');
                setMetaTitle('Tech Store');
                setMetaKeywords('điện thoại, laptop');
                setMetaDescription('Hệ thống bán lẻ điện thoại, laptop chính hãng');

                // Save original for comparison
                setOriginalData({
                    storeName: data.storeName,
                    supportEmail: data.supportEmail,
                    hotlinePhone: data.hotlinePhone,
                    address: data.address,
                    logo: data.logoUrl,
                    currency: data.currency,
                    timezone: data.timezone,
                    vatRate: data.vatRate,
                    storeStatus: data.storeStatus,
                    paymentMethods: defaultPayment,
                    codFee: 0,
                    minOrder: 0,
                    metaTitle: 'Tech Store',
                    metaKeywords: 'điện thoại, laptop',
                    metaDescription: 'Hệ thống bán lẻ điện thoại, laptop chính hãng'
                })
            }
        } catch (error) {
            console.error(getApiErrorMessage(error))
        } finally {
            setLoading(false)
            setHasChanges(false)
        }
    }

    const handleLogoChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            fireError({ response: { data: { message: 'Vui lòng chọn file nhỏ hơn 2MB' } } }, undefined, 'File quá lớn')
            return
        }

        setUploading(true)
        try {
            const response = await filesAPI.upload(file, 'settings')
            setLogo(response.data.result)
            fireSuccess('Đã tải logo lên', 'Nhớ nhấn "Lưu thay đổi" để áp dụng', { toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
        } catch (error) {
            fireError(error, 'Không thể tải logo lên', 'Lỗi tải logo')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await settingsAPI.updateSettings({
                storeName, logoUrl: logo, supportEmail, hotlinePhone, address, currency, timezone, vatRate: parseFloat(vatRate), storeStatus
            })
            fireSuccess('Đã lưu cài đặt thành công!', '<div class="text-sm text-gray-600 mt-2">✓ Thông tin cửa hàng<br/>✓ Cấu hình thương mại<br/>✓ Logo & trạng thái</div>', { toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true }).then(() => {
                window.location.reload()
            })
            setHasChanges(false)
        } catch (error) {
            fireError(error, 'Không thể lưu cấu hình', 'Lỗi lưu cấu hình')
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        if (!originalData) return;
        setStoreName(originalData.storeName)
        setSupportEmail(originalData.supportEmail)
        setHotlinePhone(originalData.hotlinePhone)
        setAddress(originalData.address)
        setLogo(originalData.logo)
        setCurrency(originalData.currency || 'VND')
        setTimezone(originalData.timezone || 'Asia/Ho_Chi_Minh')
        setVatRate((originalData.vatRate || 10).toString())
        setStoreStatus(originalData.storeStatus !== undefined ? originalData.storeStatus : true)
        setPaymentMethods(originalData.paymentMethods || { vnpay: true, momo: true, cod: true, bankTransfer: true })
        setCodFee((originalData.codFee || 0).toString())
        setMinOrder((originalData.minOrder || 0).toString())
        setMetaTitle(originalData.metaTitle || 'Tech Store')
        setMetaKeywords(originalData.metaKeywords || 'điện thoại, laptop')
        setMetaDescription(originalData.metaDescription || 'Hệ thống bán lẻ điện thoại, laptop chính hãng')
        setHasChanges(false)

        
        fireSuccess('Đã hoàn tác', 'Mọi thay đổi đã được quay về trạng thái ban đầu', {
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        })
    }

    const tabs = [
        { id: 'general', label: 'Cửa hàng', icon: Store, group: 'Cài đặt chung' },
        { id: 'payment', label: 'Thanh toán', icon: CreditCard, group: 'Cài đặt chung' },
        { id: 'seo', label: 'SEO & Metadata', icon: Globe, group: 'Marketing' },
        { id: 'security', label: 'Bảo mật', icon: ShieldCheck, group: 'Hệ thống' },
        { id: 'notification', label: 'Thông báo', icon: BellRing, group: 'Hệ thống' },
        { id: 'database', label: 'Dữ liệu', icon: Database, group: 'Hệ thống' },
    ]

    return (
        <div className="space-y-5 sm:space-y-8 pb-24 sm:pb-32 animate-fade-in">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary dark:text-gray-400">
                <span className="hover:text-primary-main cursor-pointer transition-colors" onClick={() => navigate('/admin')}>Dashboard</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold text-text-primary dark:text-dark-text">Cài đặt</span>
            </div>

            {/* Header Card */}
            <div className="bg-white dark:bg-dark-card rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 border border-border dark:border-dark-border shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 sm:p-5 bg-gradient-to-br from-primary-main to-orange-500 rounded-[1.25rem] shadow-xl shadow-primary-main/20">
                            <Settings className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                                System
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-dark-text tracking-tight">Cài đặt hệ thống</h1>
                            <div className="mt-2 flex items-center gap-3 flex-wrap">
                                <p className="text-text-secondary dark:text-gray-400 font-medium">Quản lý cấu hình, bảo mật và tùy chỉnh cửa hàng</p>
                                <span className="px-2 py-0.5 bg-primary-main/10 text-primary-main text-[10px] font-bold rounded-full border border-primary-main/10 uppercase tracking-wider">v2.0</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50/70 dark:bg-white/5 p-2 rounded-2xl border border-border dark:border-dark-border">
                        {hasChanges && (
                            <button 
                                onClick={handleDiscard} 
                                disabled={loading || saving} 
                                className="px-6 h-11 rounded-xl font-bold text-[13px] text-gray-500 hover:bg-white dark:hover:bg-dark-card hover:text-rose-600 transition-all disabled:opacity-50 flex items-center gap-2 hover:shadow-sm"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Hủy bỏ
                            </button>
                        )}
                        <button 
                            onClick={handleSave} 
                            disabled={!hasChanges || saving || loading} 
                            className={`px-8 h-11 rounded-xl font-black text-[13px] flex items-center gap-2 transition-all duration-300 relative overflow-hidden group border-2 ${
                                hasChanges 
                                    ? 'text-white bg-gradient-to-r from-primary-600 to-orange-500 shadow-lg shadow-primary-200/50 hover:scale-[1.02] active:scale-95 border-transparent' 
                                    : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <>
                                    <Save className={`h-4 w-4 ${hasChanges ? 'group-hover:rotate-12' : ''} transition-transform`} /> 
                                    <span>LƯU CÀI ĐẶT</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Horizontal Navigation Tabs */}
                <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border dark:border-dark-border pt-5">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all duration-300 group relative ${
                                activeTab === tab.id 
                                    ? 'bg-primary-main text-white shadow-lg shadow-primary-main/20' 
                                    : 'text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-dark-text'
                            }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} />
                            <span className={`text-[13px] tracking-tight ${activeTab === tab.id ? 'font-bold' : 'font-semibold'}`}>{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-primary-600 rounded-t-full hidden lg:block"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-dark-text tracking-tight flex items-center gap-3">
                            {tabs.find(t => t.id === activeTab)?.label}
                            <span className="w-2 h-2 rounded-full bg-primary-main animate-pulse"></span>
                        </h2>
                        <p className="text-text-secondary dark:text-gray-400 font-medium text-sm mt-1">Cấu hình chi tiết các tham số của hệ thống</p>
                    </div>
                </div>

                <div className="animate-slide-up">
                    {activeTab === 'general' && <GeneralSettings 
                         logo={logo} uploading={uploading} handleLogoChange={handleLogoChange}
                         storeName={storeName} setStoreName={setStoreName} supportEmail={supportEmail} setSupportEmail={setSupportEmail}
                         hotlinePhone={hotlinePhone} setHotlinePhone={setHotlinePhone} address={address} setAddress={setAddress}
                         currency={currency} setCurrency={setCurrency} timezone={timezone} setTimezone={setTimezone}
                         vatRate={vatRate} setVatRate={setVatRate} storeStatus={storeStatus} setStoreStatus={setStoreStatus}
                    />}

                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[2rem] p-8 border border-blue-100 dark:border-white/5">
                                    <h3 className="font-black text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-3 text-lg">
                                        <CreditCard className="h-6 w-6" /> 
                                        Cổng thanh toán
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300/80 mb-8 font-medium">Quản lý các phương thức thanh toán khả dụng cho khách hàng</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* VNPAY */}
                                        <div className="bg-white dark:bg-dark-bg rounded-2xl border border-gray-100 dark:border-dark-border p-5 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                                        <CreditCard className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 dark:text-white block">VNPAY</span>
                                                        <span className="text-xs text-gray-500 font-medium">Cổng thanh toán trực tuyến</span>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={paymentMethods.vnpay} 
                                                        onChange={(e) => setPaymentMethods(p => ({...p, vnpay: e.target.checked}))}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* COD */}
                                        <div className="bg-white dark:bg-dark-bg rounded-2xl border border-gray-100 dark:border-dark-border p-5 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                                        <DollarSign className="h-6 w-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 dark:text-white block">Thanh toán COD</span>
                                                        <span className="text-xs text-gray-500 font-medium">Thanh toán khi nhận hàng</span>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={paymentMethods.cod} 
                                                        onChange={(e) => setPaymentMethods(p => ({...p, cod: e.target.checked}))}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Settings */}
                                <div className="bg-white dark:bg-dark-card rounded-[2rem] p-8 border border-gray-100 dark:border-dark-border shadow-sm">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Cài đặt thanh toán</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Phí COD</label>
                                            <input 
                                                type="number" 
                                                className="w-full h-14 px-5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold text-gray-900 dark:text-white outline-none" 
                                                value={codFee}
                                                onChange={(e) => setCodFee(e.target.value)}
                                                placeholder="0 ₫"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Đơn hàng tối thiểu</label>
                                            <input 
                                                type="number" 
                                                className="w-full h-14 px-5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold text-gray-900 dark:text-white outline-none" 
                                                value={minOrder}
                                                onChange={(e) => setMinOrder(e.target.value)}
                                                placeholder="0 ₫"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'seo' && (
                            <div className="space-y-8">
                                <div className="bg-white dark:bg-dark-card rounded-[2rem] p-8 border border-gray-100 dark:border-dark-border shadow-sm space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-600">
                                            <Globe className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Cấu hình SEO</h3>
                                            <p className="text-sm text-gray-500 font-medium">Tối ưu hóa khả năng tìm kiếm trên Google, Facebook</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Meta Title mặc định</label>
                                            <input 
                                                type="text" 
                                                className="w-full h-14 px-5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 dark:text-white transition-all outline-none" 
                                                value={metaTitle}
                                                onChange={(e) => setMetaTitle(e.target.value)}
                                                placeholder="Nhập tiêu đề trang..." 
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Meta Description (Mô tả)</label>
                                            <textarea 
                                                className="w-full h-32 p-5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 dark:text-white transition-all outline-none resize-none" 
                                                value={metaDescription}
                                                onChange={(e) => setMetaDescription(e.target.value)}
                                                placeholder="Nhập mô tả ngắn về cửa hàng của bạn..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-gray-900 rounded-[2rem] p-8 shadow-2xl border border-gray-800">
                                    <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Xem trước trên Google
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="text-[#8ab4f8] text-xl font-medium hover:underline cursor-pointer truncate max-w-full">
                                            {metaTitle || 'Chưa có tiêu đề'}
                                        </div>
                                        <div className="text-[#34a853] text-[15px] flex items-center gap-1">
                                            https://techstore.com <span className="text-gray-500">▼</span>
                                        </div>
                                        <div className="text-gray-400 text-[14px] leading-relaxed line-clamp-2">
                                            {metaDescription || 'Chưa có mô tả để hiển thị kết quả tìm kiếm...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notification' && <BroadcastNotification />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {activeTab === 'database' && <BackupManagement />}
                    </div>
                </div>
            </div>
    )
}

export default AdminSettings

