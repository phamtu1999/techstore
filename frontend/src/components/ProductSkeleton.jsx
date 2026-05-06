const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-[1.5rem] overflow-hidden border border-gray-100 dark:border-dark-border h-full flex flex-col shadow-sm">
      {/* Image skeleton with shimmer effect */}
      <div className="aspect-square w-full relative overflow-hidden bg-gray-50 dark:bg-white/5">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-lg bg-gray-100 dark:bg-white/5 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
          </div>
          <div className="h-4 w-2/3 rounded-lg bg-gray-100 dark:bg-white/5 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
          </div>
        </div>
        
        {/* Rating/Sold skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-1/3 rounded-lg bg-gray-50 dark:bg-white/5 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
          </div>
        </div>
        
        {/* Price skeleton */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="h-6 w-1/2 rounded-lg bg-gray-100 dark:bg-white/5 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
            </div>
            <div className="flex-1 h-10 rounded-xl bg-gray-100 dark:bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductSkeleton
