import { useState, useEffect } from 'react'
import { Settings, Store, CreditCard, Globe, Save, RefreshCcw, BellRing, ShieldCheck, ChevronRight, DollarSign, Database, Activity } from 'lucide-react'
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
import SystemLogs from '../../components/admin/settings/SystemLogs'

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

    const tabs = [
        { id: 'general', label: 'Cửa hàng', icon: Store, group: 'Cài đặt chung' },
        { id: 'payment', label: 'Thanh toán', icon: CreditCard, group: 'Cài đặt chung' },
        { id: 'seo', label: 'SEO & Metadata', icon: Globe, group: 'Marketing' },
        { id: 'security', label: 'Bảo mật', icon: ShieldCheck, group: 'Hệ thống' },
        { id: 'notification', label: 'Thông báo', icon: BellRing, group: 'Hệ thống' },
        { id: 'database', label: 'Dữ liệu', icon: Database, group: 'Hệ thống' },
        { id: 'logs', label: 'Nhật ký', icon: Activity, group: 'Hệ thống' },
    ]

    return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
                <h1 className="admin-h1">Cài đặt hệ thống</h1>
                <p className="text-muted-label mt-1">
                    Quản lý cấu hình, bảo mật và tùy chỉnh cửa hàng Tech Store.
                </p>
            </div>

            <div className="flex items-center gap-3">
                {hasChanges && (
                    <button 
                        onClick={handleDiscard} 
                        className="h-[42px] px-5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-[13px] flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Hoàn tác
                    </button>
                )}
                <button 
                    onClick={handleSave} 
                    disabled={!hasChanges || saving || loading} 
                    className={`h-[42px] px-6 rounded-xl font-bold text-[13px] flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        hasChanges 
                            ? 'bg-admin-primary text-white shadow-admin-primary/25 hover:bg-admin-primary/90 hover:-translate-y-0.5' 
                            : 'bg-gray-100 text-gray-400 shadow-none'
                    }`}
                >
                    {saving ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    LƯU THAY ĐỔI
                </button>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === tab.id 
                            ? 'bg-admin-primary/10 text-admin-primary font-bold shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                >
                    <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-admin-primary' : 'text-gray-400'}`} />
                    <span className="text-[14px]">{tab.label}</span>
                </button>
            ))}
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
                                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-[16px] font-bold text-gray-900">Cổng thanh toán</h3>
                                    </div>
                                    <p className="text-[13px] text-gray-500 mb-6 font-medium">Quản lý các phương thức thanh toán khả dụng cho khách hàng</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* VNPAY */}
                                        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-admin-primary/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-[14px] text-gray-900 block">VNPAY</span>
                                                        <span className="text-[12px] text-gray-400 font-medium">Cổng thanh toán trực tuyến</span>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={paymentMethods.vnpay} 
                                                        onChange={(e) => setPaymentMethods(p => ({...p, vnpay: e.target.checked}))}
                                                    />
                                                    <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-admin-primary"></div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* COD */}
                                        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-admin-primary/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                                        <DollarSign className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-[14px] text-gray-900 block">Thanh toán COD</span>
                                                        <span className="text-[12px] text-gray-400 font-medium">Thanh toán khi nhận hàng</span>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={paymentMethods.cod} 
                                                        onChange={(e) => setPaymentMethods(p => ({...p, cod: e.target.checked}))}
                                                    />
                                                    <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-admin-primary"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Settings */}
                                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="text-[16px] font-bold text-gray-900 mb-6">Cấu hình thanh toán</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Phí COD (VND)</label>
                                            <input 
                                                type="number" 
                                                className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 font-bold text-gray-900 outline-none transition-all" 
                                                value={codFee}
                                                onChange={(e) => setCodFee(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Đơn hàng tối thiểu (VND)</label>
                                            <input 
                                                type="number" 
                                                className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 font-bold text-gray-900 outline-none transition-all" 
                                                value={minOrder}
                                                onChange={(e) => setMinOrder(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'seo' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-bold text-gray-900">Cấu hình SEO</h3>
                                            <p className="text-[13px] text-gray-500 font-medium">Tối ưu hóa khả năng tìm kiếm trên Google, Facebook</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Meta Title mặc định</label>
                                            <input 
                                                type="text" 
                                                className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-900 transition-all outline-none" 
                                                value={metaTitle}
                                                onChange={(e) => setMetaTitle(e.target.value)}
                                                placeholder="Nhập tiêu đề trang..." 
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Meta Description (Mô tả)</label>
                                            <textarea 
                                                className="w-full h-28 p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-900 transition-all outline-none resize-none" 
                                                value={metaDescription}
                                                onChange={(e) => setMetaDescription(e.target.value)}
                                                placeholder="Nhập mô tả ngắn về cửa hàng của bạn..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-[#1a1a2e] rounded-xl p-6 shadow-sm border border-gray-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                                            Xem trước trên Google
                                        </h4>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[#8ab4f8] text-[16px] font-medium hover:underline cursor-pointer truncate">
                                            {metaTitle || 'Chưa có tiêu đề'}
                                        </div>
                                        <div className="text-[#34a853] text-[13px] flex items-center gap-1">
                                            https://techstore.com <span className="text-gray-500 text-[10px]">▼</span>
                                        </div>
                                        <div className="text-gray-400 text-[13px] leading-relaxed line-clamp-2">
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

