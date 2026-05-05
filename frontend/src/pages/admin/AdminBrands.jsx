import { useEffect, useState } from 'react'
import { brandsAPI } from '../../api/brands'
import { filesAPI } from '../../api/files'
import { Plus, Search, X, ImageIcon, Link, ImagePlus, Edit2, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader'

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
      cancelButtonText: 'Hủy',
      customClass: {
        confirmButton: 'bg-red-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
        cancelButton: 'bg-gray-100 text-gray-600 font-bold px-6 py-2 rounded-lg'
      },
      buttonsStyling: false
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
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader 
        title="Quản lý" 
        accentTitle="Thương hiệu"
        subtitle="Tổ chức và tối ưu danh sách thương hiệu hiển thị trên cửa hàng."
        rightElement={
          <button 
            onClick={handleAddNew}
            className="h-[46px] px-6 bg-primary-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" /> 
            THÊM THƯƠNG HIỆU
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm thương hiệu theo tên hoặc slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[46px] pl-12 pr-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-medium"
          />
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
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Thương hiệu</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Đường dẫn</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Mô tả</th>
                  <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                      Không tìm thấy thương hiệu nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 p-2 flex-shrink-0 flex items-center justify-center">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="text-[14px] font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {brand.name}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <span className="text-[12px] bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600 font-mono font-bold">
                          /{brand.slug}
                        </span>
                      </td>

                      <td className="px-8 py-5">
                        <p className="text-[13px] text-gray-500 font-medium line-clamp-1 max-w-xs">{brand.description || 'Chưa có mô tả'}</p>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(brand)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand)}
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
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[18px] font-black text-gray-900 tracking-tight uppercase">
                {editingBrand ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Tên thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="VD: Samsung, Apple..."
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-bold" 
                    required
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Slug (Đường dẫn)
                  </label>
                  <input 
                    type="text" 
                    placeholder="samsung-viet-nam"
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-mono font-bold"
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Mô tả</label>
                  <textarea 
                    placeholder="Thông tin giới thiệu về thương hiệu..."
                    className="w-full min-h-[100px] px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[14px] font-medium resize-none" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Logo Thương hiệu</label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-gray-50 border border-gray-200 p-3 flex-shrink-0 flex items-center justify-center">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          className="w-full h-11 pl-10 pr-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none text-[13px] font-medium" 
                          placeholder="Dán URL logo hoặc tải lên..."
                          value={formData.logoUrl} 
                          onChange={(e) => setFormData({...formData, logoUrl: e.target.value})} 
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all text-[12px] font-black text-gray-600 shadow-sm uppercase tracking-wider">
                        <ImagePlus className="h-4 w-4" />
                        {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                      </label>
                    </div>
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
