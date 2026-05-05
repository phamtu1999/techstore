import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { categoriesAPI } from '../../api/categories'
import { productsAPI } from '../../api/products'
import AdminTable from '../../components/admin/AdminTable'
import { fetchAdminProducts } from '../../store/slices/productsSlice'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'

// Sub-components
import ProductFilters from '../../components/admin/products/ProductFilters'

const AdminProducts = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { products, totalPages, currentPage, isLoading } = useSelector((state) => state.products)

  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '0')
  const setPage = (valOrFn) => {
    setSearchParams(prev => {
      const current = parseInt(prev.get('page') || '0')
      const next = typeof valOrFn === 'function' ? valOrFn(current) : valOrFn
      prev.set('page', next)
      return prev
    })
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [sortConfig, setSortConfig] = useState(null)

  const loadProducts = useCallback((nextPage = page, query = searchTerm.trim()) => {
    dispatch(fetchAdminProducts({ page: nextPage, size: 10, q: query || undefined }))
  }, [dispatch, page, searchTerm])

  useEffect(() => { loadProducts(page) }, [loadProducts, page])
  useEffect(() => {
    let mounted = true
    categoriesAPI.getAll().then(res => {
      if (mounted) setCategories(res.data?.result || [])
    })
    return () => { mounted = false }
  }, [])

  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault()
    setPage(0)
    loadProducts(0)
  }, [loadProducts])

  const handleAddNew = useCallback(() => {
    navigate('/admin/products/new')
  }, [navigate])

  const handleEdit = useCallback((product) => {
    navigate(`/admin/products/${product.id}/edit`)
  }, [navigate])

  const handleDelete = async (product) => {
    const res = await Swal.fire({ 
      title: 'Xác nhận xóa sản phẩm', 
      html: `<p class="text-gray-600">Bạn có chắc chắn muốn xóa sản phẩm:</p><p class="font-bold text-gray-900 mt-2">"${product.name}"</p><p class="text-sm text-red-600 mt-2">⚠️ Hành động này không thể hoàn tác!</p>`, 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    })
    if (res.isConfirmed) {
      try { 
        await productsAPI.deleteProduct(product.id)
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Sản phẩm đã được xóa thành công',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
        loadProducts() 
      }
      catch (err) { 
        fireError(err, 'Không thể xóa sản phẩm')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return
    
    const res = await Swal.fire({
      title: 'Xóa nhiều sản phẩm',
      html: `<p class="text-gray-600">Bạn đang xóa <strong>${selectedRows.length}</strong> sản phẩm</p><p class="text-sm text-red-600 mt-2">⚠️ Hành động này không thể hoàn tác!</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa tất cả',
      cancelButtonText: 'Hủy'
    })

    if (res.isConfirmed) {
      try {
        await Promise.all(selectedRows.map(id => productsAPI.deleteProduct(id)))
        fireSuccess('Đã xóa!', `Đã xóa ${selectedRows.length} sản phẩm`, {
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
        setSelectedRows([])
        loadProducts()
      } catch (err) {
        fireError(err, 'Không thể xóa một số sản phẩm')
      }
    }
  }

  const handleDuplicate = async (product) => {
    try {
      Swal.fire({ title: 'Đang nhân bản...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
      const { data } = await productsAPI.getAdminById(product.id)
      const p = data?.result
      
      const newProduct = {
        name: `${p.name} (Copy)`,
        description: p.description || '',
        categoryId: p.category?.id,
        brandId: p.brand?.id,
        slug: `${p.slug}-copy-${Date.now()}`,
        active: p.active,
        imageUrls: p.images?.map(img => img.url) || [],
        variants: p.variants?.map(v => ({
          sku: v.sku ? `${v.sku}-copy-${Date.now()}` : `copy-${Date.now()}`,
          name: v.name,
          price: v.price,
          stockQuantity: v.stockQuantity,
          color: v.color,
          size: v.size,
          sortOrder: v.sortOrder
        })) || [],
        attributes: p.attributes?.map(a => ({ name: a.name, value: a.value })) || []
      }
      
      await productsAPI.createProduct(newProduct)
      Swal.fire({
        icon: 'success',
        title: 'Đã nhân bản!',
        text: 'Sản phẩm đã được nhân bản thành công',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      loadProducts()
    } catch (err) {
      console.error(getApiErrorMessage(err));
      fireError(err, 'Không thể nhân bản sản phẩm')
    }
  }

  const handleToggleStatus = async (product) => {
    try {
      Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
      const { data } = await productsAPI.getAdminById(product.id)
      const p = data?.result

      const payload = {
        name: p.name,
        description: p.description || '',
        categoryId: p.category?.id,
        brandId: p.brand?.id,
        slug: p.slug,
        active: !p.active,
        imageUrls: p.images?.map(img => img.url) || [],
        variants: p.variants?.map(v => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          stockQuantity: v.stockQuantity,
          color: v.color,
          size: v.size,
          sortOrder: v.sortOrder
        })) || [],
        attributes: p.attributes?.map(a => ({ name: a.name, value: a.value })) || []
      }

      await productsAPI.updateProduct(p.id, payload)
      Swal.fire({
        icon: 'success',
        title: !p.active ? 'Đã hiển thị!' : 'Đã ẩn!',
        text: `Sản phẩm đã được ${!p.active ? 'hiển thị' : 'ẩn'}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      })
      loadProducts()
    } catch (err) {
      console.error(getApiErrorMessage(err));
      fireError(err, 'Không thể thay đổi trạng thái')
    }
  }

  const handleSelectRow = useCallback((id, checked) => {
    setSelectedRows(prev => 
      checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
    )
  }, [])

  const handleSelectAll = useCallback((checked) => {
    setSelectedRows(checked ? products.map(p => p.id) : [])
  }, [products])

  const handleSort = useCallback((config) => {
    setSortConfig(config)
  }, [])

  const handleImportExcel = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      Swal.fire({ title: 'Đang xử lý...', didOpen: () => Swal.showLoading() })
      await productsAPI.importExcel(file)
      fireSuccess('Thành công', 'Đã nhập dữ liệu Excel', { timer: 3000 })
      loadProducts()
    } catch (err) { fireError(err, 'Nhập Excel thất bại') }
    e.target.value = ''
  }

  const handleExportExcel = async () => {
    try {
      Swal.fire({ title: 'Đang chuẩn bị...', didOpen: () => Swal.showLoading() })
      const res = await productsAPI.exportExcel()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url; link.setAttribute('download', `products_${Date.now()}.xlsx`)
      document.body.appendChild(link); link.click()
      link.parentNode.removeChild(link); window.URL.revokeObjectURL(url)
      fireSuccess('Thành công', 'Đã xuất file Excel')
    } catch (err) { fireError(err, 'Xuất Excel thất bại') }
  }

  const productColumns = useMemo(() => [
    { 
      key: 'imageUrls', 
      label: 'Hình ảnh',
      render: (urls) => (
        <div className="flex items-center gap-3">
          <img 
            src={urls?.[0] || 'https://via.placeholder.com/60'} 
            alt="Product" 
            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )
    },
    { 
      key: 'name', 
      label: 'Tên sản phẩm',
      sortable: true,
      render: (name, row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate">{row.brand?.name || '---'}</p>
        </div>
      )
    },
    { 
      key: 'category',
      label: 'Danh mục',
      render: (cat) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
          {cat?.name || '---'}
        </span>
      )
    },
    { 
      key: 'variants', 
      label: 'Giá', 
      sortable: true,
      render: (v) => (
        <span className="font-semibold text-gray-900">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v?.[0]?.price || 0)}
        </span>
      )
    },
    { 
      key: 'variants', 
      label: 'Tồn kho', 
      sortable: true,
      render: (v, row) => {
        const stock = v?.[0]?.stockQuantity || 0
        const isOutOfStock = stock === 0
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : 'text-gray-900'}`}>
              {stock}
            </span>
            {isOutOfStock && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded">
                Hết hàng
              </span>
            )}
          </div>
        )
      }
    },
    { 
      key: 'active', 
      label: 'Trạng thái',
      render: (v, row) => {
        const stock = row.variants?.[0]?.stockQuantity || 0
        const isOutOfStock = stock === 0
        
        if (isOutOfStock) {
          return (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
              Hết hàng
            </span>
          )
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {v ? 'Hoạt động' : 'Đã ẩn'}
          </span>
        )
      }
    },
  ], [])

  return (
    <div className="space-y-5 sm:space-y-8 pb-12 sm:pb-16">
      {/* Header with Bulk Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-dark-text tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="text-sm sm:text-base text-text-secondary dark:text-gray-400 mt-2 leading-relaxed">
            Tổng số <span className="font-bold text-text-primary dark:text-dark-text">{products.length}</span> sản phẩm trong danh mục hiện tại.
          </p>
        </div>
        
        {selectedRows.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-sm">
            <span className="text-sm font-semibold text-text-primary dark:text-dark-text">
              Đã chọn {selectedRows.length} sản phẩm
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              Xóa tất cả
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="px-3.5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-dark-card rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-border dark:border-dark-border p-4 sm:p-6">
        <ProductFilters 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            handleSearch={handleSearch}
            handleImportExcel={handleImportExcel} 
            handleExportExcel={handleExportExcel} 
            handleAddNew={handleAddNew}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
              <p className="text-sm text-gray-500 mt-4">Đang tải dữ liệu...</p>
            </div>
        ) : (
            <div>
                <AdminTable 
                  columns={productColumns} 
                  data={products} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onToggleStatus={handleToggleStatus}
                  showIndex={true} 
                  currentPage={currentPage} 
                  pageSize={10}
                  selectedRows={selectedRows}
                  onSelectRow={handleSelectRow}
                  onSelectAll={handleSelectAll}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                          Trang <span className="font-semibold">{currentPage + 1}</span> / <span className="font-semibold">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <button 
                              disabled={page === 0} 
                              onClick={() => setPage(p => p - 1)} 
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              ← Trước
                            </button>
                            <button 
                              disabled={page >= totalPages - 1} 
                              onClick={() => setPage(p => p + 1)} 
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Sau →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
