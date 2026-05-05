import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { usersAPI } from '../../api/users'
import AdminTable from '../../components/admin/AdminTable'
import AdminUsersStats from '../../components/admin/users/AdminUsersStats'
import AdminUsersRowActions from '../../components/admin/users/AdminUsersRowActions'
import { useDebounce } from '../../hooks/useDebounce'
import { 
    UserCog, ShieldAlert, UserPlus, Search, 
    UserCheck, UserX, Lock, Unlock, Eye,
    Filter, ShieldCheck, Users as UsersIcon, ChevronLeft, ChevronRight,
    KeyRound
} from 'lucide-react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'

const AdminUsers = () => {
    const { user: currentUser } = useSelector((state) => state.auth)
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    
    // Pagination and Filter states
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    })

    const [filters, setFilters] = useState({
        role: '',
        status: '',
        emailVerified: null,
        twoFactorEnabled: null
    })
    const [showFilters, setShowFilters] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true)
            const filterRequest = {
                search: debouncedSearch,
                role: filters.role,
                status: filters.status,
                emailVerified: filters.emailVerified,
                twoFactorEnabled: filters.twoFactorEnabled,
                page: pagination.page,
                size: pagination.size,
                sortBy: 'createdAt',
                sortDirection: 'DESC'
            }
            
            const response = await usersAPI.filterUsers(filterRequest)
            const { content, totalElements, totalPages, number } = response.data.result
            
            setUsers(content || [])
            setPagination(prev => ({
                ...prev,
                totalElements,
                totalPages,
                page: number
            }))
        } catch (error) {
            console.error(getApiErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }, [debouncedSearch, filters.role, filters.status, filters.emailVerified, filters.twoFactorEnabled, pagination.page, pagination.size])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleAddUser = useCallback(async () => {
        const isSuperAdmin = currentUser?.role === 'ROLE_SUPER_ADMIN'
        
        const { value: formValues } = await Swal.fire({
            title: '<h2 class="text-2xl font-black text-slate-800">Thêm thành viên mới</h2>',
            html: `
                <div class="space-y-4 py-4">
                    <div class="text-left space-y-1">
                        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ và tên</label>
                        <input id="swal-fullname" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" placeholder="VD: Nguyễn Văn A">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="text-left space-y-1">
                            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                            <input id="swal-email" type="email" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" placeholder="email@example.com">
                        </div>
                        <div class="text-left space-y-1">
                            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</label>
                            <input id="swal-username" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" placeholder="nickname">
                        </div>
                    </div>
                    <div class="text-left space-y-1">
                        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Mật khẩu khởi tạo</label>
                        <input id="swal-password" type="password" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" placeholder="••••••••">
                    </div>
                    <div class="text-left space-y-1">
                        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Vai trò hệ thống</label>
                        <select id="swal-role" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold appearance-none">
                            <option value="ROLE_CUSTOMER">Khách hàng (Customer)</option>
                            <option value="ROLE_STAFF">Nhân viên (Staff)</option>
                            ${isSuperAdmin ? `
                                <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                                <option value="ROLE_SUPER_ADMIN">Super Admin</option>
                            ` : ''}
                        </select>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Tạo tài khoản',
            cancelButtonText: 'Hủy bỏ',
            confirmButtonColor: '#4f46e5',
            preConfirm: () => {
                const fullName = document.getElementById('swal-fullname').value
                const email = document.getElementById('swal-email').value
                const username = document.getElementById('swal-username').value
                const password = document.getElementById('swal-password').value
                const role = document.getElementById('swal-role').value

                if (!fullName || !email || !username || !password) {
                    Swal.showValidationMessage('Vui lòng nhập đầy đủ thông tin!')
                    return false
                }
                return { fullName, email, username, password, role }
            }
        })

        if (formValues) {
            try {
                setIsAdding(true)
                await usersAPI.createUser(formValues)
                fireSuccess('Thành công!', 'Tài khoản mới đã được khởi tạo và sẵn sàng sử dụng.', {
                    timer: 2000,
                    showConfirmButton: false
                })
                fetchUsers()
            } catch (error) {
                fireError(error, 'Không thể tạo tài khoản người dùng.')
            } finally {
                setIsAdding(false)
            }
        }
    }, [currentUser, fetchUsers])

    const handleLockUser = useCallback(async (user) => {
        // Protection: Admin cannot lock Super Admin
        if (user.roles?.includes('ROLE_SUPER_ADMIN') && currentUser?.role !== 'ROLE_SUPER_ADMIN') {
            return fireError({ response: { data: { message: 'Bạn không được phép khóa tài khoản Super Admin!' } } })
        }

        const result = await Swal.fire({
            title: 'Khóa tài khoản?',
            html: `
                <div class="text-left space-y-2">
                    <p>Người dùng <strong>${user.fullName || user.username}</strong> sẽ bị trục xuất khỏi tất cả phiên đăng nhập ngay lập tức.</p>
                    <p class="text-xs text-rose-500 font-bold uppercase tracking-widest">⚠️ Hành động này sẽ vô hiệu hóa tất cả JWT Tokens trong Redis.</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Xác nhận khóa',
            cancelButtonText: 'Bỏ qua'
        })

        if (result.isConfirmed) {
            try {
                await usersAPI.lockUser(user.id)
                fireSuccess('Đã khóa!', 'Tài khoản và tất cả các phiên đăng nhập đã bị vô hiệu hóa.', {
                    timer: 2000,
                    showConfirmButton: false
                })
                fetchUsers()
            } catch (error) {
                fireError(error, 'Không thể thực hiện quy trình khóa')
            }
        }
    }, [currentUser, fetchUsers])

    const handleUnlockUser = useCallback(async (user) => {
        try {
            await usersAPI.unlockUser(user.id)
            fireSuccess('Đã mở khóa tài khoản', '', {
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            })
            fetchUsers()
        } catch (error) {
            fireError(error, 'Thao tác thất bại')
        }
    }, [fetchUsers])

    const handleChangeRole = useCallback(async (user) => {
        // Protection: Admin cannot change Super Admin role
        if (user.roles?.includes('ROLE_SUPER_ADMIN') && currentUser?.role !== 'ROLE_SUPER_ADMIN') {
            return fireError({ response: { data: { message: 'Chỉ Super Admin mới có thể thay đổi quyền hạn của Super Admin khác!' } } })
        }

        const currentRole = (user.roles && user.roles.length > 0) ? user.roles[0] : 'ROLE_CUSTOMER'
        
        // Define options based on permissions
        const inputOptions = {
            'ROLE_CUSTOMER': 'Khách hàng',
            'ROLE_STAFF': 'Nhân viên'
        }
        
        if (currentUser?.role === 'ROLE_SUPER_ADMIN') {
            inputOptions['ROLE_ADMIN'] = 'Quản trị viên'
            inputOptions['ROLE_SUPER_ADMIN'] = 'Super Admin'
        }

        const { value: newRole } = await Swal.fire({
            title: 'Thay đổi quyền hạn',
            text: `Chọn vai trò mới cho ${user.fullName || user.username}`,
            input: 'select',
            inputOptions,
            inputValue: currentRole,
            showCancelButton: true,
            confirmButtonText: 'Tiếp tục',
            cancelButtonText: 'Hủy'
        })

        if (newRole && newRole !== currentRole) {
            try {
                await usersAPI.updateRole(user.id, newRole)
                fireSuccess('Thành công', 'Đã cập nhật vai trò và vô hiệu hóa phiên cũ')
                fetchUsers()
            } catch (error) {
                fireError(error, 'Cập nhật thất bại')
            }
        }
    }, [currentUser, fetchUsers])

    const handleDelete = useCallback(async (user) => {
        // Protection: Admin cannot delete Super Admin
        if (user.roles?.includes('ROLE_SUPER_ADMIN') && currentUser?.role !== 'ROLE_SUPER_ADMIN') {
            return fireError({ response: { data: { message: 'Việc xóa tài khoản Super Admin là bất khả thi với quyền của bạn!' } } })
        }

        if (user.totalOrders > 0) {
            fireSuccess('Không thể xóa!', `<p>Người dùng có <strong>${user.totalOrders} đơn hàng</strong>. Chỉ có thể khóa vĩnh viễn.</p>`, {
                icon: 'warning'
            })
            return
        }

        const result = await Swal.fire({
            title: 'Xóa vĩnh viễn?',
            text: 'Mọi dữ liệu cá nhân của người dùng này sẽ bị hủy bỏ.',
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Xóa ngay'
        })

        if (result.isConfirmed) {
            try {
                await usersAPI.deleteUser(user.id)
                Swal.fire('Đã xóa', 'Người dùng đã rời khỏi hệ thống', 'success')
                fetchUsers()
            } catch (error) {
                Swal.fire('Lỗi', 'Thao tác xóa thất bại', 'error')
            }
        }
    }, [currentUser, fetchUsers])

    const handleResetPassword = useCallback(async (user) => {
        // Protection: Admin cannot reset Super Admin password
        if (user.roles?.includes('ROLE_SUPER_ADMIN') && currentUser?.role !== 'ROLE_SUPER_ADMIN') {
            return Swal.fire('Quyền hạn', 'Bạn không có quyền đặt lại mật khẩu của Super Admin!', 'error')
        }

        const { value: newPassword } = await Swal.fire({
            title: 'Reset mật khẩu',
            text: `Đặt mật khẩu mới cho ${user.fullName || user.username}`,
            input: 'password',
            inputPlaceholder: 'Nhập mật khẩu mới...',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
            inputValidator: (value) => {
                if (!value) return 'Bạn cần nhập mật khẩu!'
                if (value.length < 6) return 'Mật khẩu phải từ 6 ký tự trở lên!'
            }
        })

        if (newPassword) {
            try {
                await usersAPI.resetPassword(user.id, newPassword)
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Mật khẩu đã được thay đổi. Tất cả phiên đăng nhập cũ đã được vô hiệu hóa.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                Swal.fire('Lỗi', error.response?.data?.message || 'Không thể đặt lại mật khẩu', 'error')
            }
        }
    }, [currentUser, fetchUsers])

    const getRoleBadge = useCallback((roles) => {
        const role = (roles && roles.length > 0) ? roles[0] : 'ROLE_CUSTOMER'
        const roleConfig = {
            'ROLE_SUPER_ADMIN': { label: 'Super Admin', className: 'bg-purple-100 text-purple-700 border-purple-200' },
            'ROLE_ADMIN': { label: 'Admin', className: 'bg-amber-100 text-amber-700 border-amber-200' },
            'ROLE_STAFF': { label: 'Staff', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
            'ROLE_CUSTOMER': { label: 'Customer', className: 'bg-blue-100 text-blue-700 border-blue-200' }
        }
        const config = roleConfig[role] || roleConfig['ROLE_CUSTOMER']
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.className}`}>
                {config.label}
            </span>
        )
    }, [])

    const currencyFormatter = useMemo(
        () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
        []
    )

    const formatCurrency = useCallback((value) => {
        const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0
        return currencyFormatter.format(numericValue)
    }, [currencyFormatter])

    const adminStats = useMemo(() => ([
        { label: 'Tổng số', value: pagination.totalElements, icon: UsersIcon, color: 'blue' },
        { label: 'Vai trò Admin', value: users.filter(u => u.roles?.includes('ROLE_ADMIN')).length, icon: ShieldAlert, color: 'amber' },
        { label: 'Đã khóa', value: users.filter(u => !u.enabled).length, icon: UserX, color: 'rose' },
        { label: 'Đã xác minh', value: users.filter(u => u.emailVerified).length, icon: ShieldCheck, color: 'emerald' }
    ]), [pagination.totalElements, users])

    const maskEmail = useCallback((email) => {
        if (!email) return '---'
        const [user, domain] = email.split('@')
        if (!user || !domain) return email
        if (user.length <= 3) return `***@${domain}`
        return `${user.substring(0, 3)}***@${domain}`
    }, [])

    const getUserInitial = useCallback((user) => {
        const source = user?.fullName?.trim() || user?.username?.trim() || user?.email?.trim() || '?'
        return source.charAt(0).toUpperCase()
    }, [])

    const columns = useMemo(() => [
        { 
            key: 'user', 
            label: 'Người dùng & Tài khoản',
            render: (_, row) => (
                <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black overflow-hidden shadow-sm transition-transform duration-300 group-hover/avatar:scale-105 ${row.enabled ? 'bg-gradient-to-tr from-indigo-600 to-violet-600' : 'bg-slate-400 grayscale'}`}>
                            {row.avatar ? <img src={row.avatar} alt="" className="w-full h-full object-cover" /> : getUserInitial(row)}
                        </div>
                        {row.enabled && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <p className={`text-sm font-black ${row.enabled ? 'text-slate-900' : 'text-slate-400 italic'}`}>{row.fullName || 'Chưa đặt tên'}</p>
                             {row.roles?.includes('ROLE_SUPER_ADMIN') && <ShieldCheck className="h-3 w-3 text-purple-500" />}
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: 'contact', 
            label: 'Thông tin bảo mật',
            render: (_, row) => (
                <div className="space-y-1.5 min-w-[180px]">
                    <div className="flex items-center gap-2 group/email">
                        <p className="text-sm font-bold text-slate-600 font-mono tracking-tighter" title={row.email}>
                            {maskEmail(row.email)}
                        </p>
                        <button 
                            className="p-1 opacity-0 group-hover/email:opacity-100 hover:bg-slate-50 rounded transition-all"
                            onClick={() => Swal.fire({ title: 'Chi tiết Email', text: row.email, icon: 'info' })}
                        >
                            <Eye className="h-3 w-3 text-slate-400" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {row.emailVerified ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                <UserCheck className="h-3 w-3" /> Đã xác minh
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100">
                                <ShieldAlert className="h-3 w-3" /> Chờ xác minh
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        { 
            key: 'roles', 
            label: 'Quyền hạn',
            render: (value) => getRoleBadge(value)
        },
        { 
            key: 'activity', 
            label: 'Hoạt động & Doanh thu',
            render: (_, row) => (
                <div className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Đơn hàng:</span>
                        <span className="text-sm font-black text-slate-800">{row.totalOrders || 0}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tight">Tổng chi:</span>
                         <span className="text-sm font-black text-indigo-600 tracking-tighter">{formatCurrency(row.totalSpent)}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'quick_actions',
            label: 'Quản trị viên',
            render: (_, row) => (
                <div className="flex items-center gap-2 justify-center">
                    {row.enabled ? (
                        <button 
                            onClick={() => handleLockUser(row)}
                            className="flex flex-col items-center gap-1 p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                            title="Khóa vĩnh viễn"
                        >
                            <Lock className="h-4 w-4" />
                            <span className="text-[7px] font-black uppercase">Khóa</span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleUnlockUser(row)}
                            className="flex flex-col items-center gap-1 p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all"
                            title="Mở khóa tài khoản"
                        >
                            <Unlock className="h-4 w-4" />
                            <span className="text-[7px] font-black uppercase">Gỡ</span>
                        </button>
                    )}
                    <button 
                        onClick={() => handleResetPassword(row)}
                        className="flex flex-col items-center gap-1 p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all"
                        title="Reset mật khẩu mới"
                    >
                        <KeyRound className="h-4 w-4" />
                        <span className="text-[7px] font-black uppercase">Mật khẩu</span>
                    </button>
                    <button 
                        onClick={() => handleChangeRole(row)}
                        className="flex flex-col items-center gap-1 p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                        title="Nâng/Hạ cấp vai trò"
                    >
                        <UserCog className="h-4 w-4" />
                        <span className="text-[7px] font-black uppercase">Vai trò</span>
                    </button>
                </div>
            )
        }
    ], [formatCurrency, getRoleBadge, getUserInitial, handleChangeRole, handleLockUser, handleResetPassword, handleUnlockUser, maskEmail])

    const clearFilters = useCallback(() => {
        setFilters({ role: '', status: '', emailVerified: null, twoFactorEnabled: null })
        setSearchTerm('')
        setPagination(prev => ({ ...prev, page: 0 }))
    }, [])

    return (
        <div className="space-y-5 sm:space-y-8 pb-12 animate-fade-in">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-xs font-bold uppercase tracking-[0.2em] mb-3">
                        Users
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-dark-text tracking-tight">
                        Quản lý <span className="text-primary-main">người dùng</span>
                    </h1>
                    <p className="text-sm sm:text-base font-medium text-text-secondary dark:text-gray-400 mt-2 leading-relaxed">
                        Quản lý tài khoản, phân quyền và kiểm soát hoạt động của người dùng trong hệ thống.
                    </p>
                </div>
            </div>

            {/* Stats Header */}
            <AdminUsersStats stats={adminStats} />

            {/* Filter Bar */}
            <div className="bg-white dark:bg-dark-card p-4 sm:p-5 rounded-[1.75rem] shadow-sm border border-border dark:border-dark-border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm khách hàng (Tên, Email, Username)..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({...p, page: 0})); }}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 rounded-2xl border flex items-center gap-2 font-bold text-sm transition-all ${showFilters ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
                        >
                            <Filter className="h-5 w-5" /> Bộ lọc
                        </button>
                        <button 
                            onClick={handleAddUser}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                            <UserPlus className="h-5 w-5" /> Thêm mới
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-down">
                        <select 
                            className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                            value={filters.role}
                            onChange={(e) => { setFilters({...filters, role: e.target.value}); setPagination(p => ({...p, page: 0})); }}
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="ROLE_ADMIN">Quản trị viên</option>
                            <option value="ROLE_STAFF">Nhân viên</option>
                            <option value="ROLE_CUSTOMER">Khách hàng</option>
                        </select>
                        <select 
                            className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                            value={filters.status}
                            onChange={(e) => { setFilters({...filters, status: e.target.value}); setPagination(p => ({...p, page: 0})); }}
                        >
                            <option value="">Trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="LOCKED">Đã khóa</option>
                        </select>
                        <button onClick={clearFilters} className="text-xs font-black uppercase text-rose-500 hover:bg-rose-50 rounded-xl px-4 transition-all">Xóa tất cả bộ lọc</button>
                    </div>
                )}
            </div>

            {/* User Table */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <AdminTable
                    columns={columns}
                    data={users}
                    isLoading={isLoading}
                    showIndex={true}
                    currentPage={pagination.page}
                    pageSize={pagination.size}
                    rowClassName={(row) => !row.enabled ? 'bg-slate-50/50' : ''}
                    actions={(user) => <AdminUsersRowActions user={user} onDelete={handleDelete} />}
                />

                {/* Pagination */}
                {!isLoading && pagination.totalPages > 1 && (
                    <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Trang <span className="text-indigo-600">{pagination.page + 1}</span> của {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPagination(prev => ({...prev, page: Math.max(0, prev.page - 1)}))}
                                disabled={pagination.page === 0}
                                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-20 hover:shadow-md transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={() => setPagination(prev => ({...prev, page: Math.min(prev.totalPages - 1, prev.page + 1)}))}
                                disabled={pagination.page === pagination.totalPages - 1}
                                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-20 hover:shadow-md transition-all"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminUsers
