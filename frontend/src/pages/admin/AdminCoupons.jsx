import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Edit2, Ticket, Calendar, X } from 'lucide-react'
import api from '../../utils/axios'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader'
import AdminPill from '../../components/admin/shared/AdminPill'

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'FIXED_AMOUNT',
        discountValue: '',
        minPurchase: '0',
        maxDiscount: '',
        usageLimit: '0',
        expirationDate: '',
        active: true
    })

    const fetchCoupons = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/admin/coupons')
            setCoupons(response.data.result.content || response.data.result || [])
        } catch (error) {
            console.error(getApiErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCoupons()
    }, [])

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon)
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue.toString(),
                minPurchase: coupon.minPurchase.toString(),
                maxDiscount: coupon.maxDiscount?.toString() || '',
                usageLimit: coupon.usageLimit.toString(),
                expirationDate: coupon.expirationDate ? coupon.expirationDate.split('T')[0] : '',
                active: coupon.active
            })
        } else {
            setEditingCoupon(null)
            setFormData({
                code: '',
                discountType: 'FIXED_AMOUNT',
                discountValue: '',
                minPurchase: '0',
                maxDiscount: '',
                usageLimit: '0',
                expirationDate: '',
                active: true
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minPurchase: parseFloat(formData.minPurchase),
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
                usageLimit: parseInt(formData.usageLimit),
                expirationDate: new Date(formData.expirationDate).toISOString()
            }

            if (editingCoupon) {
                await api.put(`/admin/coupons/${editingCoupon.id}`, payload)
                fireSuccess('Thành công', 'Cập nhật mã giảm giá thành công')
            } else {
                await api.post('/admin/coupons', payload)
                fireSuccess('Thành công', 'Tạo mã giảm giá mới thành công')
            }
            setIsModalOpen(false)
            fetchCoupons()
        } catch (error) {
            fireError(error, 'Có lỗi xảy ra')
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xóa mã giảm giá?',
            text: 'Mã này sẽ bị vô hiệu hóa và không thể sử dụng!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận xóa',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-red-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
                cancelButton: 'bg-gray-100 text-gray-600 font-bold px-6 py-2 rounded-lg'
            },
            buttonsStyling: false
        })

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/coupons/${id}`)
                fireSuccess('Đã xóa', 'Mã giảm giá đã được vô hiệu hóa')
                fetchCoupons()
            } catch (error) {
                fireError(error, 'Không thể xóa mã giảm giá')
            }
        }
    }

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

    return (
        <div className="space-y-6 animate-fade-in">
            <AdminPageHeader 
                title="Quản lý" 
                accentTitle="Mã giảm giá"
                subtitle="Tạo và quản lý các chương trình khuyến mãi, voucher cho khách hàng."
                rightElement={
                    <button 
                        onClick={() => handleOpenModal()}
                        className="h-[46px] px-6 bg-primary-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5" /> 
                        TẠO MÃ MỚI
                    </button>
                }
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Mã Coupon</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Giảm giá</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Đơn tối thiểu</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Lượt dùng</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Hết hạn</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Trạng thái</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                                        Chưa có mã giảm giá nào được tạo
                                    </td>
                                </tr>
                            ) : coupons.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary-50 text-primary-600 rounded-xl group-hover:scale-110 transition-transform">
                                                <Ticket className="h-5 w-5" />
                                            </div>
                                            <span className="font-black text-gray-900 uppercase tracking-widest text-[14px]">{row.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-black text-emerald-600 text-[15px]">
                                            {row.discountType === 'PERCENT' ? `${row.discountValue}%` : formatCurrency(row.discountValue)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-bold text-gray-600">{formatCurrency(row.minPurchase)}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[14px] font-black text-gray-900">{row.usedCount} / {row.usageLimit === 0 ? '∞' : row.usageLimit}</span>
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Lượt dùng</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(row.expirationDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <AdminPill 
                                            label={row.active ? 'Hoạt động' : 'Vô hiệu'} 
                                            type={row.active ? 'success' : 'danger'} 
                                        />
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleOpenModal(row)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(row.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up border border-gray-100">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-widest">
                                {editingCoupon ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã giảm giá</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="VÍ DỤ: TECH2024"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none font-black uppercase text-[15px] tracking-widest"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        disabled={!!editingCoupon}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Loại giảm giá</label>
                                    <select
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none font-bold text-[14px] appearance-none"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                        <option value="PERCENT">Phần trăm (%)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá trị giảm</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none font-bold text-[14px]"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Đơn tối thiểu</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none font-bold text-[14px]"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Giới hạn sử dụng</label>
                                    <input
                                        type="number"
                                        placeholder="0 = Không giới hạn"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none font-bold text-[14px]"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Ngày hết hạn</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none font-bold text-[14px]"
                                        value={formData.expirationDate}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-gray-50 flex-1 border border-transparent hover:border-emerald-200 transition-all">
                                        <input
                                            type="checkbox"
                                            className="hidden peer"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        />
                                        <div className={`w-11 h-6 rounded-full relative transition-all ${formData.active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-6' : 'left-1'}`}></div>
                                        </div>
                                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Hoạt động</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-600 font-bold text-[14px] uppercase transition-all hover:bg-gray-200"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-xl bg-primary-600 text-white font-bold text-[14px] uppercase shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700"
                                >
                                    {editingCoupon ? 'Lưu thay đổi' : 'Tạo mã ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCoupons
