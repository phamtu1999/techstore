import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Link as LinkIcon, Plus, RefreshCw, Star, Zap, X } from 'lucide-react'
import Swal from 'sweetalert2'

import { productsAPI } from '../../../api/products'
import { categoriesAPI } from '../../../api/categories'
import { brandsAPI } from '../../../api/brands'
import { filesAPI } from '../../../api/files'
import { getApiErrorMessage } from '../../../utils/apiError'

const EMPTY_SPEC = { key: '', value: '' }
const EMPTY_FORM = {
  name: '', slug: '', brandId: '', categoryId: '', description: '',
  price: '', originalPrice: '', stockQuantity: '', modelName: '', active: true, featured: false, flashSale: false
}

const sanitizeImageUrls = (urls = []) => urls.map((url) => (url || '').trim()).filter(Boolean)

const normalizeSpecs = (attributes = []) => {
  if (!Array.isArray(attributes) || attributes.length === 0) return [{ ...EMPTY_SPEC }]
  return attributes.map((attr) => ({ key: attr?.name || '', value: attr?.value || '' }))
}

const AdminProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formState, setFormState] = useState(EMPTY_FORM)
  const [editingProduct, setEditingProduct] = useState(null)
  const [imageUrls, setImageUrls] = useState([])
  const [specs, setSpecs] = useState([{ ...EMPTY_SPEC }])
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [brands, setBrands] = useState([])
  
  const [categorySearch, setCategorySearch] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [errors, setErrors] = useState({})

  const [activeTab, setActiveTab] = useState('manual')
  const [jsonInput, setJsonInput] = useState('')

  // Fetch categories & brands
  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data?.result || []))
    brandsAPI.getAll().then(res => setBrands(res.data?.result || []))
  }, [])

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({ value: String(cat.id), label: cat.name }))
  }, [categories])

  // Fetch product if editing
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEditing) return
      try {
        Swal.fire({ title: 'Đang tải...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const { data } = await productsAPI.getAdminById(id)
        const p = data?.result
        if (!p) throw new Error('Product not found')
        
        const v = p.variants?.[0] || {}
        setEditingProduct(p)
        setFormState({
          name: p.name, slug: p.slug, brandId: p.brand?.id || '', categoryId: String(p.category?.id || ''),
          description: p.description, price: v.price || '', originalPrice: v.originalPrice || '', 
          stockQuantity: v.stockQuantity || 0, modelName: v.name || '', active: p.active,
          sku: v.sku || ''
        })
        setImageUrls(sanitizeImageUrls(p.imageUrls || p.images?.map(img => img.url)))
        setSpecs(normalizeSpecs(p.attributes))
        Swal.close()
      } catch (err) {
        Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể tải chi tiết sản phẩm'), 'error')
        navigate('/admin/products')
      }
    }
    fetchProduct()
  }, [id, isEditing, navigate])

  const handleJsonParse = () => {
    try {
      const data = JSON.parse(jsonInput)
      
      // Basic validation and mapping
      setFormState(prev => ({
        ...prev,
        name: data.name || prev.name,
        slug: data.slug || generateSlug(data.name || '') || prev.slug,
        brandId: data.brandId || prev.brandId,
        categoryId: String(data.categoryId || prev.categoryId),
        description: data.description || prev.description,
        price: data.price ?? prev.price,
        originalPrice: data.originalPrice ?? prev.originalPrice,
        stockQuantity: data.stockQuantity ?? prev.stockQuantity,
        modelName: data.modelName ?? prev.modelName,
        sku: data.sku || prev.sku,
        active: data.active ?? prev.active,
        featured: data.featured ?? prev.featured
      }))

      if (data.imageUrls && Array.isArray(data.imageUrls)) {
        setImageUrls(sanitizeImageUrls(data.imageUrls))
      }

      if (data.attributes && Array.isArray(data.attributes)) {
        setSpecs(normalizeSpecs(data.attributes))
      } else if (data.specs && Array.isArray(data.specs)) {
        // Handle alternative key name
        setSpecs(data.specs.map(s => ({ key: s.key || s.name || '', value: s.value || '' })))
      }

      fireSuccess('Phân tích JSON thành công', 'Dữ liệu đã được điền vào form')
      setActiveTab('manual')
    } catch (err) {
      fireError('Lỗi định dạng JSON', 'Vui lòng kiểm tra lại cấu trúc chuỗi JSON của bạn')
    }
  }

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

  const generateSKU = () => {
    const brand = brands.find(b => b.id === formState.brandId)
    const prefix = brand ? brand.name.substring(0, 3).toUpperCase() : 'PRD'
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${random}`
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

  const handleNameChange = (value) => handleFieldChange('name', value)

  const formatPrice = (value) => {
    if (!value) return ''
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  const validateField = (field, value) => {
    const newErrors = { ...errors }
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 3) newErrors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự'
        else delete newErrors.name
        break
      case 'price':
        if (!value || value <= 0) newErrors.price = 'Giá phải lớn hơn 0'
        else delete newErrors.price
        break
      case 'stockQuantity':
        if (value < 0) newErrors.stockQuantity = 'Số lượng không được âm'
        else delete newErrors.stockQuantity
        break
    }
    setErrors(newErrors)
  }

  const filteredCategories = categoryOptions.filter(cat => cat.label.toLowerCase().includes(categorySearch.toLowerCase()))
  const selectedCategory = categoryOptions.find(cat => cat.value === formState.categoryId)

  const addSpec = () => setSpecs((prev) => [...prev, { ...EMPTY_SPEC }])
  const removeSpec = (index) => setSpecs((prev) => { const next = prev.filter((_, i) => i !== index); return next.length > 0 ? next : [{ ...EMPTY_SPEC }] })
  const updateSpec = (index, field, value) => setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))

  const addImageField = () => setImageUrls((prev) => [...prev, ''])
  const updateImageUrl = (index, value) => setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  const removeImage = (index) => setImageUrls((prev) => prev.filter((_, i) => i !== index))

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const resp = await Promise.all(files.map(f => filesAPI.upload(f, 'products')))
      setImageUrls(prev => [...prev, ...resp.map(r => r.data?.result).filter(Boolean)])
    } catch (err) { Swal.fire('Lỗi', getApiErrorMessage(err, 'Tải ảnh thất bại'), 'error') }
    finally { setUploading(false); e.target.value = '' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...formState,
      categoryId: formState.categoryId,
      imageUrls: sanitizeImageUrls(imageUrls),
      variants: [{
        id: editingProduct?.variants?.[0]?.id,
        sku: formState.sku || editingProduct?.variants?.[0]?.sku || `${formState.slug}-sku`,
        name: formState.modelName || formState.name,
        price: Number(formState.price),
        originalPrice: formState.originalPrice ? Number(formState.originalPrice) : null,
        stockQuantity: Number(formState.stockQuantity)
      }],
      attributes: specs.filter(s => s.key && s.value).map(s => ({ name: s.key, value: s.value }))
    }
    try {
      Swal.fire({ title: 'Đang lưu...', didOpen: () => Swal.showLoading() })
      if (isEditing) await productsAPI.updateProduct(editingProduct.id, payload)
      else await productsAPI.createProduct(payload)
      Swal.fire('Thành công', 'Sản phẩm đã được lưu', 'success')
      navigate(-1)
    } catch (err) { Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể lưu sản phẩm'), 'error') }
  }

  const fireSuccess = (title, text) => {
    Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    })
  }

  const fireError = (title, text) => {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#d33'
    })
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {isEditing ? 'Sửa thông tin sản phẩm và lưu lại.' : 'Điền thông tin chi tiết cho sản phẩm mới.'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        {!isEditing && (
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit self-start md:self-center">
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'manual' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Nhập thủ công
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'json' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Dán JSON
            </button>
          </div>
        )}
      </div>

      {activeTab === 'json' ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Nhập dữ liệu JSON</h3>
              <p className="text-sm text-gray-500">Dán chuỗi JSON của bạn vào đây để tự động điền các trường.</p>
            </div>
            <button 
              type="button"
              onClick={() => setJsonInput(JSON.stringify({
                name: "Tên sản phẩm",
                brandId: brands[0]?.id || "",
                categoryId: categories[0]?.id || "",
                price: 1000000,
                stockQuantity: 10,
                modelName: "Phiên bản màu sắc",
                description: "Mô tả sản phẩm",
                imageUrls: ["https://example.com/image.jpg"],
                attributes: [{ key: "RAM", value: "8GB" }]
              }, null, 2))}
              className="text-primary-600 text-xs font-bold hover:underline"
            >
              Dùng mẫu
            </button>
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full min-h-[400px] p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-600/30 focus:bg-white transition-all outline-none font-mono text-sm leading-relaxed"
            placeholder='{ "name": "iPhone 15", ... }'
          />
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setActiveTab('manual')} className="px-8 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Hủy</button>
            <button 
              type="button" 
              onClick={handleJsonParse}
              className="px-10 py-3 rounded-xl font-black bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-600/30 transition-all"
            >
              Phân tích & Điền dữ liệu
            </button>
          </div>
        </div>
      ) : (
        <form className="flex flex-col lg:flex-row gap-8" onSubmit={handleSubmit}>
          {/* Left Form Content */}
          <div className="flex-1 space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary-600 pl-3">Thông tin cơ bản</h3>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input type="text" value={formState.name} onChange={(e) => handleNameChange(e.target.value)} onBlur={(e) => validateField('name', e.target.value)} className={`input h-12 text-base ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="VD: iPhone 15 Pro Max 256GB" required />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Slug (URL) <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input type="text" value={formState.slug} onChange={(e) => handleFieldChange('slug', e.target.value)} className="input flex-1 h-12" placeholder="iphone-15-pro-max" required />
                    <button type="button" onClick={() => handleFieldChange('slug', generateSlug(formState.name))} className="rounded-xl border border-gray-300 px-4 hover:bg-gray-50"><RefreshCw className="h-5 w-5 text-gray-600" /></button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Thương hiệu <span className="text-red-500">*</span></label>
                  <select 
                    value={formState.brandId} 
                    onChange={(e) => handleFieldChange('brandId', e.target.value)} 
                    className="input h-12" 
                    required
                  >
                    <option value="">— Chọn thương hiệu —</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                  <input type="text" value={selectedCategory?.label || categorySearch} onChange={(e) => { setCategorySearch(e.target.value); setShowCategoryDropdown(true) }} onFocus={() => setShowCategoryDropdown(true)} className="input h-12" placeholder="Tìm kiếm danh mục..." required />
                  {showCategoryDropdown && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                      {filteredCategories.length > 0 ? filteredCategories.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => { handleFieldChange('categoryId', opt.value); setCategorySearch(''); setShowCategoryDropdown(false) }} className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50">{opt.label}</button>
                      )) : <div className="px-4 py-3 text-sm text-gray-500">Không tìm thấy danh mục</div>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Phiên bản</label>
                  <input type="text" value={formState.modelName} onChange={(e) => handleFieldChange('modelName', e.target.value)} className="input h-12" placeholder="VD: 256GB Titan Tự Nhiên" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Mô tả ngắn gọn</label>
                <textarea value={formState.description} onChange={(e) => handleFieldChange('description', e.target.value)} className="input min-h-[120px] py-3 resize-none" placeholder="Nhập mô tả sản phẩm..." />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 border-l-4 border-green-600 pl-3">Giá & Kho hàng</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Giá bán <span className="text-red-500">*</span></label>
                  <input type="number" min="0" step="1000" value={formState.price} onChange={(e) => { handleFieldChange('price', e.target.value); validateField('price', e.target.value) }} className={`input h-12 ${errors.price ? 'border-red-500' : ''}`} required />
                  {formState.price > 0 && <p className="mt-1 text-xs font-semibold text-primary-600">{formatPrice(formState.price)} đ</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Giá gốc (Gạch ngang)</label>
                  <input type="number" min="0" step="1000" value={formState.originalPrice} onChange={(e) => handleFieldChange('originalPrice', e.target.value)} className="input h-12" />
                  {formState.originalPrice > 0 && <p className="mt-1 text-xs font-medium text-gray-400 line-through">{formatPrice(formState.originalPrice)} đ</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Số lượng <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={formState.stockQuantity} onChange={(e) => { handleFieldChange('stockQuantity', e.target.value); validateField('stockQuantity', e.target.value) }} className="input h-12" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Mã SKU</label>
                  <div className="flex gap-2">
                    <input type="text" value={formState.sku || ''} onChange={(e) => handleFieldChange('sku', e.target.value)} className="input flex-1 h-12" placeholder="Tự động" />
                    <button type="button" onClick={() => handleFieldChange('sku', generateSKU())} className="rounded-xl border border-gray-300 px-3 hover:bg-gray-50"><RefreshCw className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={formState.active} onChange={(e) => handleFieldChange('active', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  Hiển thị sản phẩm
                </label>
                <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={formState.featured || false} onChange={(e) => handleFieldChange('featured', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-yellow-600" />
                  Sản phẩm nổi bật
                </label>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Thông số kỹ thuật</h3>
                <button type="button" onClick={addSpec} className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 font-bold text-blue-600 hover:bg-blue-100"><Plus className="h-4 w-4" /> Thêm thông số</button>
              </div>
              <div className="space-y-3">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <input type="text" value={spec.key} onChange={(e) => updateSpec(index, 'key', e.target.value)} placeholder="Tên (VD: Màn hình)" className="input h-11 w-1/3" />
                    <input type="text" value={spec.value} onChange={(e) => updateSpec(index, 'value', e.target.value)} placeholder="Giá trị (VD: 6.7 inch)" className="input h-11 flex-1" />
                    <button type="button" onClick={() => removeSpec(index)} className="rounded-xl p-3 text-red-500 hover:bg-red-50"><X className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-purple-600 pl-3">Hình ảnh sản phẩm</h3>
                <button type="button" onClick={addImageField} className="flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2 font-bold text-purple-600 hover:bg-purple-100"><Plus className="h-4 w-4" /> Thêm URL</button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Upload Active Area */}
                <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50/50 transition-all cursor-pointer flex flex-col items-center justify-center p-4">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                      <span className="text-[10px] font-bold text-primary-600 uppercase">Đang tải...</span>
                    </div>
                  ) : (
                    <>
                      <div className="bg-primary-50 p-3 rounded-full group-hover:bg-primary-100 transition-colors">
                        <ImagePlus className="h-6 w-6 text-primary-600" />
                      </div>
                      <span className="font-bold text-gray-700 text-sm mt-3">Thêm ảnh</span>
                      <span className="text-[10px] text-gray-400 font-medium">Hoặc thả file vào</span>
                    </>
                  )}
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                {/* Image Previews */}
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <img src={url} alt={`Product ${index}`} className="w-full h-full object-contain" />
                    
                    {/* Badge for Thumbnail */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                        Ảnh chính
                      </div>
                    )}

                    {/* Delete Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Xóa ảnh"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Index Label */}
                    <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 flex justify-end gap-4 mt-8 border-t border-gray-100">
              <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Hủy bỏ</button>
              <button type="submit" className="px-10 py-3 rounded-xl font-black bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-600/30">
                {isEditing ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
              </button>
            </div>
          </div>

          {/* Right Sidebar Preview */}
          <div className="w-full lg:w-[350px]">
            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-6 border-b pb-4">Xem trước sản phẩm</h3>
              <div className="aspect-square rounded-xl bg-gray-100 mb-6 overflow-hidden flex items-center justify-center">
                {imageUrls[0] ? <img src={imageUrls[0]} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" /> : <ImagePlus className="w-16 h-16 text-gray-300" />}
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-lg text-gray-900 line-clamp-2">{formState.name || 'Tên sản phẩm'}</h4>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{formState.description || 'Mô tả ngắn gọn về sản phẩm này...'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-2xl font-black text-primary-600 font-outfit">{formState.price ? formatPrice(formState.price) : '0'} đ</div>
                  {formState.originalPrice > formState.price && (
                    <div className="text-sm text-gray-400 line-through font-medium">{formatPrice(formState.originalPrice)} đ</div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                  <span>Kho: {formState.stockQuantity || 0}</span>
                  <span>{brands.find(b => b.id === formState.brandId)?.name || 'Thương hiệu'}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default AdminProductForm


