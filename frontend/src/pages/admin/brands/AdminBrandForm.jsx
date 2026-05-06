import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, RefreshCw, X } from 'lucide-react'
import Swal from 'sweetalert2'

import { brandsAPI } from '../../../api/brands'
import { filesAPI } from '../../../api/files'
import { getApiErrorMessage } from '../../../utils/apiError'

const EMPTY_FORM = {
  name: '',
  slug: '',
  logoUrl: '',
  description: '',
  active: true
}

const AdminBrandForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formState, setFormState] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch brand if editing
  useEffect(() => {
    const fetchBrand = async () => {
      if (!isEditing) return
      try {
        Swal.fire({ title: 'Đang tải...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const { data } = await brandsAPI.getById(id)
        const b = data?.result
        if (!b) throw new Error('Brand not found')
        
        setFormState({
          name: b.name,
          slug: b.slug,
          logoUrl: b.logoUrl || '',
          description: b.description || '',
          active: b.active
        })
        Swal.close()
      } catch (err) {
        Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể tải chi tiết thương hiệu'), 'error')
        navigate('/admin/brands')
      }
    }
    fetchBrand()
  }, [id, isEditing, navigate])

  const generateSlug = (name) => {
    if (!name) return ''
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleFieldChange = (field, value) => {
    setFormState(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && (!isEditing || !prev.slug || prev.slug === generateSlug(prev.name))) {
        next.slug = generateSlug(value)
      }
      return next
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resp = await filesAPI.upload(file, 'brands')
      setFormState(prev => ({ ...prev, logoUrl: resp.data?.result }))
    } catch (err) { 
      Swal.fire('Lỗi', getApiErrorMessage(err, 'Tải ảnh thất bại'), 'error') 
    } finally { 
      setUploading(false)
      e.target.value = '' 
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      Swal.fire({ title: 'Đang lưu...', didOpen: () => Swal.showLoading() })
      if (isEditing) await brandsAPI.update(id, formState)
      else await brandsAPI.create(formState)
      Swal.fire('Thành công', 'Thương hiệu đã được lưu', 'success')
      navigate('/admin/brands')
    } catch (err) { 
      Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể lưu thương hiệu'), 'error') 
    }
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isEditing ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {isEditing ? 'Sửa thông tin thương hiệu và lưu lại.' : 'Điền thông tin chi tiết cho thương hiệu mới.'}
          </p>
        </div>
      </div>

      <form className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info Side */}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Tên thương hiệu <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formState.name} 
                onChange={(e) => handleFieldChange('name', e.target.value)} 
                className="input h-12 text-base" 
                placeholder="VD: Apple, Samsung, Sony..." 
                required 
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Slug (URL) <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formState.slug} 
                  onChange={(e) => handleFieldChange('slug', e.target.value)} 
                  className="input flex-1 h-12" 
                  placeholder="apple" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => handleFieldChange('slug', generateSlug(formState.name))} 
                  className="rounded-xl border border-gray-300 px-4 hover:bg-gray-50"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Mô tả</label>
              <textarea 
                value={formState.description} 
                onChange={(e) => handleFieldChange('description', e.target.value)} 
                className="input min-h-[120px] py-3 resize-none" 
                placeholder="Nhập mô tả về thương hiệu..." 
              />
            </div>

            <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formState.active} 
                onChange={(e) => handleFieldChange('active', e.target.checked)} 
                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
              />
              Hiển thị thương hiệu
            </label>
          </div>

          {/* Logo Side */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Logo thương hiệu</label>
            <div className="aspect-square w-full max-w-[250px] mx-auto relative group rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50/50 transition-all overflow-hidden flex flex-col items-center justify-center bg-gray-50">
              {formState.logoUrl ? (
                <>
                  <img src={formState.logoUrl} alt="Brand Logo" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => handleFieldChange('logoUrl', '')}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                  <span className="text-xs font-bold text-primary-600 uppercase">Đang tải...</span>
                </div>
              ) : (
                <>
                  <ImagePlus className="h-10 w-10 text-gray-300 group-hover:text-primary-500" />
                  <span className="text-sm font-bold text-gray-500 mt-2">Tải logo lên</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">Hoặc dán URL logo</label>
              <input 
                type="text" 
                value={formState.logoUrl} 
                onChange={(e) => handleFieldChange('logoUrl', e.target.value)} 
                className="input h-10 text-sm" 
                placeholder="https://example.com/logo.png" 
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 flex justify-end gap-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => navigate('/admin/brands')} 
            className="px-8 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            className="px-10 py-3 rounded-xl font-black bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-600/30"
          >
            {isEditing ? 'Lưu cập nhật' : 'Tạo thương hiệu'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminBrandForm


