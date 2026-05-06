import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { usersAPI } from '../../api/users'
import { 
    UserCog, ShieldAlert, UserPlus, Search, 
    UserX, Lock, Unlock, KeyRound, Filter, ShieldCheck, Users as UsersIcon
} from 'lucide-react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'
import { useDebounce } from '../../hooks/useDebounce'
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader'
import AdminPagination from '../../components/admin/shared/AdminPagination'
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard'
import AdminPill from '../../components/admin/shared/AdminPill'
import AdminTable from '../../components/admin/AdminTable'

const AdminUsers = () => {
    const { user: currentUser } = useSelector((state) => state.auth)
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [selectedIds, setSelectedIds] = useState([])
    
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
            title: 'Thêm thành viên mới',
            html: `
                <div class="space-y-4 py-4 text-left">
                    <div class="space-y-1">
                        <label class="text-[11px] font-black uppercase tracking-widest text-gray-400">Họ và tên</label>
                        <input id="swal-fullname" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold" placeholder="VD: Nguyễn Văn A">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <label class="text-[11px] font-black uppercase tracking-widest text-gray-400">Email</label>
                            <input id="swal-email" type="email" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold" placeholder="email@example.com">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-black uppercase tracking-widest text-gray-400">Username</label>
                            <input id="swal-username" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold" placeholder="nickname">
                        </div>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[11px] font-black uppercase tracking-widest text-gray-400">Mật khẩu khởi tạo</label>
                        <input id="swal-password" type="password" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold" placeholder="••••••••">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[11px] font-black uppercase tracking-widest text-gray-400">Vai trò hệ thống</label>
                        <select id="swal-role" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold appearance-none">
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
            customClass: {
                confirmButton: 'bg-primary-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
                cancelButton: 'bg-gray-100 text-gray-600 font-bold px-6 py-2 rounded-lg'
            },
            buttonsStyling: false,
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
                await usersAPI.createUser(formValues)
                fireSuccess('Thành công!', 'Tài khoản mới đã được khởi tạo.')
                fetchUsers()
            } catch (error) {
                fireError(error, 'Không thể tạo tài khoản')
            }
        }
    }, [currentUser, fetchUsers])

    const handleLockUser = useCallback(async (user) => {
        if (user.roles?.includes('ROLE_SUPER_ADMIN') && currentUser?.role !== 'ROLE_SUPER_ADMIN') {
            return fireError({ response: { data: { message: 'Bạn không được phép khóa tài khoản Super Admin!' } } })
        }

        const result = await Swal.fire({
            title: 'Khóa tài khoản?',
            html: `Người dùng <strong>${user.fullName || user.username}</strong> sẽ bị trục xuất ngay lập tức.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận khóa',
            cancelButtonText: 'Bỏ qua',
            customClass: {
                confirmButton: 'bg-red-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
                cancelButton: 'bg-gray-100 text-gray-600 font-bold px-6 py-2 rounded-lg'
            },
            buttonsStyling: false
        })

        if (result.isConfirmed) {
            try {
                await usersAPI.lockUser(user.id)
                fireSuccess('Đã khóa!', 'Tài khoản đã bị vô hiệu hóa.')
                fetchUsers()
            } catch (error) {
                fireError(error, 'Thao tác thất bại')
            }
        }
    }, [currentUser, fetchUsers])

    const handleUnlockUser = useCallback(async (user) => {
        try {
            await usersAPI.unlockUser(user.id)
            fireSuccess('Thành công', 'Đã mở khóa tài khoản')
            fetchUsers()
        } catch (error) {
            fireError(error, 'Thao tác thất bại')
        }
    }, [fetchUsers])

    const handleChangeRole = useCallback(async (user) => {
        if (user.roles?.includes('ROLE_SUPER_ADMIN') && currentUser?.role !== 'ROLE_SUPER_ADMIN') {
            return fireError({ response: { data: { message: 'Chỉ Super Admin mới có thể thay đổi quyền hạn này!' } } })
        }

        const currentRole = (user.roles && user.roles.length > 0) ? user.roles[0] : 'ROLE_CUSTOMER'
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
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-primary-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
                cancelButton: 'bg-gray-100 text-gray-600 font-bold px-6 py-2 rounded-lg'
            },
            buttonsStyling: false
        })

        if (newRole && newRole !== currentRole) {
            try {
                await usersAPI.updateRole(user.id, newRole)
                fireSuccess('Thành công', 'Đã cập nhật vai trò')
                fetchUsers()
            } catch (error) {
                fireError(error, 'Cập nhật thất bại')
            }
        }
    }, [currentUser, fetchUsers])

    const handleResetPassword = useCallback(async (user) => {
        if (user.roles?.includes('ROLE_SUPER_ADMIN') && currentUser?.role !== 'ROLE_SUPER_ADMIN') {
            return fireError({ response: { data: { message: 'Bạn không có quyền này!' } } })
        }

        const { value: newPassword } = await Swal.fire({
            title: 'Reset mật khẩu',
            input: 'password',
            inputPlaceholder: 'Nhập mật khẩu mới...',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-primary-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
                cancelButton: 'bg-gray-100 text-gray-600 font-bold px-6 py-2 rounded-lg'
            },
            buttonsStyling: false,
            inputValidator: (value) => {
                if (!value) return 'Bạn cần nhập mật khẩu!'
                if (value.length < 6) return 'Mật khẩu phải từ 6 ký tự trở lên!'
            }
        })

        if (newPassword) {
            try {
                await usersAPI.resetPassword(user.id, newPassword)
                fireSuccess('Thành công!', 'Mật khẩu đã được thay đổi.')
            } catch (error) {
                fireError(error, 'Không thể đặt lại mật khẩu')
            }
        }
    }, [currentUser])

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(users.map(u => u.id))
        } else {
            setSelectedIds([])
        }
    }

    const userColumns = [
        {
            key: 'user',
            label: 'Người dùng',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[15px] font-bold overflow-hidden shadow-sm ${row.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
                            {row.avatar ? <img src={row.avatar} alt="" className="w-full h-full object-cover" /> : (row.fullName?.[0] || row.username?.[0] || '?').toUpperCase()}
                        </div>
                        {row.enabled && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div>
                        <p className={`text-[14px] font-bold ${row.enabled ? 'text-gray-900' : 'text-gray-400 italic'}`}>{row.fullName || 'Chưa đặt tên'}</p>
                        <p className="text-[12px] text-gray-400 font-medium">@{row.username}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'contact',
            label: 'Liên hệ',
            render: (_, row) => (
                <div>
                    <p className="text-[13px] font-bold text-gray-700">{maskEmail(row.email)}</p>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${row.emailVerified ? 'text-green-600' : 'text-orange-500'}`}>
                        {row.emailVerified ? 'Đã xác minh' : 'Chờ xác minh'}
                    </p>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Vai trò',
            render: (_, row) => getRolePill(row.roles)
        },
        {
            key: 'spending',
            label: 'Chi tiêu',
            render: (_, row) => (
                <div>
                    <p className="text-[14px] font-black text-gray-900">{currencyFormatter.format(row.totalSpent || 0)}</p>
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">{row.totalOrders || 0} ĐƠN HÀNG</p>
                </div>
            )
        }
    ]

    const getRolePill = useCallback((roles) => {
        const role = (roles && roles.length > 0) ? roles[0] : 'ROLE_CUSTOMER'
        switch (role) {
            case 'ROLE_SUPER_ADMIN': return <AdminPill label="Super Admin" type="danger" />
            case 'ROLE_ADMIN': return <AdminPill label="Admin" type="warning" />
            case 'ROLE_STAFF': return <AdminPill label="Staff" type="info" />
            default: return <AdminPill label="Customer" type="success" />
        }
    }, [])

    const currencyFormatter = useMemo(() => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }), [])

    const adminStats = useMemo(() => ([
        { label: 'Tổng số', value: pagination.totalElements, icon: UsersIcon, type: 'blue' },
        { label: 'Vai trò Admin', value: users.filter(u => u.roles?.includes('ROLE_ADMIN')).length, icon: ShieldAlert, type: 'orange' },
        { label: 'Đã khóa', value: users.filter(u => !u.enabled).length, icon: UserX, type: 'danger' },
        { label: 'Đã xác minh', value: users.filter(u => u.emailVerified).length, icon: ShieldCheck, type: 'success' }
    ]), [pagination.totalElements, users])

    const maskEmail = useCallback((email) => {
        if (!email) return '---'
        const [user, domain] = email.split('@')
        if (!user || !domain) return email
        if (user.length <= 3) return `***@${domain}`
        return `${user.substring(0, 3)}***@${domain}`
    }, [])

    const clearFilters = useCallback(() => {
        setFilters({ role: '', status: '', emailVerified: null, twoFactorEnabled: null })
        setSearchTerm('')
        setPagination(prev => ({ ...prev, page: 0 }))
    }, [])

    const bulkActionBar = selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-2 shadow-lg animate-scale-up mr-4">
            <span className="text-[13px] font-bold">
                Đã chọn <span className="text-primary-500 font-black">{selectedIds.length}</span>
            </span>
            <div className="w-[1px] h-4 bg-gray-700"></div>
            <button 
                onClick={async () => {
                    const res = await Swal.fire({
                        title: 'Khóa hàng loạt?',
                        text: `Bạn có chắc muốn khóa ${selectedIds.length} người dùng đã chọn?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Đồng ý',
                        cancelButtonText: 'Hủy'
                    })
                    if (res.isConfirmed) {
                        try {
                            await Promise.all(selectedIds.map(id => usersAPI.lockUser(id)))
                            fireSuccess('Thành công', 'Đã khóa các người dùng đã chọn')
                            setSelectedIds([])
                            fetchUsers()
                        } catch (err) { fireError(err, 'Lỗi khi khóa hàng loạt') }
                    }
                }}
                className="text-[13px] font-bold text-red-400 hover:text-red-300 transition-colors"
            >
                Khóa nhanh
            </button>
            <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
            </button>
        </div>
    )

    return (
        <div className="space-y-6 animate-fade-in">
            <AdminPageHeader 
                title="Quản lý" 
                accentTitle="Người dùng"
                subtitle="Quản lý tài khoản, phân quyền và kiểm soát hoạt động hệ thống."
                rightContent={
                    <div className="flex items-center gap-3">
                        {bulkActionBar}
                        <button 
                            onClick={handleAddUser}
                            className="h-[46px] px-6 bg-primary-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <UserPlus className="h-5 w-5" /> 
                            THÊM THÀNH VIÊN
                        </button>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {adminStats.map((stat, i) => (
                    <AdminStatsCard 
                        key={i}
                        title={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        type={stat.type}
                    />
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm người dùng (Tên, Email, Username)..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({...p, page: 0})); }}
                            className="w-full h-[46px] pl-12 pr-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-medium"
                        />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-[46px] px-5 rounded-xl border flex items-center justify-center gap-2 font-bold text-[13px] transition-all ${showFilters ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Filter className="h-4 w-4" /> 
                        BỘ LỌC
                    </button>
                </div>

                {showFilters && (
                    <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Vai trò</label>
                            <select 
                                className="w-full h-11 bg-gray-50 border-none rounded-xl px-4 text-[14px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary-600/20 transition-all"
                                value={filters.role}
                                onChange={(e) => { setFilters({...filters, role: e.target.value}); setPagination(p => ({...p, page: 0})); }}
                            >
                                <option value="">Tất cả vai trò</option>
                                <option value="ROLE_ADMIN">Quản trị viên</option>
                                <option value="ROLE_STAFF">Nhân viên</option>
                                <option value="ROLE_CUSTOMER">Khách hàng</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Trạng thái</label>
                            <select 
                                className="w-full h-11 bg-gray-50 border-none rounded-xl px-4 text-[14px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary-600/20 transition-all"
                                value={filters.status}
                                onChange={(e) => { setFilters({...filters, status: e.target.value}); setPagination(p => ({...p, page: 0})); }}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="LOCKED">Đã khóa</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={clearFilters} className="h-11 px-6 rounded-xl border border-gray-200 text-gray-500 font-bold text-[13px] hover:bg-gray-50 transition-all uppercase tracking-wider">
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <AdminTable 
                    columns={userColumns}
                    data={users}
                    isLoading={isLoading}
                    selectedRows={selectedIds}
                    onSelectRow={(row) => {
                        const id = row.id;
                        if (selectedIds.includes(id)) {
                            setSelectedIds(selectedIds.filter(i => i !== id))
                        } else {
                            setSelectedIds([...selectedIds, id])
                        }
                    }}
                    onSelectAll={(allSelected) => {
                        if (allSelected) {
                            setSelectedIds(users.map(u => u.id))
                        } else {
                            setSelectedIds([])
                        }
                    }}
                    actions={(row, closeDropdown) => (
                        <div className="space-y-1">
                            {row.enabled ? (
                                <button 
                                    onClick={() => { handleLockUser(row); closeDropdown?.() }}
                                    className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors"
                                >
                                    <Lock className="h-4 w-4" /> Khóa tài khoản
                                </button>
                            ) : (
                                <button 
                                    onClick={() => { handleUnlockUser(row); closeDropdown?.() }}
                                    className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 flex items-center gap-3 transition-colors"
                                >
                                    <Unlock className="h-4 w-4" /> Mở khóa
                                </button>
                            )}
                            <button 
                                onClick={() => { handleResetPassword(row); closeDropdown?.() }}
                                className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                            >
                                <KeyRound className="h-4 w-4 text-orange-500" /> Đổi mật khẩu
                            </button>
                            <button 
                                onClick={() => { handleChangeRole(row); closeDropdown?.() }}
                                className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                            >
                                <UserCog className="h-4 w-4 text-blue-500" /> Phân quyền
                            </button>
                        </div>
                    )}
                    renderMobileCard={(row, index, renderActions) => (
                        <div key={row.id || index} className="p-4 border-b border-gray-50 dark:border-white/5 animate-fade-in hover:bg-gray-50/50 transition-colors">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-[16px] font-black overflow-hidden shadow-sm border-2 ${row.enabled ? 'bg-primary-600 border-primary-100' : 'bg-gray-300 border-gray-200'}`}>
                                                {row.avatar ? (
                                                    <img src={row.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    (row.fullName?.[0] || row.username?.[0] || '?').toUpperCase()
                                                )}
                                            </div>
                                            {row.enabled && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`text-[15px] font-black tracking-tight truncate ${row.enabled ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                {row.fullName || 'Chưa đặt tên'}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] font-bold text-gray-400">@{row.username}</span>
                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                    ID: {row.id.substring(0, 8)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {renderActions(row, index)}
                                </div>

                                <div className="grid grid-cols-2 gap-3 py-2 px-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Quyền hạn</span>
                                        <div className="flex mt-0.5 scale-90 origin-left">{getRolePill(row.roles)}</div>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Chi tiêu</span>
                                        <span className="text-[13px] font-black text-secondary-900">
                                            {currencyFormatter.format(row.totalSpent || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-bold text-gray-700">{maskEmail(row.email)}</span>
                                            {row.emailVerified && (
                                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${row.emailVerified ? 'text-green-600' : 'text-orange-500'}`}>
                                            {row.emailVerified ? 'ĐÃ XÁC MINH' : 'CHỜ XÁC MINH'}
                                        </span>
                                    </div>
                                    <div className="text-right flex flex-col gap-0.5">
                                        <span className="text-[14px] font-black text-gray-900">
                                            {row.totalOrders || 0}
                                        </span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">ĐƠN HÀNG</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button 
                                        onClick={() => handleChangeRole(row)}
                                        className="flex-1 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-black text-gray-600 uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                                    >
                                        Phân quyền
                                    </button>
                                    <button 
                                        onClick={() => handleResetPassword(row)}
                                        className="flex-1 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-black text-gray-600 uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                                    >
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </div>

            {!isLoading && pagination.totalPages > 1 && (
                <div className="mt-4">
                    <AdminPagination 
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => setPagination(prev => ({...prev, page: p}))}
                    />
                </div>
            )}
        </div>
    )
}

export default AdminUsers
