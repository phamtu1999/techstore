import { useState, useEffect, useCallback } from 'react'
import { logsAPI } from '../../../api/logs'
import { 
  Search, Filter, Calendar, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Info, Clock, User, Globe, Activity,
  RefreshCw, Download
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import AdminTable from '../AdminTable'
import AdminPill from '../shared/AdminPill'
import AdminPagination from '../shared/AdminPagination'

const SystemLogs = () => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [totalElements, setTotalElements] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize] = useState(20)
    
    // Filters
    const [status, setStatus] = useState('ALL')
    const [action, setAction] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                status: status === 'ALL' ? null : status,
                action: action || null
            }
            const response = await logsAPI.getLogs(params)
            const result = response.data.result
            setLogs(result.content)
            setTotalElements(result.totalElements)
            setTotalPages(result.totalPages)
        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, status, action])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const logColumns = [
        {
            key: 'timestamp',
            label: 'Thời gian',
            render: (val) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                        {format(new Date(val), 'HH:mm:ss')}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 uppercase">
                        {format(new Date(val), 'dd MMM, yyyy', { locale: vi })}
                    </span>
                </div>
            )
        },
        {
            key: 'username',
            label: 'Người dùng',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{val}</span>
                </div>
            )
        },
        {
            key: 'action',
            label: 'Hành động',
            render: (val) => (
                <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                    {val}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (val) => (
                <AdminPill 
                    label={val} 
                    type={val === 'SUCCESS' ? 'success' : val === 'ERROR' ? 'danger' : 'gray'} 
                />
            )
        },
        {
            key: 'message',
            label: 'Thông báo',
            render: (val) => (
                <p className="text-sm text-gray-600 font-medium line-clamp-1 hover:line-clamp-none transition-all">
                    {val}
                </p>
            )
        },
        {
            key: 'ipAddress',
            label: 'IP Address',
            render: (val) => (
                <div className="flex items-center gap-1.5 text-gray-400">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="text-xs font-mono">{val || '0.0.0.0'}</span>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Tổng hoạt động</p>
                        <h4 className="text-xl font-black text-gray-900">{totalElements.toLocaleString()}</h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Thành công</p>
                        <h4 className="text-xl font-black text-gray-900">Ổn định</h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Cập nhật cuối</p>
                        <h4 className="text-xl font-black text-gray-900">Vừa xong</h4>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm hành động..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="bg-gray-50 border-none rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-primary-500/20 outline-none font-medium text-gray-700"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="SUCCESS">Thành công</option>
                        <option value="ERROR">Thất bại</option>
                    </select>

                    <button 
                        onClick={() => {
                            setCurrentPage(0)
                            fetchLogs()
                        }}
                        className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <AdminTable 
                    columns={logColumns}
                    data={logs}
                    isLoading={loading}
                    renderMobileCard={(log, index) => (
                        <div key={log.id || index} className="p-4 border-b border-gray-50 dark:border-white/5 animate-fade-in">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-black text-gray-900">{log.username}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {format(new Date(log.timestamp), 'HH:mm:ss - dd MMM, yyyy', { locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                    <AdminPill 
                                        label={log.status} 
                                        type={log.status === 'SUCCESS' ? 'success' : log.status === 'ERROR' ? 'danger' : 'gray'} 
                                    />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                                        {log.action}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-gray-400 pl-2">
                                        <Globe className="h-3 w-3" />
                                        <span className="text-[10px] font-mono">{log.ipAddress || '0.0.0.0'}</span>
                                    </div>
                                </div>

                                <p className="text-[13px] text-gray-600 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                    {log.message}
                                </p>
                            </div>
                        </div>
                    )}
                />
            </div>

            <div className="mt-4">
                <AdminPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Pagination Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 font-medium px-2">
                <p>Hiển thị {logs.length} trên tổng số {totalElements} kết quả</p>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs text-gray-600">
                        <Download className="h-4 w-4" />
                        XUẤT BÁO CÁO (CSV)
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SystemLogs
