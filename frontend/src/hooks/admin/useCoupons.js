import { useState, useCallback, useEffect } from 'react'
import api from '../../utils/axios'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'

export const useCoupons = () => {
    const [coupons, setCoupons] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)
    const [selectedIds, setSelectedIds] = useState([])
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
    }, [fetchCoupons])

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon)
            setFormData({
                code: coupon.code || '',
                discountType: coupon.discountType || 'FIXED_AMOUNT',
                discountValue: (coupon.discountValue ?? '').toString(),
                minPurchase: (coupon.minPurchase ?? '0').toString(),
                maxDiscount: coupon.maxDiscount?.toString() || '',
                usageLimit: (coupon.usageLimit ?? '0').toString(),
                expirationDate: coupon.expirationDate ? coupon.expirationDate.split('T')[0] : '',
                active: coupon.active ?? true
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
            // Fix: Ensure expirationDate is in the future by setting time to 23:59:59
            // Also ensure numeric fields are correctly parsed
            const payload = {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minPurchase: parseFloat(formData.minPurchase || 0),
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
                usageLimit: parseInt(formData.usageLimit || 0),
                expirationDate: `${formData.expirationDate}T23:59:59`
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
            console.error('Coupon submit error:', error)
            fireError(error, 'Có lỗi xảy ra khi lưu mã giảm giá')
        }
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/coupons/${id}`)
            fireSuccess('Đã xóa', 'Mã giảm giá đã được vô hiệu hóa')
            fetchCoupons()
        } catch (error) {
            fireError(error, 'Không thể xóa mã giảm giá')
        }
    }

    const toggleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(coupons.map(c => c.id))
        } else {
            setSelectedIds([])
        }
    }

    const toggleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/admin/coupons/${id}`)))
            fireSuccess('Thành công', 'Đã xóa các mã giảm giá đã chọn')
            setSelectedIds([])
            fetchCoupons()
        } catch (err) {
            fireError(err, 'Lỗi khi xóa hàng loạt')
        }
    }

    return {
        coupons, isLoading, isModalOpen, editingCoupon, selectedIds, formData,
        setFormData, setIsModalOpen, handleOpenModal, handleSubmit, handleDelete,
        toggleSelectAll, toggleSelectOne, handleBulkDelete, fetchCoupons
    }
}
