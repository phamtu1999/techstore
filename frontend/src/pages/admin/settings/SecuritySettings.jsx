import { useState, useEffect, useCallback } from 'react'
import { Shield, Lock, History, Globe, Clock, Save, ShieldCheck, Smartphone, Mail, Key, Info, Users, RefreshCcw, Activity } from 'lucide-react'
import { securityAPI } from '../../api/securityAPI'
import Swal from 'sweetalert2'

// Sub-components
import ActiveSessionsTable from '../../components/admin/security/ActiveSessionsTable'
import LoginHistoryTable from '../../components/admin/security/LoginHistoryTable'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString))
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A'
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000)
  if (diffInSeconds < 60) return 'vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`
}

const SecuritySettings = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyFilters, setHistoryFilters] = useState({ username: '', status: 'ALL', startDate: '', endDate: '' })
  const [historyPage, setHistoryPage] = useState(0)
  const [historyTotalPages, setHistoryTotalPages] = useState(0)
  const [historyTotalElements, setHistoryTotalElements] = useState(0)
  const [twoFactorUsers, setTwoFactorUsers] = useState([])
  
  const [form, setForm] = useState({
    twoFactorEnabled: false, allowedTwoFactorMethods: [], passwordMinLength: 8, requireSpecialChar: true, requireUppercase: true, requireNumeric: true,
    passwordExpirationDays: 90, maxFailedLoginAttempts: 5, accountLockoutMinutes: 30, accessTokenLifetimeMinutes: 15, refreshTokenLifetimeDays: 7,
    sessionTimeoutMinutes: 30, rememberMeEnabled: false, rememberMeLifetimeDays: 30, corsAllowedDomains: '', rateLimitPerMinute: 100,
    apiKeyAuthEnabled: false, ipWhitelist: '', ipBlacklist: ''
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, sessRes, uRes] = await Promise.all([securityAPI.getSecuritySettings(), securityAPI.getActiveSessions(), securityAPI.get2FAUsers()])
      if (sRes.data.result) {
        const s = sRes.data.result
        setSettings(s)
        setForm({ ...s, corsAllowedDomains: s.corsAllowedDomains?.join('\n') || '', ipWhitelist: s.ipWhitelist?.join('\n') || '', ipBlacklist: s.ipBlacklist?.join('\n') || '', allowedTwoFactorMethods: s.allowedTwoFactorMethods || [] })
      }
      setSessions(sessRes.data.result || []); setTwoFactorUsers(uRes.data.result || []); fetchHistory()
    } catch (err) { Swal.fire('Lỗi', 'Không thể tải dữ liệu bảo mật', 'error') }
    finally { setLoading(false) }
  }, [])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const { data } = await securityAPI.getLoginHistory(historyFilters, historyPage)
      setHistory(data.result.content || [])
      setHistoryTotalPages(data.result.totalPages || 0)
      setHistoryTotalElements(data.result.totalElements || 0)
    } finally { setHistoryLoading(false) }
  }

  const fetchSessions = async () => {
    setSessionsLoading(true)
    try {
      const { data } = await securityAPI.getActiveSessions()
      setSessions(data.result || [])
    } finally { setSessionsLoading(false) }
  }

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { 
    fetchHistory()
  }, [historyPage])
  useEffect(() => { 
    const timer = setInterval(fetchSessions, 60000); return () => clearInterval(timer) 
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handle2FAMethodToggle = (method) => {
    setForm(prev => {
      const methods = prev.allowedTwoFactorMethods.includes(method) 
        ? prev.allowedTwoFactorMethods.filter(m => m !== method) 
        : [...prev.allowedTwoFactorMethods, method]
      return { ...prev, allowedTwoFactorMethods: methods }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, corsAllowedDomains: form.corsAllowedDomains.split('\n').filter(d => d.trim()), ipWhitelist: form.ipWhitelist.split('\n').filter(ip => ip.trim()), ipBlacklist: form.ipBlacklist.split('\n').filter(ip => ip.trim()) }
      await securityAPI.updateSecuritySettings(payload)
      Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công',
          text: 'Cấu hình bảo mật đã được áp dụng',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
      }); 
      fetchData()
    } catch (err) { Swal.fire('Lỗi', 'Không thể lưu cấu hình', 'error') }
    finally { setSaving(false) }
  }

  const handleTerminateSession = async (id) => {
    const res = await Swal.fire({ title: 'Chấm dứt phiên?', icon: 'warning', showCancelButton: true })
    if (res.isConfirmed) {
      try { await securityAPI.terminateSession(id); fetchSessions() } catch { Swal.fire('Lỗi', 'Thất bại', 'error') }
    }
  }

  if (loading && !settings) return <div className="py-20 text-center"><div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" /></div>

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Stats Section with Consistent Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
            <div className="p-4 bg-gray-50 rounded-xl text-gray-400 group-hover:text-gray-600 transition-colors">
                <Activity className="h-7 w-7" />
            </div>
            <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Đang hoạt động</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{sessions.length}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
            <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
                <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
                <p className="text-[12px] font-bold text-emerald-600/70 uppercase tracking-wider">Người dùng 2FA</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{twoFactorUsers.length}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
            <div className="p-4 bg-admin-primary/10 rounded-xl text-admin-primary">
                <History className="h-7 w-7" />
            </div>
            <div>
                <p className="text-[12px] font-bold text-admin-primary/70 uppercase tracking-wider">Lịch sử hôm nay</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{history.length}+</h3>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2FA Card - Enhanced UI */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-admin-primary/10 rounded-xl text-admin-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">Xác thực 2 lớp (2FA)</h3>
                <p className="text-[13px] text-gray-500 font-medium">Bảo vệ tài khoản bằng lớp bảo mật thứ hai</p>
              </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="space-y-1">
                <p className="text-[14px] font-bold text-gray-900">Bật 2FA toàn hệ thống</p>
                <p className="text-[12px] text-gray-500 font-medium">Yêu cầu tất cả nhân viên phải sử dụng 2FA</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer scale-110">
                  <input type="checkbox" className="sr-only peer" checked={form.twoFactorEnabled} onChange={(e) => setForm(p=>({...p, twoFactorEnabled: e.target.checked}))} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
          </div>

          {form.twoFactorEnabled && (
              <div className="space-y-3 animate-fade-in">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Các phương thức cho phép</p>
                  <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'SMS', label: 'Tin nhắn SMS', icon: Smartphone },
                        { id: 'EMAIL', label: 'Thư điện tử (Email)', icon: Mail },
                        { id: 'AUTHENTICATOR_APP', label: 'Authenticator App', icon: Key }
                      ].map(m => (
                          <button 
                            key={m.id} 
                            onClick={() => handle2FAMethodToggle(m.id)} 
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all group ${
                                form.allowedTwoFactorMethods.includes(m.id) 
                                ? 'border-admin-primary bg-admin-primary/5' 
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                              <div className="flex items-center gap-3">
                                  <m.icon className={`h-4 w-4 ${form.allowedTwoFactorMethods.includes(m.id) ? 'text-admin-primary' : 'text-gray-400'}`} />
                                  <span className={`text-[13px] font-bold ${form.allowedTwoFactorMethods.includes(m.id) ? 'text-admin-primary' : 'text-gray-500'}`}>{m.label}</span>
                              </div>
                              {form.allowedTwoFactorMethods.includes(m.id) && <ShieldCheck className="h-4 w-4 text-admin-primary" />}
                          </button>
                      ))}
                  </div>
              </div>
          )}
        </div>

        {/* Security Policy Card */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">Chính sách mật khẩu</h3>
                <p className="text-[13px] text-gray-500 font-medium">Thiết lập độ phức tạp và quy tắc đăng nhập</p>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Độ dài Min</label>
                <input 
                    type="number" 
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white font-medium text-[14px] outline-none" 
                    value={form.passwordMinLength} 
                    onChange={handleInputChange} 
                    name="passwordMinLength" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Thử sai tối đa</label>
                <input 
                    type="number" 
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white font-medium text-[14px] outline-none" 
                    value={form.maxFailedLoginAttempts} 
                    onChange={handleInputChange} 
                    name="maxFailedLoginAttempts" 
                />
              </div>
          </div>

          <div className="space-y-2">
              {[
                  { id: 'requireUppercase', label: 'Bắt buộc Chữ in hoa' },
                  { id: 'requireNumeric', label: 'Bắt buộc Chữ số (0-9)' },
                  { id: 'requireSpecialChar', label: 'Bắt buộc Ký tự đặc biệt' }
              ].map(k => (
                  <div key={k.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                      <span className="text-[13px] font-bold text-gray-600">{k.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={form[k.id]} onChange={handleInputChange} name={k.id} className="sr-only peer" />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-primary"></div>
                      </label>
                  </div>
              ))}
          </div>
        </div>
      </div>

      <ActiveSessionsTable sessions={sessions} sessionsLoading={sessionsLoading} fetchSessions={fetchSessions} handleTerminateSession={handleTerminateSession} handleTerminateAllSessions={()=>{}} formatDate={formatDate} formatRelativeTime={formatRelativeTime} />

      <LoginHistoryTable history={history} historyLoading={historyLoading} historyFilters={historyFilters} setHistoryFilters={setHistoryFilters} historyPage={historyPage} setHistoryPage={setHistoryPage} historyTotalPages={historyTotalPages} historyTotalElements={historyTotalElements} fetchHistory={fetchHistory} handleExportHistory={()=>{}} formatDate={formatDate} />

      <div className="flex justify-end pt-6">
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-12 bg-admin-primary text-white px-8 rounded-xl font-bold text-[14px] shadow-sm shadow-admin-primary/20 hover:bg-admin-primary/90 transition-all flex items-center gap-2 active:scale-95"
          >
              {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              <span>{saving ? 'ĐANG ÁP DỤNG...' : 'LƯU CẤU HÌNH BẢO MẬT'}</span>
          </button>
      </div>
    </div>
  )
}

export default SecuritySettings
