import { useState, useEffect, useRef } from 'react'
import { DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/productImageFallback'

const LazyImage = ({ src, alt, className, fallback }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    setIsLoaded(false)
  }, [src])

  useEffect(() => {
    if (!imgRef.current) return

    if (!('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '80px',
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [src])

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {/* Skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            const canUseFallback =
              fallback &&
              e.currentTarget.dataset.fallbackApplied !== 'true' &&
              e.currentTarget.src !== fallback

            if (canUseFallback) {
              e.currentTarget.dataset.fallbackApplied = 'true'
              e.currentTarget.src = fallback
              return
            }

            e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER
            setIsLoaded(true)
          }}
        />
      )}
    </div>
  )
}

export default LazyImage
