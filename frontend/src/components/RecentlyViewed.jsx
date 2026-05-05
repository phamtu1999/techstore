import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { Eye } from 'lucide-react'

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([])

  useEffect(() => {
    // Get recently viewed products from localStorage
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    setRecentProducts(viewed.slice(0, 4)) // Show max 4 products
  }, [])

  if (recentProducts.length === 0) return null

  return (
    <section className="mb-8 animate-slide-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-xl">
          <Eye className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-secondary-800 tracking-tight">
            SẢN PHẨM <span className="text-purple-600">ĐÃ XEM</span>
          </h2>
          <p className="text-sm text-gray-500">Xem lại những sản phẩm bạn quan tâm</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

// Helper function to add product to recently viewed
export const addToRecentlyViewed = (product) => {
  const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
  
  // Remove if already exists
  const filtered = viewed.filter(p => p.id !== product.id)
  
  // Add to beginning
  const updated = [product, ...filtered].slice(0, 10) // Keep max 10
  
  localStorage.setItem('recentlyViewed', JSON.stringify(updated))
}

export default RecentlyViewed
