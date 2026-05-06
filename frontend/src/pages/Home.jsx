import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../store/slices/productsSlice'
import { fetchPersonalizedRecommendations, fetchTrendingProducts } from '../store/slices/recommendationsSlice'
import { Smartphone, Laptop, Headphones, Watch, Tablet, LayoutGrid, ChevronRight, Zap, Star, ShieldCheck, Award } from 'lucide-react'
import { categoriesAPI } from '../api/categories'
import { productsAPI } from '../api/products'
import HeroBanner from '../components/home/HeroBanner'
import ProductCard from '../components/ProductCard'
import { getProductImageSources, handleProductImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/productImageFallback'

const Home = () => {
  const dispatch = useDispatch()
  const { products, isLoading } = useSelector((state) => state.products)
  const { user } = useSelector((state) => state.auth)
  const [categories, setCategories] = useState([])
  const [bestSellers, setBestSellers] = useState([])

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 12 }))
    dispatch(fetchTrendingProducts(8))
    
    // Fetch categories with fallback
    categoriesAPI.getAll().then(res => {
      const apiCats = (res.data?.result || []).filter(c => c.active)
      if (apiCats.length > 0) {
        setCategories(apiCats.slice(0, 10))
      } else {
        setCategories([
          { id: 'f1', name: 'Điện thoại', slug: 'dien-thoai', active: true },
          { id: 'f2', name: 'Laptop', slug: 'laptop', active: true },
          { id: 'f3', name: 'Máy tính bảng', slug: 'tablet', active: true },
          { id: 'f4', name: 'Phụ kiện', slug: 'phu-kien', active: true },
          { id: 'f5', name: 'Đồng hồ', slug: 'dong-ho', active: true },
          { id: 'f6', name: 'Điện tử', slug: 'dien-tu', active: true },
        ])
      }
    }).catch(() => {
      setCategories([
        { id: 'f1', name: 'Điện thoại', slug: 'dien-thoai', active: true },
        { id: 'f2', name: 'Laptop', slug: 'laptop', active: true },
        { id: 'f3', name: 'Máy tính bảng', slug: 'tablet', active: true },
        { id: 'f4', name: 'Phụ kiện', slug: 'phu-kien', active: true },
        { id: 'f5', name: 'Đồng hồ', slug: 'dong-ho', active: true },
        { id: 'f6', name: 'Điện tử', slug: 'dien-tu', active: true },
      ])
    })

    // Fetch best sellers
    productsAPI.getAll({ page: 0, size: 8 }).then(res => {
      setBestSellers(res.data?.result?.content || [])
    })
  }, [dispatch])

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'dien-thoai': return Smartphone
      case 'laptop': return Laptop
      case 'tablet': return Tablet
      case 'phu-kien': return Headphones
      case 'dong-ho': return Watch
      default: return LayoutGrid
    }
  }

  const getCategoryImage = (slug) => {
    const images = {
      'dien-thoai': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400',
      'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400',
      'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400',
      'phu-kien': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
      'dong-ho': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
      'dien-tu': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400'
    }
    return images[slug] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400'
  }

  return (
    <div className="space-y-12 sm:space-y-24 pb-12 sm:pb-24 bg-[#F8F9FA] dark:bg-dark-bg transition-colors duration-500">
      {/* Hero Section */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <HeroBanner />
      </div>

      {/* Trust Indicators */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-4 p-6 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
             <div className="w-12 h-12 rounded-2xl bg-primary-600/10 flex items-center justify-center text-primary-600">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cam kết</p>
                <p className="text-sm font-black dark:text-white uppercase tracking-tight">Chính hãng 100%</p>
             </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
             <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                <Zap className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vận chuyển</p>
                <p className="text-sm font-black dark:text-white uppercase tracking-tight">Giao nhanh 2h</p>
             </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
             <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                <Award className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bảo hành</p>
                <p className="text-sm font-black dark:text-white uppercase tracking-tight">Lỗi 1 đổi 1</p>
             </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
             <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-600">
                <Star className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Đánh giá</p>
                <p className="text-sm font-black dark:text-white uppercase tracking-tight">4.9/5 Sao</p>
             </div>
          </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              DANH <span className="text-primary-600">MỤC</span>
            </h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-2 italic">Tech Store Collection</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-all">
            XEM TẤT CẢ <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-8">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug)
            const catImg = cat.imageUrl || getCategoryImage(cat.slug)
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative h-48 sm:h-80 rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-primary-600/20 hover:scale-[1.03] transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gray-900" />
                <img 
                  src={catImg} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                   <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white group-hover:bg-primary-600 group-hover:border-primary-500 transition-all">
                     <Icon className="h-5 w-5" />
                   </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-center sm:text-left">
                  <span className="font-black text-white text-lg sm:text-xl uppercase tracking-wider leading-none block mb-2 drop-shadow-lg">
                    {cat.name}
                  </span>
                  <div className="h-1.5 w-0 bg-primary-600 rounded-full group-hover:w-full transition-all duration-500" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white dark:bg-dark-card rounded-[3rem] p-8 sm:p-16 shadow-2xl shadow-primary-600/10 border border-gray-100 dark:border-dark-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-primary-600/30">
                <Zap className="h-4 w-4 fill-current" />
                FLASH SALE ĐANG CHÁY
              </div>
              <h2 className="text-5xl sm:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-[0.8] italic">
                SIÊU <span className="text-primary-600 not-italic">ƯU ĐÃI</span>
              </h2>
              
              <div className="flex gap-4 justify-center lg:justify-start">
                {[
                  { v: '02', l: 'GIỜ' },
                  { v: '45', l: 'PHÚT' },
                  { v: '12', l: 'GIÂY' }
                ].map((t, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-900 dark:bg-dark-bg text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">
                      {t.v}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 mt-2 tracking-widest">{t.l}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link to="/products?filter=flash-sale" className="group inline-flex items-center gap-3 text-xs font-black text-primary-600 uppercase tracking-widest hover:gap-5 transition-all">
                  XEM TẤT CẢ SẢN PHẨM FLASH SALE
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(bestSellers.slice(0, 2)).map(product => {
                  const price = product.price || product.variants?.[0]?.price || 0;
                  const { primary: imageUrl } = getProductImageSources(product);
                  return (
                    <Link 
                      key={product.id} 
                      to={`/${product.slug}`}
                      className="bg-gray-50 dark:bg-black/20 rounded-[2.5rem] p-6 flex gap-6 items-center hover:bg-white dark:hover:bg-white/5 transition-all border border-transparent hover:border-primary-500 shadow-sm hover:shadow-2xl group"
                    >
                       <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 relative bg-white dark:bg-dark-bg rounded-3xl overflow-hidden p-4 border border-gray-100 dark:border-white/5">
                          <img 
                            src={imageUrl || DEFAULT_PRODUCT_PLACEHOLDER} 
                            alt={product.name} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                             -35%
                          </div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2 uppercase tracking-tight">
                             {product.name}
                          </h3>
                          <div className="flex flex-col">
                             <span className="text-xl font-black text-primary-600 tracking-tighter">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 0.65)}
                             </span>
                             <span className="text-[10px] text-gray-400 line-through font-bold opacity-60">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                             </span>
                          </div>
                       </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              BÁN <span className="text-primary-600">CHẠY</span>
            </h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-2 italic">Những lựa chọn hàng đầu</p>
          </div>
          <Link to="/products?sort=soldCount,desc" className="group flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-all">
            XEM TẤT CẢ <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-primary-600 rounded-[3rem] p-8 sm:p-20 text-white relative overflow-hidden group shadow-2xl shadow-primary-600/30">
          <div className="relative z-10 max-w-2xl text-center sm:text-left">
            <span className="text-primary-100 font-black tracking-[0.3em] uppercase text-xs sm:text-sm italic">Sự kiện đặc biệt tháng 5</span>
            <h2 className="text-4xl sm:text-7xl font-black mt-6 mb-8 leading-[0.9] tracking-tighter uppercase">NÂNG CẤP ĐỜI MÁY <br/><span className="text-white/40">TRỢ GIÁ 2 TRIỆU</span></h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-primary-600 px-10 py-5 rounded-2xl font-black hover:bg-gray-100 transition-all shadow-xl text-xs uppercase tracking-widest active:scale-95">
                Đăng ký thu cũ đổi mới
              </button>
              <Link to="/products" className="inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-white/30 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                Xem bảng giá
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-l from-primary-600 to-transparent z-10" />
             <img 
               src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800" 
               alt="Promotion"
               className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-[2000ms]"
             />
          </div>
        </div>
      </section>

      {/* Recommended Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">DÀNH RIÊNG CHO BẠN</h2>
          <div className="h-[2px] flex-1 bg-gray-100 dark:bg-white/5"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-8">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/products" className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:bg-black dark:hover:bg-gray-200 transition-all shadow-2xl text-[11px] uppercase tracking-[0.2em]">
            KHÁM PHÁ TOÀN BỘ SẢN PHẨM
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
