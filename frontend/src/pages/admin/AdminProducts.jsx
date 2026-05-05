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
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader'
import AdminPagination from '../../components/admin/shared/AdminPagination'
import AdminPill from '../../components/admin/shared/AdminPill'

const AdminProducts = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { products, totalPages, currentPage, isLoading } = useSelector((state) => state.products)

  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '0')
  const setPage = (nextPage) => {
    setSearchParams(prev => {
      prev.set('page', nextPage)
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
          <p className="font-bold text-gray-900 truncate text-[14px]">{name}</p>
          <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{row.brand?.name || '---'}</p>
        </div>
      )
    },
    { 
      key: 'category',
      label: 'Danh mục',
      render: (cat) => (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold uppercase rounded-lg border border-blue-100 tracking-wider">
          {cat?.name || '---'}
        </span>
      )
    },
    { 
      key: 'variants', 
      label: 'Giá', 
      sortable: true,
      render: (v) => (
        <span className="font-black text-gray-900 text-[14px]">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v?.[0]?.price || 0)}
        </span>
      )
    },
    { 
      key: 'variants', 
      label: 'Tồn kho', 
      sortable: true,
      render: (v) => {
        const stock = v?.[0]?.stockQuantity || 0
        const isOutOfStock = stock === 0
        return (
          <div className="flex items-center gap-2">
            <span className={`font-black text-[14px] ${isOutOfStock ? 'text-red-600' : 'text-gray-900'}`}>
              {stock}
            </span>
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
        
        if (isOutOfStock) return <AdminPill label="Hết hàng" type="danger" />
        return (
          <AdminPill label={v ? 'Hoạt động' : 'Đã ẩn'} type={v ? 'success' : 'gray'} />
        )
      }
    },
  ], [])

  const headerRight = selectedRows.length > 0 ? (
    <div className="flex items-center gap-3 bg-white border border-red-100 rounded-xl px-4 py-2 shadow-sm animate-scale-up">
      <span className="text-[13px] font-bold text-gray-700">
        Đã chọn <span className="text-red-600 font-black">{selectedRows.length}</span>
      </span>
      <div className="w-[1px] h-4 bg-gray-200"></div>
      <button
        onClick={handleBulkDelete}
        className="text-[13px] font-bold text-red-600 hover:underline"
      >
        Xóa tất cả
      </button>
      <button
        onClick={() => setSelectedRows([])}
        className="text-[13px] font-bold text-gray-400 hover:text-gray-600"
      >
        Hủy
      </button>
    </div>
  ) : null

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader 
        title="Quản lý" 
        accentTitle="Sản phẩm"
        subtitle={`Tổng số ${products.length} sản phẩm trong hệ thống.`}
        rightContent={headerRight}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600" />
              <p className="text-gray-500 font-medium mt-4">Đang tải dữ liệu...</p>
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
                
                <AdminPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
            </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
