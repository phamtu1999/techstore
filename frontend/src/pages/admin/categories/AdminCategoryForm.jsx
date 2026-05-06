import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, RefreshCw, X } from 'lucide-react'
import Swal from 'sweetalert2'

import { categoriesAPI } from '../../../api/categories'
import { filesAPI } from '../../../api/files'
import { getApiErrorMessage } from '../../../utils/apiError'

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  parentId: '',
  icon: '',
  imageUrl: '',
  sortOrder: 0,
  active: true
}

const AdminCategoryForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formState, setFormState] = useState(EMPTY_FORM)
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Fetch categories for parent selection
  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data?.result || []))
  }, [])

  const categoryOptions = useMemo(() => {
    return categories
      .filter(cat => cat.id !== id) // Prevent self-referencing
      .map((cat) => ({ value: String(cat.id), label: cat.name }))
  }, [categories, id])

  // Fetch category if editing
  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditing) return
      try {
        Swal.fire({ title: 'Đang tải...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const { data } = await categoriesAPI.getById(id)
        const c = data?.result
        if (!c) throw new Error('Category not found')
        
        setFormState({
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          parentId: c.parentId || '',
          icon: c.icon || '',
          imageUrl: c.imageUrl || '',
          sortOrder: c.sortOrder || 0,
          active: c.active
        })
        Swal.close()
      } catch (err) {
        Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể tải chi tiết danh mục'), 'error')
        navigate('/admin/categories')
      }
    }
    fetchCategory()
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
      const resp = await filesAPI.upload(file, 'categories')
      setFormState(prev => ({ ...prev, imageUrl: resp.data?.result }))
    } catch (err) { 
      Swal.fire('Lỗi', getApiErrorMessage(err, 'Tải ảnh thất bại'), 'error') 
    } finally { 
      setUploading(false)
      e.target.value = '' 
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...formState,
      parentId: formState.parentId === '' ? null : formState.parentId
    }
    try {
      Swal.fire({ title: 'Đang lưu...', didOpen: () => Swal.showLoading() })
      if (isEditing) await categoriesAPI.update(id, payload)
      else await categoriesAPI.create(payload)
      Swal.fire('Thành công', 'Danh mục đã được lưu', 'success')
      navigate('/admin/categories')
    } catch (err) { 
      Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể lưu danh mục'), 'error') 
    }
  }

  const filteredCategories = categoryOptions.filter(cat => cat.label.toLowerCase().includes(categorySearch.toLowerCase()))
  const selectedParent = categoryOptions.find(cat => cat.value === formState.parentId)

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {isEditing ? 'Sửa thông tin danh mục và lưu lại.' : 'Điền thông tin chi tiết cho danh mục mới.'}
          </p>
        </div>
      </div>

      <form className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side */}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Tên danh mục <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formState.name} 
                onChange={(e) => handleFieldChange('name', e.target.value)} 
                className="input h-12 text-base" 
                placeholder="VD: Điện thoại, Laptop..." 
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
                  placeholder="dien-thoai" 
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

            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Danh mục cha</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={selectedParent?.label || categorySearch} 
                  onChange={(e) => { setCategorySearch(e.target.value); setShowCategoryDropdown(true) }} 
                  onFocus={() => setShowCategoryDropdown(true)} 
                  className="input h-12" 
                  placeholder="Chọn danh mục cha (không bắt buộc)" 
                />
                {formState.parentId && (
                   <button 
                    type="button" 
                    onClick={() => { handleFieldChange('parentId', ''); setCategorySearch('') }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                   >
                    <X className="h-4 w-4 text-gray-400" />
                   </button>
                )}
              </div>
              {showCategoryDropdown && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                  <button 
                    type="button" 
                    onClick={() => { handleFieldChange('parentId', ''); setCategorySearch(''); setShowCategoryDropdown(false) }} 
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 text-gray-500 italic"
                  >
                    -- Không có danh mục cha --
                  </button>
                  {filteredCategories.length > 0 ? filteredCategories.map((opt) => (
                    <button 
                      key={opt.value} 
                      type="button" 
                      onClick={() => { handleFieldChange('parentId', opt.value); setCategorySearch(''); setShowCategoryDropdown(false) }} 
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 font-medium"
                    >
                      {opt.label}
                    </button>
                  )) : (
                    categorySearch && <div className="px-4 py-3 text-sm text-gray-500">Không tìm thấy danh mục</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Thứ tự sắp xếp</label>
                <input 
                  type="number" 
                  value={formState.sortOrder} 
                  onChange={(e) => handleFieldChange('sortOrder', parseInt(e.target.value))} 
                  className="input h-12" 
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Icon (Class)</label>
                <input 
                  type="text" 
                  value={formState.icon} 
                  onChange={(e) => handleFieldChange('icon', e.target.value)} 
                  className="input h-12" 
                  placeholder="VD: smartphone"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formState.active} 
                onChange={(e) => handleFieldChange('active', e.target.checked)} 
                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
              />
              Hiển thị danh mục
            </label>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Mô tả</label>
              <textarea 
                value={formState.description} 
                onChange={(e) => handleFieldChange('description', e.target.value)} 
                className="input min-h-[120px] py-3 resize-none" 
                placeholder="Nhập mô tả về danh mục..." 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh danh mục</label>
              <div className="aspect-video w-full relative group rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50/50 transition-all overflow-hidden flex flex-col items-center justify-center bg-gray-50">
                {formState.imageUrl ? (
                  <>
                    <img src={formState.imageUrl} alt="Category" className="w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={() => handleFieldChange('imageUrl', '')}
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
                    <span className="text-sm font-bold text-gray-500 mt-2">Tải ảnh lên</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </>
                )}
              </div>
              <input 
                type="text" 
                value={formState.imageUrl} 
                onChange={(e) => handleFieldChange('imageUrl', e.target.value)} 
                className="input h-10 text-sm mt-3" 
                placeholder="Hoặc dán URL ảnh tại đây..." 
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 flex justify-end gap-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => navigate('/admin/categories')} 
            className="px-8 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            className="px-10 py-3 rounded-xl font-black bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-600/30"
          >
            {isEditing ? 'Lưu cập nhật' : 'Tạo danh mục'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminCategoryForm


