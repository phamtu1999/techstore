import { useEffect, useState } from 'react'
import { categoriesAPI } from '../../api/categories'
import { filesAPI } from '../../api/files'
import { Plus, Search, Upload, X, ImageIcon, Link, ImagePlus, Edit2, Trash2, ChevronRight, Filter } from 'lucide-react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    slug: '',
    parentId: null,
    active: true,
    sortOrder: 0
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data.result || [])
    } catch (error) {
      console.error(getApiErrorMessage(error))
    }
    setIsLoading(false)
  }

  const handleAddNew = () => {
    setEditingCategory(null)
    setFormData({ 
      name: '', 
      description: '', 
      imageUrl: '', 
      slug: '', 
      parentId: null,
      active: true,
      sortOrder: 0
    })
    setShowModal(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      slug: category.slug || '',
      parentId: category.parentId || null,
      active: category.active ?? true,
      sortOrder: category.sortOrder || 0
    })
    setShowModal(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await filesAPI.upload(file, 'categories')
      setFormData({ ...formData, imageUrl: response.data.result })
      fireSuccess('Tải ảnh lên thành công', '', {
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    } catch (error) {
      fireError(error, 'Không thể tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return fireError({ response: { data: { message: 'Vui lòng nhập tên danh mục' } } })
    if (!formData.slug) return fireError({ response: { data: { message: 'Vui lòng nhập slug' } } })

    try {
      if (editingCategory) {
        await categoriesAPI.updateCategory(editingCategory.id, formData)
        fireSuccess('Thành công', 'Đã cập nhật danh mục')
      } else {
        await categoriesAPI.createCategory(formData)
        fireSuccess('Thành công', 'Đã thêm danh mục mới')
      }
      setShowModal(false)
      fetchCategories()
    } catch (error) {
      fireError(error, 'Thao tác thất bại')
    }
  }

  const handleDelete = async (category) => {
    // Show warning with product count
    const productWarning = category.productCount > 0 
      ? `<br><br><strong class="text-red-600">⚠️ Danh mục này có ${category.productCount} sản phẩm!</strong>`
      : ''
    
    const result = await Swal.fire({
      title: 'Xóa danh mục?',
      html: `Bạn có chắc muốn xóa "<strong>${category.name}</strong>"?${productWarning}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Hủy'
    })

    if (result.isConfirmed) {
      try {
        await categoriesAPI.deleteCategory(category.id)
        fireSuccess('Đã xóa', 'Danh mục đã được ẩn thành công')
        fetchCategories()
      } catch (error) {
        fireError(error, 'Không thể xóa danh mục này')
      }
    }
  }

  const handleActivateAll = async () => {
    const result = await Swal.fire({
      title: 'Kích hoạt tất cả?',
      text: "Tất cả danh mục đang ẩn sẽ được hiển thị lại trên trang chủ.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý kích hoạt',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Hủy'
    })

    if (result.isConfirmed) {
      setIsLoading(true)
      try {
        await categoriesAPI.activateAll()
        fireSuccess('Thành công', 'Toàn bộ danh mục đã được kích hoạt!')
        fetchCategories()
      } catch (error) {
        fireError(error, 'Không thể kích hoạt hàng loạt')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Get root categories (for parent dropdown)
  const rootCategories = categories.filter(cat => !cat.parentId)

  // Filter & Sort categories
  const sortedAndFiltered = categories
    .filter(cat => {
      const matchSearch = cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cat.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && cat.active) ||
                         (statusFilter === 'inactive' && !cat.active)
      return matchSearch && matchStatus
    })
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) // Sort by sortOrder ascending

  return (
    <div className="space-y-5 sm:space-y-8 pb-12 sm:pb-16 animate-fade-in">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Categories
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-dark-text tracking-tight">
            Quản lý danh mục
          </h1>
          <p className="text-sm sm:text-base text-text-secondary dark:text-gray-400 mt-2 leading-relaxed">
            Tạo, sắp xếp và quản lý danh mục sản phẩm theo cấu trúc rõ ràng.
          </p>
        </div>
      </div>

      {/* Header with Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col md:flex-row gap-3 flex-1 w-full">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 pl-12 pr-10 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm appearance-none outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiển thị</option>
              <option value="inactive">Đang ẩn</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <button 
            onClick={handleActivateAll}
            className="flex-1 lg:flex-none px-6 h-12 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-bold rounded-2xl hover:bg-green-100 transition-all flex items-center justify-center gap-2 border border-green-200 dark:border-green-800"
          >
            <Plus className="h-5 w-5 rotate-45" /> Kích hoạt nhanh
          </button>
          <button 
            onClick={handleAddNew} 
            className="flex-1 lg:flex-none px-8 h-12 bg-primary-MAIN text-white font-black rounded-2xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-[1.75rem] shadow-sm border border-border dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Danh mục</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Đường dẫn</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Thứ tự</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Sản phẩm</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Trạng thái</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {sortedAndFiltered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-medium">
                      Không tìm thấy danh mục nào phù hợp
                    </td>
                  </tr>
                ) : (
                  sortedAndFiltered.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border overflow-hidden flex-shrink-0">
                            {category.imageUrl ? (
                              <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                             <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-primary-500 transition-colors">
                               {category.name}
                             </div>
                             {category.parentId && (
                               <div className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                                  <ChevronRight className="h-3 w-3" />
                                  Con của {category.parentName}
                               </div>
                             )}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <code className="text-xs bg-gray-100 dark:bg-dark-bg px-3 py-1.5 rounded-xl text-primary-600 dark:text-primary-400 font-mono font-bold">
                          /{category.slug}
                        </code>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <span className="text-sm font-black text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-bg w-8 h-8 inline-flex items-center justify-center rounded-lg">
                          {category.sortOrder || 0}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-center">
                        {category.productCount > 0 ? (
                           <div className="inline-flex flex-col items-center">
                              <span className="text-base font-black text-gray-900 dark:text-white leading-none">{category.productCount}</span>
                              <span className="text-[8px] font-black uppercase text-gray-400 mt-1">Sản phẩm</span>
                           </div>
                        ) : (
                          <div className="inline-flex flex-col items-center p-2 rounded-2xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 animate-pulse">
                             <span className="text-sm font-black text-yellow-600">0 SP</span>
                             <span className="text-[8px] font-black uppercase text-yellow-500 mt-0.5">Cần cập nhật</span>
                          </div>
                        )}
                      </td>

                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                          category.active 
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {category.active ? 'Hệ thống hiển thị' : 'Đang ở trạng thái ẩn'}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button
                             onClick={() => handleEdit(category)}
                             className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-md shadow-black/5"
                           >
                             <Edit2 className="h-3 w-3" /> Sửa
                           </button>
                           <button
                             onClick={() => handleDelete(category)}
                             className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-md shadow-red-500/20"
                           >
                             <Trash2 className="h-3 w-3" /> Xóa
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white dark:bg-dark-card rounded-[1.75rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-zoom-in border border-border dark:border-dark-border max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative p-8 overflow-hidden sticky top-0 bg-white dark:bg-dark-card z-10">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
               <div className="flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {editingCategory ? 'Thay đổi thông tin danh mục của bạn' : 'Tạo mới một danh mục sản phẩm'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 group transition-all rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Basic Info */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="VD: Điện thoại, Laptop..."
                      className="input h-12 bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border" 
                      required
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Slug (Đường dẫn) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="dien-thoai-thong-minh"
                      className="input h-12 bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border"
                      required
                      value={formData.slug} 
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                    />
                    <p className="text-xs text-gray-500 ml-1">URL: /products/{formData.slug || 'slug'}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">Danh mục cha</label>
                    <select
                      className="input h-12 bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border"
                      value={formData.parentId || ''}
                      onChange={(e) => setFormData({...formData, parentId: e.target.value || null})}
                    >
                      <option value="">— Không có (Danh mục gốc) —</option>
                      {rootCategories
                        .filter(c => !editingCategory || c.id !== editingCategory.id)
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">Thứ tự sắp xếp</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="input h-12 bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border"
                      value={formData.sortOrder} 
                      onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">Mô tả</label>
                    <textarea 
                      placeholder="Mô tả ngắn gọn về danh mục này..."
                      className="input min-h-[100px] py-3 bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border resize-none" 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Right Column: Image & Status */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">Hình ảnh đại diện</label>
                    
                    <div className="relative group aspect-square rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-dark-bg border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-primary-400 transition-all flex items-center justify-center">
                      {formData.imageUrl ? (
                        <>
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                             <label className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-full cursor-pointer hover:bg-primary-50 transition-all shadow-xl font-bold text-sm">
                                <Upload className="h-4 w-4" />
                                Thay đổi ảnh
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                             </label>
                             <button 
                               type="button" 
                               onClick={() => setFormData({...formData, imageUrl: ''})}
                               className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-xl font-bold text-sm"
                             >
                               <X className="h-4 w-4" />
                               Gỡ bỏ
                             </button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-primary-50/10 transition-all group/upload">
                          <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/10 text-primary-500 rounded-3xl flex items-center justify-center mb-4 group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-300">
                            {uploading ? (
                              <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent animate-spin rounded-full"></div>
                            ) : (
                              <ImagePlus className="h-10 w-10" />
                            )}
                          </div>
                          <p className="text-sm font-black text-gray-700 dark:text-gray-200">Chọn ảnh từ máy</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB</p>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                        </label>
                      )}
                    </div>

                    {/* URL Input */}
                    <div className="relative mt-3">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-100 dark:border-dark-border">
                        <Link className="h-4 w-4 text-primary-500" />
                      </div>
                      <input 
                        type="text" 
                        className="input pl-14 h-11 text-[13px] bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border font-medium" 
                        placeholder="Hoặc dán URL hình ảnh..."
                        value={formData.imageUrl} 
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'} dark:bg-opacity-10 transition-colors`}>
                          <Plus className={`h-5 w-5 ${formData.active ? '' : 'rotate-45'} transition-transform`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Trạng thái hiển thị</p>
                          <p className="text-xs text-gray-500">{formData.active ? 'Đang hiển thị cho khách' : 'Đang ẩn khỏi khách'}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" className="sr-only peer"
                          checked={formData.active} 
                          onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-3 px-10 py-4 bg-primary-MAIN text-white font-black rounded-2xl hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                  {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories
