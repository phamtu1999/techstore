import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Edit2, Ticket, Calendar, DollarSign, Users, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import api from '../../utils/axios'
import Swal from 'sweetalert2'
import AdminTable from '../../components/admin/AdminTable'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'

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
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Xác nhận xóa'
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

    const columns = useMemo(() => [
        {
            key: 'code',
            label: 'Mã',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                        <Ticket className="h-4 w-4" />
                    </div>
                    <span className="font-black text-secondary-900 uppercase tracking-widest">{val}</span>
                </div>
            )
        },
        {
            key: 'discountValue',
            label: 'Giảm giá',
            render: (val, row) => (
                <span className="font-bold text-emerald-600">
                    {row.discountType === 'PERCENT' ? `${val}%` : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                </span>
            )
        },
        {
            key: 'minPurchase',
            label: 'Đơn từ',
            render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
        },
        {
            key: 'usage',
            label: 'Sử dụng',
            render: (_, row) => (
                <span className="text-xs font-bold text-gray-500">
                    {row.usedCount} / {row.usageLimit === 0 ? '∞' : row.usageLimit}
                </span>
            )
        },
        {
            key: 'expirationDate',
            label: 'Hết hạn',
            render: (val) => (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(val).toLocaleDateString('vi-VN')}
                </div>
            )
        },
        {
            key: 'active',
            label: 'Trạng thái',
            render: (val) => (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${val ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {val ? 'Hoạt động' : 'Vô hiệu'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Hành động',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(row)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ], [handleOpenModal, handleDelete])

    return (
        <div className="space-y-5 sm:space-y-8 pb-12 sm:pb-16 animate-fade-in">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-xs font-bold uppercase tracking-[0.2em] mb-3">
                        Coupons
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-dark-text tracking-tight">
                        Quản lý <span className="text-primary-main">voucher</span>
                    </h1>
                    <p className="text-sm sm:text-base font-medium text-text-secondary dark:text-gray-400 mt-2 leading-relaxed">
                        Tạo và quản lý các chương trình khuyến mãi, mã giảm giá cho khách hàng.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="h-12 px-5 rounded-2xl bg-primary-main text-white font-bold text-sm shadow-lg shadow-primary-main/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Thêm mã mới
                </button>
            </div>

            <AdminTable columns={columns} data={coupons} isLoading={isLoading} />

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-scale-up">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-black text-secondary-900 uppercase tracking-widest">
                                {editingCoupon ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mã giảm giá</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="VÍ DỤ: TECH2024"
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 outline-none font-bold uppercase"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        disabled={!!editingCoupon}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Loại giảm giá</label>
                                    <select
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 outline-none font-bold appearance-none"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="FIXED_AMOUNT">Số tiền cố định</option>
                                        <option value="PERCENT">Phần trăm (%)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giá trị giảm</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 outline-none font-bold"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Đơn tối thiểu</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 outline-none font-bold"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giới hạn sử dụng</label>
                                    <input
                                        type="number"
                                        placeholder="0 = Không giới hạn"
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 outline-none font-bold"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày hết hạn</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 outline-none font-bold"
                                        value={formData.expirationDate}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-2xl border-2 border-gray-50 flex-1">
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        />
                                        <div className={`w-10 h-6 rounded-full relative transition-all ${formData.active ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hoạt động</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-2xl bg-secondary-900 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-600 shadow-xl shadow-secondary-900/10"
                                >
                                    {editingCoupon ? 'Cập nhật' : 'Tạo mã mới'}
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
