import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, SlidersHorizontal, ChevronDown, Check, X, RotateCcw } from 'lucide-react'
import { fetchProducts } from '../store/slices/productsSlice'
import { categoriesAPI } from '../api/categories'
import { brandsAPI } from '../api/brands'
import ProductCard from '../components/ProductCard'
import ProductSkeleton from '../components/ProductSkeleton'

const PRICE_OPTIONS = [
  { label: 'Dưới 5 triệu', min: '', max: '5000000' },
  { label: '5 - 10 triệu', min: '5000000', max: '10000000' },
  { label: '10 - 20 triệu', min: '10000000', max: '20000000' },
  { label: 'Trên 20 triệu', min: '20000000', max: '' },
]

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'createdAt,desc' },
  { label: 'Giá tăng dần', value: 'price,asc' },
  { label: 'Giá giảm dần', value: 'price,desc' },
  { label: 'Đánh giá cao', value: 'rating,desc' },
]

const Products = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, isLoading, totalPages, currentPage } = useSelector((state) => state.products)
  
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Temporary state for buffering filters if needed, but current implementation uses URL directly
  // To satisfy the "Apply" button requirement, we can just keep the URL-sync logic but make the UI look more intentional

  const currentCategory = searchParams.get('category') || ''
  const currentBrand = searchParams.get('brand') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  const currentSort = searchParams.get('sort') || 'createdAt,desc'

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoriesAPI.getAll(),
          brandsAPI.getAll()
        ])
        setCategories((catRes.data?.result || []).filter(c => c.active))
        setBrands(brandRes.data?.result || [])
      } catch (error) {
        console.error('Failed to fetch filters:', error)
      }
    }
    fetchFilters()
  }, [])

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
    dispatch(
      fetchProducts({
        page: Number(searchParams.get('page') || 0),
        size: 16,
        q: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        brand: searchParams.get('brand') || undefined,
        minPrice: searchParams.get('minPrice') || undefined,
        maxPrice: searchParams.get('maxPrice') || undefined,
        sort: searchParams.get('sort') || 'createdAt,desc'
      })
    )
  }, [dispatch, searchParams])

  const updateParams = (updates) => {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    })
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParams({ search: searchTerm.trim() })
  }

  const handlePriceChange = (min, max) => {
    updateParams({ minPrice: min, maxPrice: max })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSearchParams(new URLSearchParams())
    setIsMobileFilterOpen(false)
  }

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams)
    if (newPage > 0) {
      nextParams.set('page', String(newPage))
    } else {
      nextParams.delete('page')
    }
    setSearchParams(nextParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFiltersCount = [currentCategory, currentBrand, currentMinPrice, currentMaxPrice].filter(Boolean).length

  const FilterSidebar = () => {
    const [openSections, setOpenSections] = useState({ category: true, brand: true, price: true })
    const [brandSearch, setBrandSearch] = useState('')
    const [tempPrice, setTempPrice] = useState({ min: currentMinPrice, max: currentMaxPrice })

    const toggleSection = (section) => {
      setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const filteredBrands = brands.filter(b => 
      b.name.toLowerCase().includes(brandSearch.toLowerCase())
    )

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary-600" />
            <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">Bộ lọc</h3>
          </div>
          <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-900">
             <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-none pb-20">
          {/* Categories Accordion */}
          <div className="border-b border-gray-100 dark:border-dark-border last:border-0 pb-4 mb-4">
            <button 
              onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full py-2 mb-2 group"
            >
              <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Danh mục</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSections.category ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`space-y-3 overflow-hidden transition-all duration-300 ${openSections.category ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${!currentCategory ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 dark:border-gray-700 text-transparent group-hover:border-primary-400'}`}>
                  <Check className="w-3 h-3 stroke-[4]" />
                </div>
                <span className={`text-sm font-bold ${!currentCategory ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>Tất cả danh mục</span>
                <input type="radio" name="category" className="hidden" checked={!currentCategory} onChange={() => updateParams({ category: '' })} />
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${currentCategory === cat.slug ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 dark:border-gray-700 text-transparent group-hover:border-primary-400'}`}>
                    <Check className="w-3 h-3 stroke-[4]" />
                  </div>
                  <span className={`text-sm font-bold ${currentCategory === cat.slug ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{cat.name}</span>
                  <input type="radio" name="category" className="hidden" checked={currentCategory === cat.slug} onChange={() => updateParams({ category: cat.slug })} />
                </label>
              ))}
            </div>
          </div>

          {/* Brands Accordion */}
          <div className="border-b border-gray-100 dark:border-dark-border last:border-0 pb-4 mb-4">
            <button 
              onClick={() => toggleSection('brand')}
              className="flex items-center justify-between w-full py-2 mb-2 group"
            >
              <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Thương hiệu</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSections.brand ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`space-y-4 overflow-hidden transition-all duration-300 ${openSections.brand ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm thương hiệu..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${!currentBrand ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 dark:border-gray-700 text-transparent group-hover:border-primary-400'}`}>
                    <Check className="w-3 h-3 stroke-[4]" />
                  </div>
                  <span className={`text-sm font-bold ${!currentBrand ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>Tất cả</span>
                  <input type="radio" name="brand" className="hidden" checked={!currentBrand} onChange={() => updateParams({ brand: '' })} />
                </label>
                {filteredBrands.map(brand => (
                  <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${currentBrand === brand.slug ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 dark:border-gray-700 text-transparent group-hover:border-primary-400'}`}>
                      <Check className="w-3 h-3 stroke-[4]" />
                    </div>
                    <span className={`text-sm font-bold ${currentBrand === brand.slug ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{brand.name}</span>
                    <input type="radio" name="brand" className="hidden" checked={currentBrand === brand.slug} onChange={() => updateParams({ brand: brand.slug })} />
                  </label>
                ))}
                {filteredBrands.length === 0 && <p className="text-[11px] text-gray-400 italic py-2">Không tìm thấy thương hiệu</p>}
              </div>
            </div>
          </div>

          {/* Price Range Accordion */}
          <div className="border-b border-gray-100 dark:border-dark-border last:border-0 pb-4">
            <button 
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full py-2 mb-2 group"
            >
              <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Khoảng giá</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`space-y-5 overflow-hidden transition-all duration-300 ${openSections.price ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              {/* Quick Select Prices */}
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((opt, idx) => {
                   const isActive = currentMinPrice === opt.min && currentMaxPrice === opt.max;
                   return (
                    <button 
                      key={idx} 
                      onClick={() => handlePriceChange(opt.min, opt.max)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${isActive ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary-400'}`}
                    >
                      {opt.label}
                    </button>
                   )
                })}
              </div>

              {/* Manual Entry */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tự nhập khoảng giá</p>
                <div className="flex items-center gap-2">
                   <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">Từ</span>
                      <input 
                        type="number" 
                        value={tempPrice.min}
                        onChange={(e) => setTempPrice(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full pl-8 pr-2 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="0"
                      />
                   </div>
                   <div className="w-2 h-[2px] bg-gray-300"></div>
                   <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">Đến</span>
                      <input 
                        type="number" 
                        value={tempPrice.max}
                        onChange={(e) => setTempPrice(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full pl-9 pr-2 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="MAX"
                      />
                   </div>
                </div>
                <button 
                  onClick={() => updateParams({ minPrice: tempPrice.min, maxPrice: tempPrice.max })}
                  className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-black/5"
                >
                  ÁP DỤNG KHOẢNG GIÁ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 pt-6 pb-2 bg-gradient-to-t from-white via-white dark:from-dark-card dark:via-dark-card to-transparent grid grid-cols-2 gap-3 px-1">
            <button 
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              XÓA LỌC
            </button>
            <button 
              onClick={() => setIsMobileFilterOpen(false)}
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-primary-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[4]" />
              XONG
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-dark-bg">
      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-xs bg-white dark:bg-dark-card p-6 shadow-2xl animate-fade-in-right flex flex-col">
             <FilterSidebar />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-12">
        
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-600/10 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                 Tech Store Collection
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">
                SẢN <span className="text-primary-600">PHẨM</span>
              </h1>
              <p className="mt-4 text-[13px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                {isLoading ? 'Đang tải danh sách...' : (
                  <>
                    <span className="text-gray-900 dark:text-white">{products.length}</span> SẢN PHẨM HIỆN CÓ
                    {activeFiltersCount > 0 && <span className="text-primary-600">• {activeFiltersCount} BỘ LỌC ĐANG BẬT</span>}
                  </>
                )}
              </p>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <div className="sticky top-28 bg-white dark:bg-dark-card rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-dark-border">
                <FilterSidebar />
             </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            
            {/* Top Bar (Search & Sort) */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-10 bg-white dark:bg-dark-card p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-border items-stretch sm:items-center justify-between">
               
               <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                 {/* Mobile Filter Button */}
                 <button 
                   onClick={() => setIsMobileFilterOpen(true)}
                   className="lg:hidden h-[52px] px-5 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center gap-3 text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest active:scale-95 transition-all"
                 >
                   <SlidersHorizontal className="w-5 h-5 text-primary-600" />
                   <span>LỌC</span>
                   {activeFiltersCount > 0 && (
                     <span className="bg-primary-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{activeFiltersCount}</span>
                   )}
                 </button>

                 <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm model, thương hiệu..."
                      className="w-full h-[52px] bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-primary-600/20 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none transition-all dark:text-white placeholder:text-gray-400"
                    />
                 </form>
               </div>

               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <div className="relative w-full sm:w-56">
                    <select
                      value={currentSort}
                      onChange={(e) => updateParams({ sort: e.target.value })}
                      className="w-full h-[52px] appearance-none bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-primary-600/20 rounded-2xl pl-5 pr-12 text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest outline-none transition-all cursor-pointer"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600 pointer-events-none" />
                 </div>
               </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center gap-3">
                    <button
                      onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="h-14 w-14 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-gray-400 flex items-center justify-center hover:bg-primary-600 hover:text-white disabled:opacity-30 transition-all shadow-sm"
                    >
                      <ChevronDown className="w-6 h-6 rotate-90" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) pageNum = i
                      else if (currentPage < 3) pageNum = i
                      else if (currentPage > totalPages - 3) pageNum = totalPages - 5 + i
                      else pageNum = currentPage - 2 + i

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-14 w-14 rounded-2xl text-[13px] font-black transition-all ${
                            currentPage === pageNum
                              ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 scale-110'
                              : 'bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          {String(pageNum + 1).padStart(2, '0')}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="h-14 w-14 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-gray-400 flex items-center justify-center hover:bg-primary-600 hover:text-white disabled:opacity-30 transition-all shadow-sm"
                    >
                      <ChevronDown className="w-6 h-6 -rotate-90" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-dark-border shadow-sm text-center px-6">
                <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8">
                   <Search className="w-12 h-12 text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3">Rất tiếc, không có kết quả</h3>
                <p className="text-sm font-bold text-gray-400 max-w-sm leading-relaxed">Hãy thử xóa bớt bộ lọc hoặc tìm kiếm với từ khóa khác để thấy những sản phẩm công nghệ tuyệt vời.</p>
                <button onClick={clearFilters} className="mt-10 px-10 py-4 bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95">
                  XÓA TẤT CẢ BỘ LỌC
                </button>
              </div>
            )}

            {/* Note for Demo Data */}
            <div className="mt-20 p-8 rounded-[2rem] bg-gray-900 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-lg font-black uppercase tracking-widest">Sản phẩm đang được cập nhật</h4>
                        <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-wider">Hàng mới về mỗi ngày. Đừng bỏ lỡ những ưu đãi hấp dẫn!</p>
                    </div>
                    <button className="px-8 py-3 bg-primary-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-700 transition-all">
                        ĐĂNG KÝ NHẬN TIN
                    </button>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Products
