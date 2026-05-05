import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Video, Plus, Radio, StopCircle, ShoppingBag, 
    Search, Users, ExternalLink, Calendar, Trash2 
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import api from '../../utils/axios';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import { fireError } from '../../utils/swalError';
import { X } from 'lucide-react';

const AdminLivestreams = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [streams, setStreams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newStream, setNewStream] = useState({ title: '', thumbnailUrl: '', streamUrl: '' });
    
    const [activeStream, setActiveStream] = useState(null);
    const [searchProduct, setSearchProduct] = useState('');
    const [products, setProducts] = useState([]);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchStreams = async () => {
        try {
            const response = await api.get('/livestreams');
            setStreams(response.data.result || []);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải danh sách livestream', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStreams();
    }, []);

    const handleCreateStream = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/livestreams', newStream);
            Swal.fire({ icon: 'success', title: 'Thành công', text: 'Bắt đầu buổi livestream thành công', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            setActiveStream(response.data.result);
            setIsCreating(false);
            fetchStreams();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể khởi tạo livestream', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }
    };

    const handleEndStream = async (id) => {
        try {
            await api.patch(`/admin/livestreams/${id}/status?status=ENDED`);
            Swal.fire({ icon: 'success', title: 'Đã kết thúc', text: 'Đã kết thúc buổi livestream', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            setActiveStream(null);
            fetchStreams();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi kết thúc livestream', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }
    };

    const handlePushProduct = async (streamId, productId) => {
        try {
            await api.patch(`/admin/livestreams/${streamId}/push-product?productId=${productId}`);
            Swal.fire({ icon: 'success', title: 'Pushed!', text: 'Đã đẩy sản phẩm lên màn hình!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            fetchStreams();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi đẩy sản phẩm', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchProduct.trim().length >= 2) {
                setIsSearchingProducts(true);
                try {
                    const response = await api.get(`/products?q=${searchProduct}`);
                    setProducts(response.data.result.content || []);
                } catch (error) {
                    console.error('Search error', error);
                } finally {
                    setIsSearchingProducts(false);
                }
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchProduct]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(streams.map(s => s.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const bulkActionBar = selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-2 shadow-lg animate-scale-up mr-4">
            <span className="text-[13px] font-bold">
                Đã chọn <span className="text-primary-500 font-black">{selectedIds.length}</span>
            </span>
            <div className="w-[1px] h-4 bg-gray-700"></div>
            <button 
                onClick={async () => {
                    const res = await Swal.fire({
                        title: 'Xóa hàng loạt?',
                        text: `Bạn có chắc muốn xóa ${selectedIds.length} phiên live đã chọn?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Đồng ý',
                        cancelButtonText: 'Hủy'
                    })
                    if (res.isConfirmed) {
                        try {
                            await Promise.all(selectedIds.map(id => api.delete(`/admin/livestreams/${id}`)))
                            Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã xóa các phiên live đã chọn', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                            setSelectedIds([])
                            fetchStreams()
                        } catch (err) { fireError(err, 'Lỗi khi xóa hàng loạt') }
                    }
                }}
                className="text-[13px] font-bold text-red-400 hover:text-red-300 transition-colors"
            >
                Xóa nhanh
            </button>
            <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
            </button>
        </div>
    )

    return (
        <div className="space-y-8 animate-fade-in">
            <AdminPageHeader 
                title="Quản lý" 
                accentTitle="Livestream"
                subtitle="Tổ chức các buổi Live Shopping và đẩy sản phẩm thời gian thực."
                rightContent={
                    <div className="flex items-center gap-3">
                        {bulkActionBar}
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="h-[46px] px-6 bg-primary-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="h-5 w-5" /> 
                            PHIÊN LIVE MỚI
                        </button>
                    </div>
                }
            />

            {/* Active Control Panel */}
            {activeStream && (
                <div className="card bg-secondary-900 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black animate-pulse uppercase tracking-[0.2em]">ĐANG LIVE</span>
                    </div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tight">{activeStream.title}</h3>
                            <div className="flex items-center gap-6 text-gray-400 text-sm font-bold mb-6">
                                <span className="flex items-center gap-1.5"><Users size={16} /> {activeStream.viewerCount || 0} đang xem</span>
                                <span className="flex items-center gap-1.5"><Calendar size={16} /> Bắt đầu lúc {new Date().toLocaleTimeString()}</span>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <p className="text-white text-xs font-black uppercase tracking-widest text-primary-400">Điều khiển sản phẩm</p>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Tìm sản phẩm để ĐẨY lên màn hình..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                                        value={searchProduct}
                                        onChange={(e) => setSearchProduct(e.target.value)}
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                </div>

                                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {isSearchingProducts ? (
                                        <div className="p-4 text-center text-gray-500 italic text-sm">Đang tìm sản phẩm...</div>
                                    ) : products.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <img src={product.images?.[0]?.imageUrl} className="w-10 h-10 rounded-md object-cover" />
                                                <span className="text-white text-sm font-bold truncate max-w-[200px]">{product.name}</span>
                                            </div>
                                            <button 
                                                onClick={() => handlePushProduct(activeStream.id, product.id)}
                                                className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white hover:text-primary-600 transition-all shadow-lg"
                                            >
                                                PUSH
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between">
                            <div className="bg-black/40 rounded-3xl aspect-video flex items-center justify-center border border-white/5">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Radio size={32} />
                                    </div>
                                    <p className="text-white font-black text-sm uppercase tracking-widest">Đang kết nối luồng phát...</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleEndStream(activeStream.id)}
                                className="mt-8 bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <StopCircle size={20} /> KẾT THÚC LIVESTREAM
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Table */}
            <div className="card p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-black text-secondary-800">DANH SÁCH PHIÊN LIVE</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100 uppercase">
                            <tr>
                                <th className="px-6 py-4 w-10 text-left">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                        checked={selectedIds.length > 0 && selectedIds.length === streams.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 tracking-widest text-center w-12">STT</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 tracking-widest">Phiên Live</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 tracking-widest">Người live</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 tracking-widest">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 tracking-widest">Người xem</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 tracking-widest">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {streams.map((stream, index) => (
                                <tr key={stream.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(stream.id) ? 'bg-primary-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                            checked={selectedIds.includes(stream.id)}
                                            onChange={() => handleSelectOne(stream.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-center text-[12px] font-bold text-gray-400">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                <img src={stream.thumbnailUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <p className="text-sm font-black text-gray-800 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{stream.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{stream.streamerUsername}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            stream.status === 'LIVE' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {stream.status || 'LIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-sm text-secondary-800">
                                        {stream.viewerCount || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => navigate(`/livestream/${stream.id}`)}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="Xem trang xem Live"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreating(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up">
                        <h2 className="text-2xl font-black text-secondary-900 mb-6 uppercase tracking-tight">KHỞI TẠO LIVESTREAM</h2>
                        <form onSubmit={handleCreateStream} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tiêu đề buổi Live</label>
                                <input 
                                    required 
                                    className="input py-4 text-sm" 
                                    placeholder="Ví dụ: Đập hộp iPhone 16 Pro Max..."
                                    value={newStream.title}
                                    onChange={e => setNewStream({...newStream, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Thumbnail (URL Ảnh)</label>
                                <input 
                                    required 
                                    className="input py-4 text-sm" 
                                    placeholder="https://..."
                                    value={newStream.thumbnailUrl}
                                    onChange={e => setNewStream({...newStream, thumbnailUrl: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Stream Key / URL</label>
                                <input 
                                    required 
                                    className="input py-4 text-sm" 
                                    placeholder="rtmp://..."
                                    value={newStream.streamUrl}
                                    onChange={e => setNewStream({...newStream, streamUrl: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">HỦY BỎ</button>
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20">BẮT ĐẦU LIVE</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLivestreams;
