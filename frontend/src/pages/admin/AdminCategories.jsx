import { useEffect, useState } from 'react'
import { categoriesAPI } from '../../api/categories'
import { filesAPI } from '../../api/files'
import { Plus, Search, Upload, X, ImageIcon, ImagePlus, Edit2, Trash2, ChevronRight, Filter } from 'lucide-react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader'
import AdminPill from '../../components/admin/shared/AdminPill'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  
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
  const [activeTab, setActiveTab] = useState('manual')
  const [jsonInput, setJsonInput] = useState('')

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
    setActiveTab('manual')
    setJsonInput('')
    setShowModal(true)
  }

  const handleJsonParse = () => {
    try {
      const data = JSON.parse(jsonInput)
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        imageUrl: data.imageUrl || prev.imageUrl,
        slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || prev.slug,
        parentId: data.parentId || prev.parentId,
        active: data.active ?? prev.active,
        sortOrder: data.sortOrder ?? prev.sortOrder
      }))
      fireSuccess('Phân tích JSON thành công', '', { toast: true, position: 'top-end', timer: 2000 })
      setActiveTab('manual')
    } catch (err) {
      fireError({ response: { data: { message: 'JSON không hợp lệ. Vui lòng kiểm tra lại.' } } })
    }
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
    const productWarning = category.productCount > 0 
      ? `<br><br><strong class="text-red-600">⚠️ Danh mục này có ${category.productCount} sản phẩm!</strong>`
      : ''
    
    const result = await Swal.fire({
      title: 'Xóa danh mục?',
      html: `Bạn có chắc muốn xóa "<strong>${category.name}</strong>"?${productWarning}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      customClass: {
        confirmButton: 'bg-red-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
        cancelButton: 'bg-gray-100 text-gray-600 font-bold px-6 py-2 rounded-lg'
      },
      buttonsStyling: false
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(sortedAndFiltered.map(c => c.id))
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

  const handleActivateAll = async () => {
    const result = await Swal.fire({
      title: 'Kích hoạt tất cả?',
      text: "Tất cả danh mục đang ẩn sẽ được hiển thị lại trên trang chủ.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý kích hoạt',
      cancelButtonText: 'Hủy',
      customClass: {
        confirmButton: 'bg-green-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
        cancelButton: 'bg-gray-100 text-gray-600 font-bold px-6 py-2 rounded-lg'
      },
      buttonsStyling: false
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

  const rootCategories = categories.filter(cat => !cat.parentId)

  const sortedAndFiltered = categories
    .filter(cat => {
      const matchSearch = cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cat.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && cat.active) ||
                         (statusFilter === 'inactive' && !cat.active)
      return matchSearch && matchStatus
    })
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  const bulkActionBar = selectedIds.length > 0 && (
    <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-2 shadow-lg animate-scale-up mr-4">
      <span className="text-[13px] font-bold">
        Đã chọn <span className="text-primary-500 font-black">{selectedIds.length}</span>
      </span>
      <div className="w-[1px] h-4 bg-gray-700"></div>
      <button 
        onClick={async () => {
          const res = await Swal.fire({
            title: 'Ẩn hàng loạt?',
            text: `Bạn có chắc muốn ẩn ${selectedIds.length} danh mục đã chọn?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
          })
          if (res.isConfirmed) {
            try {
              await Promise.all(selectedIds.map(id => categoriesAPI.updateCategory(id, { active: false })))
              fireSuccess('Thành công', 'Đã ẩn các danh mục đã chọn')
              setSelectedIds([])
              fetchCategories()
            } catch (err) { fireError(err, 'Lỗi khi ẩn hàng loạt') }
          }
        }}
        className="text-[13px] font-bold hover:text-primary-400 transition-colors"
      >
        Ẩn nhanh
      </button>
      <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader 
        title="Quản lý" 
        accentTitle="Danh mục"
        subtitle="Tạo, sắp xếp và quản lý danh mục sản phẩm theo cấu trúc rõ ràng."
        rightContent={
          <div className="flex items-center gap-3">
            {bulkActionBar}
            <button 
              onClick={handleActivateAll}
              className="h-[46px] px-5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-[13px] flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="h-5 w-5 rotate-45" /> 
              KÍCH HOẠT NHANH
            </button>
            <button 
              onClick={handleAddNew} 
              className="h-[46px] px-6 bg-primary-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-5 w-5" /> 
              THÊM DANH MỤC
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[46px] pl-12 pr-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-medium"
            />
          </div>

          <div className="relative min-w-[240px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-[46px] pl-12 pr-10 bg-gray-50 border-none rounded-xl appearance-none outline-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white cursor-pointer text-[14px] font-bold text-gray-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiển thị</option>
              <option value="inactive">Đang ẩn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      checked={selectedIds.length > 0 && selectedIds.length === sortedAndFiltered.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center w-12">STT</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Danh mục</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Đường dẫn</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Thứ tự</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Sản phẩm</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Trạng thái</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedAndFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                      Không tìm thấy danh mục nào phù hợp
                    </td>
                  </tr>
                ) : (
                  sortedAndFiltered.map((category, index) => (
                    <tr key={category.id} className={`hover:bg-gray-50/30 transition-colors group ${selectedIds.includes(category.id) ? 'bg-primary-50/30' : ''}`}>
                      <td className="px-6 py-5">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                          checked={selectedIds.includes(category.id)}
                          onChange={() => handleSelectOne(category.id)}
                        />
                      </td>
                      <td className="px-4 py-5 text-center text-[12px] font-bold text-gray-400">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                            {category.imageUrl ? (
                              <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                             <div className="text-[14px] font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                               {category.name}
                             </div>
                             {category.parentId && (
                               <div className="text-[11px] font-medium text-gray-400 mt-0.5 flex items-center gap-1">
                                  <ChevronRight className="h-3 w-3" />
                                  Con của {category.parentName}
                               </div>
                             )}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <span className="text-[12px] bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600 font-mono font-bold">
                          /{category.slug}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <span className="text-[13px] font-black text-gray-700 bg-gray-50 w-8 h-8 inline-flex items-center justify-center rounded-lg border border-gray-100">
                          {category.sortOrder || 0}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[14px] font-black text-gray-900 leading-none">{category.productCount || 0}</span>
                          <span className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-tighter">Sản phẩm</span>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <AdminPill 
                          label={category.active ? 'Đang hiển thị' : 'Đang ẩn'} 
                          type={category.active ? 'success' : 'danger'} 
                        />
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-slide-up border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-[18px] font-black text-gray-900 tracking-tight uppercase">
                  {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                </h2>
                {!editingCategory && (
                  <div className="flex bg-gray-100 p-0.5 rounded-lg w-fit">
                    <button
                      type="button"
                      onClick={() => setActiveTab('manual')}
                      className={`px-4 py-1 rounded-md text-[11px] font-black uppercase transition-all ${activeTab === 'manual' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Thủ công
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('json')}
                      className={`px-4 py-1 rounded-md text-[11px] font-black uppercase transition-all ${activeTab === 'json' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Nhập JSON
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {activeTab === 'json' && !editingCategory ? (
              <div className="p-8 space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Dữ liệu JSON</label>
                    <button 
                      type="button"
                      onClick={() => setJsonInput(JSON.stringify({
                        name: "Tên danh mục",
                        slug: "ten-danh-muc",
                        description: "Mô tả danh mục",
                        imageUrl: "https://example.com/image.jpg",
                        parentId: null,
                        sortOrder: 1,
                        active: true
                      }, null, 2))}
                      className="text-[10px] font-black text-primary-600 uppercase hover:underline"
                    >
                      Dùng mẫu
                    </button>
                  </div>
                  <textarea 
                    className="w-full min-h-[300px] p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary-600/30 focus:bg-white transition-all outline-none font-mono text-[13px] leading-relaxed"
                    placeholder='{ "name": "Điện thoại", ... }'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('manual')} 
                    className="flex-1 h-12 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all text-[14px] uppercase"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="button" 
                    onClick={handleJsonParse}
                    className="flex-[2] h-12 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all text-[14px] uppercase"
                  >
                    Phân tích & Điền form
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="VD: Điện thoại, Laptop..."
                      className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-bold" 
                      required
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Slug (Đường dẫn) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="dien-thoai-thong-minh"
                      className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-mono font-bold"
                      required
                      value={formData.slug} 
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Danh mục cha</label>
                    <select
                      className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-bold appearance-none cursor-pointer"
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
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Thứ tự sắp xếp</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-bold"
                      value={formData.sortOrder} 
                      onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Mô tả</label>
                    <textarea 
                      placeholder="Mô tả ngắn gọn về danh mục..."
                      className="w-full min-h-[100px] px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-medium resize-none" 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Right Column: Image & Status */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh đại diện</label>
                    <div className="relative group aspect-square rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary-600/50 transition-all flex items-center justify-center">
                      {formData.imageUrl ? (
                        <>
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                             <label className="px-4 py-2 bg-white text-primary-600 rounded-lg cursor-pointer hover:bg-gray-50 transition-all shadow-sm font-bold text-[12px] uppercase">
                                Thay đổi ảnh
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                             </label>
                             <button 
                               type="button" 
                               onClick={() => setFormData({...formData, imageUrl: ''})}
                               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm font-bold text-[12px] uppercase"
                             >
                               Gỡ bỏ
                             </button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/50 transition-all">
                          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center mb-2">
                            {uploading ? (
                              <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent animate-spin rounded-full"></div>
                            ) : (
                              <ImagePlus className="h-6 w-6" />
                            )}
                          </div>
                          <p className="text-[13px] font-bold text-gray-600">Tải ảnh lên</p>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-gray-700">Trạng thái hiển thị</p>
                      <p className="text-[11px] text-gray-500 font-medium">{formData.active ? 'Đang hiển thị cho khách' : 'Đang ẩn khỏi khách'}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" className="sr-only peer"
                        checked={formData.active} 
                        onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 h-12 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all text-[14px] uppercase"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-[2] h-12 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all text-[14px] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục ngay'}
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories
