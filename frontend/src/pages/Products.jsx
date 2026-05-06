import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Filter, SlidersHorizontal, ChevronDown, Check, X, RotateCcw, Home, ChevronRight } from 'lucide-react'
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

  // Calculate Active Filter Chips
  const activeChips = useMemo(() => {
    const chips = []
    if (currentCategory) {
      const cat = categories.find(c => c.slug === currentCategory)
      if (cat) chips.push({ label: cat.name, type: 'category' })
    }
    if (currentBrand) {
      const brand = brands.find(b => b.slug === currentBrand)
      if (brand) chips.push({ label: brand.name, type: 'brand' })
    }
    if (currentMinPrice || currentMaxPrice) {
      const opt = PRICE_OPTIONS.find(o => o.min === currentMinPrice && o.max === currentMaxPrice)
      if (opt) chips.push({ label: opt.label, type: 'price' })
      else chips.push({ label: `${currentMinPrice || 0} - ${currentMaxPrice || 'Max'}`, type: 'price' })
    }
    if (searchParams.get('search')) {
      chips.push({ label: `"${searchParams.get('search')}"`, type: 'search' })
    }
    return chips
  }, [currentCategory, currentBrand, currentMinPrice, currentMaxPrice, categories, brands, searchParams])

  const removeChip = (type) => {
    if (type === 'price') updateParams({ minPrice: '', maxPrice: '' })
    else if (type === 'search') {
      setSearchTerm('')
      updateParams({ search: '' })
    }
    else updateParams({ [type]: '' })
  }

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">Bộ lọc</h3>
          </div>
          <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-900">
             <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-none pb-20">
          <div className="border-b border-gray-100 dark:border-dark-border last:border-0 pb-4 mb-4">
            <button onClick={() => toggleSection('category')} className="flex items-center justify-between w-full py-2 mb-2 group">
              <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-[0.15em]">Danh mục</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSections.category ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-3 overflow-hidden transition-all duration-300 ${openSections.category ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${!currentCategory ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 dark:border-gray-700 text-transparent group-hover:border-primary-400'}`}>
                  <Check className="w-3 h-3 stroke-[4]" />
                </div>
                <span className={`text-sm font-bold ${!currentCategory ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>Tất cả</span>
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

          <div className="border-b border-gray-100 dark:border-dark-border last:border-0 pb-4 mb-4">
            <button onClick={() => toggleSection('brand')} className="flex items-center justify-between w-full py-2 mb-2 group">
              <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-[0.15em]">Thương hiệu</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSections.brand ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-4 overflow-hidden transition-all duration-300 ${openSections.brand ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="Tìm kiếm..." value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20" />
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
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100 dark:border-dark-border last:border-0 pb-4">
            <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full py-2 mb-2 group">
              <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-[0.15em]">Khoảng giá</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-5 overflow-hidden transition-all duration-300 ${openSections.price ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((opt, idx) => {
                   const isActive = currentMinPrice === opt.min && currentMaxPrice === opt.max;
                   return (
                    <button key={idx} onClick={() => handlePriceChange(opt.min, opt.max)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${isActive ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/20' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary-400'}`}>
                      {opt.label}
                    </button>
                   )
                })}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Từ</span>
                      <input type="number" value={tempPrice.min} onChange={(e) => setTempPrice(prev => ({ ...prev, min: e.target.value }))} className="w-full pl-8 pr-2 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="0" />
                   </div>
                   <div className="w-2 h-[2px] bg-gray-300"></div>
                   <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Đến</span>
                      <input type="number" value={tempPrice.max} onChange={(e) => setTempPrice(prev => ({ ...prev, max: e.target.value }))} className="w-full pl-9 pr-2 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="MAX" />
                   </div>
                </div>
                <button onClick={() => updateParams({ minPrice: tempPrice.min, maxPrice: tempPrice.max })} className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95 shadow-xl shadow-black/10">
                  ÁP DỤNG
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pt-6 pb-2 bg-gradient-to-t from-white via-white dark:from-dark-card dark:via-dark-card to-transparent grid grid-cols-2 gap-3 px-1">
            <button onClick={clearFilters} className="flex items-center justify-center gap-2 py-3.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">
              <RotateCcw className="w-3.5 h-3.5" />
              XÓA LỌC
            </button>
            <button onClick={() => setIsMobileFilterOpen(false)} className="flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        
        {/* Premium Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
           <Link to="/" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
           </Link>
           <ChevronRight className="w-3.5 h-3.5" />
           <span className="text-gray-900 dark:text-white">Cửa hàng</span>
        </nav>

        {/* Header Section */}
        <div className="mb-10 sm:mb-16">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-600/10 text-primary-600 text-[10px] font-black uppercase tracking-[0.25em] mb-4">
              Premium Technology
           </div>
           <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none mb-6">
             KHÁM PHÁ <span className="text-primary-600">SẢN PHẨM</span>
           </h1>
           <p className="max-w-2xl text-[14px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
             Tận hưởng tinh hoa công nghệ với bộ sưu tập các thiết bị hàng đầu thế giới, 
             từ những chiếc Laptop Gaming mạnh mẽ đến Smartphone thời thượng.
           </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <div className="sticky top-28 bg-white dark:bg-dark-card rounded-[2.5rem] p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100/50 dark:border-dark-border">
                <FilterSidebar />
             </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            
            {/* Filter Chips Bar */}
            {(activeChips.length > 0 || products.length > 0) && (
              <div className="mb-6 flex overflow-x-auto scrollbar-none sm:flex-wrap items-center gap-2 sm:gap-3 pb-2 sm:pb-0">
                 {activeChips.map((chip, idx) => (
                    <button key={idx} onClick={() => removeChip(chip.type)} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-[10px] sm:text-[11px] font-bold text-gray-900 dark:text-white hover:border-red-500 hover:text-red-600 transition-all group shadow-sm whitespace-nowrap">
                       <span>{chip.label}</span>
                       <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 group-hover:text-red-500" />
                    </button>
                 ))}
                 {activeChips.length > 0 && (
                    <button onClick={clearFilters} className="text-[10px] font-black text-gray-400 hover:text-primary-600 uppercase tracking-widest ml-2 underline underline-offset-4 whitespace-nowrap">Xóa tất cả</button>
                 )}
                 <div className="ml-auto text-[11px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
                    Hiển thị <span className="text-gray-900 dark:text-white">{products.length}</span> kết quả
                 </div>
              </div>
            )}

            {/* Top Bar (Search & Sort) - Glassmorphism style */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-10 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl p-3 sm:p-5 rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-white dark:border-white/5 items-stretch sm:items-center justify-between">
               
               <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto flex-1">
                 <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden h-[48px] sm:h-[56px] px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gray-900 text-white flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-black/10 shrink-0">
                   <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                   <span>LỌC</span>
                   {activeChips.length > 0 && (
                     <span className="bg-primary-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{activeChips.length}</span>
                   )}
                 </button>

                 <form onSubmit={handleSearch} className="relative flex-1 group">
                    <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm..." className="w-full h-[48px] sm:h-[56px] bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-primary-600/20 rounded-xl sm:rounded-2xl pl-12 sm:pl-14 pr-4 text-xs sm:text-sm font-bold outline-none transition-all dark:text-white placeholder:text-gray-400" />
                 </form>
               </div>

               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <div className="relative w-full sm:w-60">
                    <select value={currentSort} onChange={(e) => updateParams({ sort: e.target.value })} className="w-full h-[48px] sm:h-[56px] appearance-none bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-primary-600/20 rounded-xl sm:rounded-2xl pl-5 sm:pl-6 pr-10 sm:pr-12 text-[10px] sm:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest outline-none transition-all cursor-pointer">
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary-600 pointer-events-none" />
                 </div>
               </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                {[...Array(9)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-10">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 sm:mt-20 flex justify-center gap-2 sm:gap-4">
                    <button onClick={() => handlePageChange(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-gray-400 flex items-center justify-center hover:bg-primary-600 hover:text-white disabled:opacity-30 transition-all shadow-md shadow-black/[0.02]">
                      <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 rotate-90" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) pageNum = i
                      else if (currentPage < 3) pageNum = i
                      else if (currentPage > totalPages - 3) pageNum = totalPages - 5 + i
                      else pageNum = currentPage - 2 + i

                      return (
                        <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl text-[12px] sm:text-[13px] font-black transition-all ${currentPage === pageNum ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/30 scale-105 sm:scale-110' : 'bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 shadow-md shadow-black/[0.02]'}`}>
                          {String(pageNum + 1).padStart(2, '0')}
                        </button>
                      )
                    })}
                    <button onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1} className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-gray-400 flex items-center justify-center hover:bg-primary-600 hover:text-white disabled:opacity-30 transition-all shadow-md shadow-black/[0.02]">
                      <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 -rotate-90" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-dark-card rounded-[3.5rem] border border-gray-100 dark:border-dark-border shadow-2xl shadow-black/[0.01] text-center px-10">
                <div className="w-28 h-28 bg-primary-600/5 rounded-full flex items-center justify-center mb-10">
                   <Search className="w-14 h-14 text-primary-600/20" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">KHÔNG CÓ KẾT QUẢ PHÙ HỢP</h3>
                <p className="text-[15px] font-bold text-gray-400 max-w-sm leading-relaxed uppercase tracking-widest mb-12">Hãy thử thay đổi tiêu chí lọc hoặc tìm kiếm để tìm thấy sản phẩm ưng ý.</p>
                <button onClick={clearFilters} className="px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-black/20">
                  LÀM MỚI BỘ LỌC
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Products
