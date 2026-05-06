import { Plus, X, Ticket } from 'lucide-react'
import Swal from 'sweetalert2'
import AdminPageHeader from '../../../components/admin/shared/AdminPageHeader'
import { useCoupons } from '../../../hooks/admin/useCoupons'
import CouponsTable from './CouponsTable'

const AdminCoupons = () => {
    const {
        coupons, isLoading, isModalOpen, editingCoupon, selectedIds, formData,
        setFormData, setIsModalOpen, handleOpenModal, handleSubmit, handleDelete,
        toggleSelectAll, toggleSelectOne, handleBulkDelete
    } = useCoupons()

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
                        text: `Bạn có chắc muốn xóa ${selectedIds.length} mã giảm giá đã chọn?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Đồng ý',
                        cancelButtonText: 'Hủy'
                    })
                    if (res.isConfirmed) {
                        handleBulkDelete()
                    }
                }}
                className="text-[13px] font-bold text-red-400 hover:text-red-300 transition-colors"
            >
                Xóa nhanh
            </button>
            <button onClick={() => toggleSelectAll(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
            </button>
        </div>
    )

    return (
        <div className="space-y-6 animate-fade-in">
            <AdminPageHeader 
                title="Quản lý" 
                accentTitle="Mã giảm giá"
                subtitle="Tạo và quản lý các chương trình khuyến mãi, voucher cho khách hàng."
                rightContent={
                    <div className="flex items-center gap-3">
                        {bulkActionBar}
                        <button 
                            onClick={() => handleOpenModal()}
                            className="h-[46px] px-6 bg-primary-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="h-5 w-5" /> 
                            TẠO MÃ MỚI
                        </button>
                    </div>
                }
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <CouponsTable 
                    coupons={coupons}
                    isLoading={isLoading}
                    selectedIds={selectedIds}
                    onSelectOne={toggleSelectOne}
                    onSelectAll={toggleSelectAll}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
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
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Ticket className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="VÍ DỤ: TECH2024"
                                            className="w-full pl-12 pr-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none font-black uppercase text-[15px] tracking-widest"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            disabled={!!editingCoupon}
                                        />
                                    </div>
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


