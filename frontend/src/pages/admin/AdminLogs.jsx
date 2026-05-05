import React, { useState, useEffect } from 'react';
import { logsAPI } from '../../api/logs';
import { 
  FileText,
  User,
  Terminal,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Command,
  TerminalSquare
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const toDateInputValue = (date) => date.toISOString().slice(0, 10);
    const [startDate, setStartDate] = useState(toDateInputValue(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState(toDateInputValue(new Date()));
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [page, statusFilter, startDate, endDate]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: pageSize,
                status: statusFilter === 'All' ? 'ALL' : statusFilter,
                startDate: startDate ? `${startDate}T00:00:00.000` : undefined,
                endDate: endDate ? `${endDate}T23:59:59.999` : undefined
            };
            console.log(`[Logs] Fetching logs with params:`, params);
            const response = await logsAPI.getLogs(params);
            console.log(`[Logs] Raw response from BFF:`, response.data);
            
            const rawData = response.data.result;
            let content = [];
            let totalPages = 0;
            let totalElements = 0;

            if (Array.isArray(rawData)) {
                content = rawData;
                totalElements = rawData.length;
                totalPages = 1;
            } else if (rawData && rawData.content) {
                content = rawData.content;
                totalPages = rawData.totalPages;
                totalElements = rawData.totalElements;
            }

            setLogs(content || []);
            setTotalPages(totalPages || 0);
            setTotalElements(totalElements || 0);
            console.log(`[Logs] Extracted data:`, { contentSize: content?.length, totalElements });
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    return (
        <div className="space-y-6 animate-fade-in mb-10">
            <AdminPageHeader 
                title="System" 
                accentTitle="Logs"
                subtitle="Trung tâm điều tra và truy vết hoạt động hệ thống theo thời gian thực."
            />

            {/* Filter Section */}
            <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-xl border border-slate-100 dark:border-dark-border overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-dark-border bg-slate-50/30 flex flex-col xl:flex-row gap-6 justify-between items-end">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full xl:w-auto">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Từ ngày</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-bold"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Đến ngày</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-bold"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trạng thái</label>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <select 
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold appearance-none cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                >
                                    <option value="ALL">Tất cả trạng thái</option>
                                    <option value="SUCCESS">Thành công</option>
                                    <option value="FAILURE">Thất bại</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full xl:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm nhanh (Action, User...)" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Action</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Operator</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Detail</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">IP Address</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(pageSize).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6 bg-slate-50/30"></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-50 rounded-full">
                                                <TerminalSquare className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-bold tracking-tight">Không tìm thấy dữ liệu nhật ký</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.filter(l => 
                                    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    l.username?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((log) => (
                                    <tr key={log.id} className="group hover:bg-indigo-50/30 transition-all duration-300 cursor-default">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                <span className="text-[10px] font-black text-slate-400">{new Date(log.timestamp).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black font-mono border border-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center shadow-sm">
                                                    <User className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{log.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <button 
                                                onClick={() => handleViewDetails(log)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-xs font-bold text-slate-500 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>Chi tiết</span>
                                            </button>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-slate-400 font-bold font-mono">
                                            {log.ipAddress}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {log.status === 'SUCCESS' ? (
                                                <div className="flex justify-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <CheckCircle2 className="h-3 w-3" /> OK
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                                                        <XCircle className="h-3 w-3" /> Error
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                        <p className="text-xs font-bold text-slate-400">
                            Hiển thị trang <span className="text-indigo-600">{page + 1}</span> / {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                disabled={page === 0}
                                className="p-2 hover:bg-white border rounded-xl disabled:opacity-30 transition-all hover:shadow-md h-10 w-10 flex items-center justify-center"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={page === totalPages - 1}
                                className="p-2 hover:bg-white border rounded-xl disabled:opacity-30 transition-all hover:shadow-md h-10 w-10 flex items-center justify-center"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* JSON Detail Modal */}
            {showModal && selectedLog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden border border-white/20">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${selectedLog.status === 'SUCCESS' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                    <Terminal className={`h-6 w-6 ${selectedLog.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'}`} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chi tiết hoạt động</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedLog.action}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <XCircle className="h-8 w-8 text-slate-300" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian</p>
                                    <p className="text-sm font-bold text-slate-700">{new Date(selectedLog.timestamp).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa chỉ IP</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedLog.ipAddress}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Thông điệp hệ thống</p>
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                    <p className="text-sm font-medium text-indigo-900 leading-relaxed italic">
                                        "{selectedLog.message}"
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Dữ liệu Kỹ thuật (Payload)</p>
                                <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden shadow-inner">
                                    <pre className="text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                        {selectedLog.details ? (
                                            (() => {
                                                try {
                                                    return JSON.stringify(JSON.parse(selectedLog.details), null, 4);
                                                } catch (e) {
                                                    return selectedLog.details;
                                                }
                                            })()
                                        ) : (
                                            "// Không có dữ liệu JSON chi tiết"
                                        )}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;
