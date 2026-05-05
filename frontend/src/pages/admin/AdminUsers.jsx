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

    return (
        <div className="space-y-6 animate-fade-in">
            <AdminPageHeader 
                title="Quản lý" 
                accentTitle="Người dùng"
                subtitle="Quản lý tài khoản, phân quyền và kiểm soát hoạt động hệ thống."
                rightElement={
                    <button 
                        onClick={handleAddUser}
                        className="h-[46px] px-6 bg-primary-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <UserPlus className="h-5 w-5" /> 
                        THÊM THÀNH VIÊN
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            {/* User Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Người dùng</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Liên hệ</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Vai trò</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Chi tiêu</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Quản trị</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                                        Không tìm thấy người dùng phù hợp
                                    </td>
                                </tr>
                            ) : users.map((row) => (
                                <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${!row.enabled ? 'bg-gray-50/50' : ''}`}>
                                    <td className="px-8 py-5">
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
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[13px] font-bold text-gray-700">{maskEmail(row.email)}</p>
                                        <p className={`text-[11px] font-black uppercase tracking-widest ${row.emailVerified ? 'text-green-600' : 'text-orange-500'}`}>
                                            {row.emailVerified ? 'Đã xác minh' : 'Chờ xác minh'}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5">
                                        {getRolePill(row.roles)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[14px] font-black text-gray-900">{currencyFormatter.format(row.totalSpent || 0)}</p>
                                        <p className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">{row.totalOrders || 0} ĐƠN HÀNG</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-1">
                                            {row.enabled ? (
                                                <button 
                                                    onClick={() => handleLockUser(row)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Khóa tài khoản"
                                                >
                                                    <Lock className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUnlockUser(row)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Mở khóa tài khoản"
                                                >
                                                    <Unlock className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleResetPassword(row)}
                                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                title="Reset mật khẩu"
                                            >
                                                <KeyRound className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleChangeRole(row)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Thay đổi vai trò"
                                            >
                                                <UserCog className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && pagination.totalPages > 1 && (
                    <AdminPagination 
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => setPagination(prev => ({...prev, page: p}))}
                    />
                )}
            </div>
        </div>
    )
}

export default AdminUsers
