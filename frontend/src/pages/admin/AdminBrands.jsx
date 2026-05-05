import { useEffect, useState } from 'react'
import { brandsAPI } from '../../api/brands'
import { filesAPI } from '../../api/files'
import { Plus, Search, Upload, X, ImageIcon, Link, ImagePlus, Edit2, Trash2, Filter } from 'lucide-react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'

const AdminBrands = () => {
  const [brands, setBrands] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    slug: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    setIsLoading(true)
    try {
      const response = await brandsAPI.adminGetAll()
      setBrands(response.data.result || [])
    } catch (error) {
      console.error(getApiErrorMessage(error))
    }
    setIsLoading(false)
  }

  const handleAddNew = () => {
    setEditingBrand(null)
    setFormData({ 
      name: '', 
      description: '', 
      logoUrl: '', 
      slug: ''
    })
    setShowModal(true)
  }

  const handleEdit = (brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
      slug: brand.slug || ''
    })
    setShowModal(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await filesAPI.upload(file, 'brands')
      setFormData({ ...formData, logoUrl: response.data.result })
      fireSuccess('Tải logo thành công', '', {
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    } catch (error) {
      fireError(error, 'Không thể tải logo lên')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return fireError({ response: { data: { message: 'Vui lòng nhập tên thương hiệu' } } })

    try {
      if (editingBrand) {
        await brandsAPI.update(editingBrand.id, formData)
        fireSuccess('Thành công', 'Đã cập nhật thương hiệu')
      } else {
        await brandsAPI.create(formData)
        fireSuccess('Thành công', 'Đã thêm thương hiệu mới')
      }
      setShowModal(false)
      fetchBrands()
    } catch (error) {
      fireError(error, 'Thao tác thất bại')
    }
  }

  const handleDelete = async (brand) => {
    const result = await Swal.fire({
      title: 'Xóa thương hiệu?',
      html: `Bạn có chắc muốn xóa "<strong>${brand.name}</strong>"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Hủy'
    })

    if (result.isConfirmed) {
      try {
        await brandsAPI.delete(brand.id)
        fireSuccess('Đã xóa', 'Thương hiệu đã được xóa thành công')
        fetchBrands()
      } catch (error) {
        fireError(error, 'Không thể xóa thương hiệu này')
      }
    }
  }

  const filteredBrands = brands.filter(brand => 
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-5 sm:space-y-8 pb-12 sm:pb-16 animate-fade-in">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Brands
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-dark-text tracking-tight">
            Quản lý thương hiệu
          </h1>
          <p className="text-sm sm:text-base font-medium text-text-secondary dark:text-gray-400 mt-2 leading-relaxed">
            Tổ chức và tối ưu danh sách thương hiệu hiển thị trên cửa hàng.
          </p>
        </div>
        <div className="flex w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>

        <button 
          onClick={handleAddNew} 
          className="w-full lg:w-auto px-8 h-12 bg-primary-MAIN text-white font-black rounded-2xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" /> Thêm mới
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Thương hiệu</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Đường dẫn</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Mô tả</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-medium">
                      Không tìm thấy thương hiệu nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border overflow-hidden flex-shrink-0">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-2" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-primary-500 transition-colors">
                            {brand.name}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <code className="text-xs bg-gray-100 dark:bg-dark-bg px-3 py-1.5 rounded-xl text-primary-600 dark:text-primary-400 font-mono font-bold">
                          /{brand.slug}
                        </code>
                      </td>

                      <td className="px-8 py-5">
                        <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">{brand.description || 'Chưa có mô tả'}</p>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button
                             onClick={() => handleEdit(brand)}
                             className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-md shadow-black/5"
                           >
                             <Edit2 className="h-3 w-3" /> Sửa
                           </button>
                           <button
                             onClick={() => handleDelete(brand)}
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
          <div className="bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-zoom-in border border-white/20 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative p-8 overflow-hidden sticky top-0 bg-white dark:bg-dark-card z-10">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
               <div className="flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {editingBrand ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {editingBrand ? 'Thay đổi thông tin thương hiệu của bạn' : 'Tạo mới một thương hiệu đối tác'}
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
                      Tên thương hiệu <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="VD: Samsung, Apple, Sony..."
                      className="input h-12 bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border" 
                      required
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Slug (Đường dẫn)
                    </label>
                    <input 
                      type="text" 
                      placeholder="samsung-viet-nam"
                      className="input h-12 bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border"
                      value={formData.slug} 
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                    />
                    <p className="text-xs text-gray-500 ml-1">Để trống để tự động tạo theo tên</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">Mô tả</label>
                    <textarea 
                      placeholder="Thông tin giới thiệu về thương hiệu này..."
                      className="input min-h-[150px] py-3 bg-gray-50/50 dark:bg-dark-bg/50 border-gray-100 dark:border-dark-border resize-none" 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Right Column: Logo */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider ml-1">Logo Thương hiệu</label>
                    
                    <div className="relative group aspect-square rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-dark-bg border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-primary-400 transition-all flex items-center justify-center">
                      {formData.logoUrl ? (
                        <>
                          <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                             <label className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-full cursor-pointer hover:bg-primary-50 transition-all shadow-xl font-bold text-sm">
                                <Upload className="h-4 w-4" />
                                Thay đổi logo
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                             </label>
                             <button 
                               type="button" 
                               onClick={() => setFormData({...formData, logoUrl: ''})}
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
                          <p className="text-sm font-black text-gray-700 dark:text-gray-200">Tải logo lên</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG nền trong suốt là tốt nhất</p>
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
                        placeholder="Hoặc dán URL logo..."
                        value={formData.logoUrl} 
                        onChange={(e) => setFormData({...formData, logoUrl: e.target.value})} 
                      />
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
                  {editingBrand ? 'Lưu thay đổi' : 'Tạo thương hiệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBrands
