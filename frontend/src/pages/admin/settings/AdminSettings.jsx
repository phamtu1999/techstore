import { useState, useEffect } from 'react'
import { Settings, Store, CreditCard, Globe, Save, RefreshCcw, BellRing, ShieldCheck, ChevronRight, DollarSign, Database, Activity } from 'lucide-react'
import { filesAPI } from '../../../api/files'
import { settingsAPI } from '../../../api/settings'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../../utils/swalError'
import { getApiErrorMessage } from '../../../utils/apiError'
import SecuritySettings from './SecuritySettings'

// Sub-components
import GeneralSettings from '../../../components/admin/settings/GeneralSettings'
import BroadcastNotification from '../../../components/admin/settings/BroadcastNotification'
import BackupManagement from '../../../components/admin/BackupManagement'
import SystemLogs from '../../../components/admin/settings/SystemLogs'

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
                
                // Load additional settings from backend
                const paymentMethodsData = settings.paymentMethods || { vnpay: true, momo: true, cod: true, bankTransfer: true };
                setPaymentMethods(paymentMethodsData);
                setCodFee((settings.codFee || 0).toString());
                setMinOrder((settings.minOrder || 0).toString());
                setMetaTitle(settings.metaTitle || 'Tech Store');
                setMetaKeywords(settings.metaKeywords || 'điện thoại, laptop');
                setMetaDescription(settings.metaDescription || 'Hệ thống bán lẻ điện thoại, laptop chính hãng');

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
                    paymentMethods: paymentMethodsData,
                    codFee: settings.codFee || 0,
                    minOrder: settings.minOrder || 0,
                    metaTitle: settings.metaTitle || 'Tech Store',
                    metaKeywords: settings.metaKeywords || 'điện thoại, laptop',
                    metaDescription: settings.metaDescription || 'Hệ thống bán lẻ điện thoại, laptop chính hãng'
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
                storeName, 
                logoUrl: logo, 
                supportEmail, 
                hotlinePhone, 
                address, 
                currency, 
                timezone, 
                vatRate: parseFloat(vatRate), 
                storeStatus,
                paymentMethods,
                codFee: parseFloat(codFee),
                minOrder: parseFloat(minOrder),
                metaTitle,
                metaKeywords,
                metaDescription
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

    const allTabs = [
        { id: 'general', label: 'Cửa hàng', icon: Store },
        { id: 'payment', label: 'Thanh toán', icon: CreditCard },
        { id: 'seo', label: 'SEO & Metadata', icon: Globe },
        { id: 'notification', label: 'Thông báo', icon: BellRing },
        { id: 'security', label: 'Bảo mật', icon: ShieldCheck },
        { id: 'database', label: 'Dữ liệu', icon: Database },
        { id: 'logs', label: 'Nhật ký', icon: Activity },
    ]

    return (
    <div className="animate-fade-in pb-20">
        {/* Sticky Header & Tabs Container */}
        <div className="sticky top-0 z-30 -mx-4 sm:-mx-8 bg-gray-50/90 dark:bg-dark-bg/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-dark-border/50 transition-all shadow-sm">
            <div className="px-4 sm:px-8 py-3 sm:py-4 max-w-[1600px] mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center justify-between sm:block">
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic flex items-center gap-2 sm:gap-3">
                                <Settings className="h-6 w-6 sm:h-7 sm:h-7 text-admin-primary" />
                                <span className="truncate">Cài đặt hệ thống</span>
                            </h1>
                            <p className="text-[10px] sm:text-[13px] font-bold text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-widest hidden xs:block sm:block">
                                Quản lý cấu hình Tech Store
                            </p>
                        </div>
                        
                        {/* Mobile Actions - only visible on small screens */}
                        <div className="flex sm:hidden items-center gap-2">
                            {hasChanges && (
                                <button 
                                    onClick={handleDiscard} 
                                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 rounded-xl shadow-sm active:scale-90"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                </button>
                            )}
                            <button 
                                onClick={handleSave} 
                                disabled={!hasChanges || saving || loading} 
                                className={`h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-90 disabled:opacity-50 ${
                                    hasChanges ? 'bg-admin-primary text-white shadow-admin-primary/20' : 'bg-gray-200 dark:bg-dark-border text-gray-400'
                                }`}
                            >
                                {saving ? <div className="h-3 w-3 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Save className="h-4 w-4" />}
                                {saving ? '...' : 'LƯU'}
                            </button>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                        {hasChanges && (
                            <button 
                                onClick={handleDiscard} 
                                className="h-[46px] px-6 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-sm active:scale-95"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Hoàn tác
                            </button>
                        )}
                        <button 
                            onClick={handleSave} 
                            disabled={!hasChanges || saving || loading} 
                            className={`h-[46px] px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                hasChanges 
                                    ? 'bg-admin-primary text-white shadow-admin-primary/30 hover:bg-admin-primary/90 hover:-translate-y-0.5' 
                                    : 'bg-gray-200 dark:bg-dark-border text-gray-400 dark:text-gray-600 shadow-none'
                            }`}
                        >
                            {saving ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                        </button>
                    </div>
                </div>

                {/* Horizontal Tabs bar */}
                <div className="mt-4 sm:mt-8 relative">
                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar -mb-[1px] scroll-smooth px-1">
                        {allTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border-b-2 transition-all whitespace-nowrap group relative ${
                                    activeTab === tab.id 
                                        ? 'border-admin-primary text-admin-primary font-black' 
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold'
                                }`}
                            >
                                <tab.icon className={`h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-admin-primary' : 'text-gray-400'}`} />
                                <span className="text-[12px] sm:text-[14px] uppercase tracking-wider">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <span className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-admin-primary animate-scale-x" />
                                )}
                            </button>
                        ))}
                    </div>
                    {/* Shadow indicators for scrolling */}
                    <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-50 dark:from-dark-bg to-transparent pointer-events-none sm:hidden"></div>
                </div>
            </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-12 px-4 sm:px-0">
            <div className="animate-slide-up space-y-12 pb-10">
                {activeTab === 'general' && <GeneralSettings 
                        logo={logo} uploading={uploading} handleLogoChange={handleLogoChange}
                        storeName={storeName} setStoreName={setStoreName} supportEmail={supportEmail} setSupportEmail={setSupportEmail}
                        hotlinePhone={hotlinePhone} setHotlinePhone={setHotlinePhone} address={address} setAddress={setAddress}
                        currency={currency} setCurrency={setCurrency} timezone={timezone} setTimezone={setTimezone}
                        vatRate={vatRate} setVatRate={setVatRate} storeStatus={storeStatus} setStoreStatus={setStoreStatus}
                />}

                {activeTab === 'payment' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Cổng thanh toán</h3>
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-wider">Quản lý các phương thức thanh toán</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* VNPAY */}
                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent p-5 hover:border-admin-primary/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                                                <CreditCard className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-black text-[15px] text-gray-900 dark:text-white block">VNPAY</span>
                                                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Thanh toán trực tuyến</span>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={paymentMethods.vnpay} 
                                                onChange={(e) => setPaymentMethods(p => ({...p, vnpay: e.target.checked}))}
                                            />
                                            <div className="w-12 h-6.5 bg-gray-200 dark:bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-admin-primary"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* COD */}
                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent p-5 hover:border-admin-primary/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center">
                                                <DollarSign className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <span className="font-black text-[15px] text-gray-900 dark:text-white block">Thanh toán COD</span>
                                                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Khi nhận hàng</span>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={paymentMethods.cod} 
                                                onChange={(e) => setPaymentMethods(p => ({...p, cod: e.target.checked}))}
                                            />
                                            <div className="w-12 h-6.5 bg-gray-200 dark:bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-admin-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Settings */}
                        <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8 tracking-tight italic flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-admin-primary"></span>
                                CHI TIẾT CẤU HÌNH
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Phí COD (VND)</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-admin-primary transition-colors">
                                            <DollarSign className="h-5 w-5" />
                                        </div>
                                        <input 
                                            type="number" 
                                            className="w-full h-14 pl-12 pr-6 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-admin-primary/20 font-black text-gray-900 dark:text-white outline-none transition-all text-lg" 
                                            value={codFee}
                                            onChange={(e) => setCodFee(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Đơn hàng tối thiểu (VND)</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-admin-primary transition-colors">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <input 
                                            type="number" 
                                            className="w-full h-14 pl-12 pr-6 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-admin-primary/20 font-black text-gray-900 dark:text-white outline-none transition-all text-lg" 
                                            value={minOrder}
                                            onChange={(e) => setMinOrder(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'seo' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-sm">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Cấu hình SEO</h3>
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-wider">Tối ưu hóa công cụ tìm kiếm</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Meta Title mặc định</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-14 px-6 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-black text-gray-900 dark:text-white transition-all outline-none text-lg" 
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder="Nhập tiêu đề trang..." 
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Meta Description (Mô tả)</label>
                                    <textarea 
                                        className="w-full h-40 p-6 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-900 dark:text-white transition-all outline-none resize-none text-lg" 
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        placeholder="Nhập mô tả ngắn về cửa hàng của bạn..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview Card */}
                        <div className="bg-[#1a1a2e] rounded-3xl p-10 shadow-2xl border border-white/5 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Globe className="h-32 w-32 text-white" />
                            </div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <h4 className="text-gray-400 text-[11px] font-black uppercase tracking-[0.3em]">
                                    Xem trước kết quả Google
                                </h4>
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="text-[#8ab4f8] text-2xl font-bold hover:underline cursor-pointer decoration-2 underline-offset-4">
                                    {metaTitle || 'Chưa có tiêu đề'}
                                </div>
                                <div className="text-[#34a853] text-[15px] flex items-center gap-2 font-medium">
                                    https://techstore.com <span className="text-gray-500 text-[10px]">▼</span>
                                </div>
                                <div className="text-gray-400 text-lg leading-relaxed max-w-3xl line-clamp-2">
                                    {metaDescription || 'Chưa có mô tả để hiển thị kết quả tìm kiếm...'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notification' && <BroadcastNotification />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'database' && <BackupManagement />}
                {activeTab === 'logs' && <SystemLogs />}
            </div>
        </div>
    </div>
    )
}

export default AdminSettings


