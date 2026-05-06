import { useState, useEffect, useCallback } from 'react'
import { logsAPI } from '../../../api/logs'
import { 
  Search, Filter, Calendar, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Info, Clock, User, Globe, Activity,
  RefreshCw, Download
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

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

    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'ERROR': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const getStatusStyles = (status) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
            case 'ERROR': return 'bg-red-50 text-red-700 border-red-100'
            default: return 'bg-blue-50 text-blue-700 border-blue-100'
        }
    }

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

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Trang {currentPage + 1} / {totalPages || 1}</span>
                    <button 
                        disabled={currentPage === 0 || loading}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                        disabled={currentPage >= totalPages - 1 || loading}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 transition-all"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-bottom border-gray-100">
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Người dùng</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Hành động</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Thông báo</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(8).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4">
                                            <div className="h-6 bg-gray-100 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                                                <Activity className="h-10 w-10" />
                                            </div>
                                            <p className="text-gray-400 font-bold">Không tìm thấy nhật ký nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                                                </span>
                                                <span className="text-[11px] font-medium text-gray-400 uppercase">
                                                    {format(new Date(log.timestamp), 'dd MMM, yyyy', { locale: vi })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <User className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{log.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${getStatusStyles(log.status)}`}>
                                                {getStatusIcon(log.status)}
                                                {log.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-gray-600 font-medium truncate group-hover:text-clip group-hover:whitespace-normal">
                                                {log.message}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-gray-400">
                                                <Globe className="h-3.5 w-3.5" />
                                                <span className="text-xs font-mono">{log.ipAddress || '0.0.0.0'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
