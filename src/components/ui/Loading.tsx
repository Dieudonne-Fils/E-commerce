interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50'
    : 'flex flex-col items-center justify-center py-8'

  return (
    <div className={containerClasses}>
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse bg-white shadow-sm">
      <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md mb-4 animate-shimmer"></div>
      <div className="space-y-3">
        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-shimmer"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2 animate-shimmer"></div>
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-8 animate-shimmer"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 animate-shimmer"></div>
        </div>
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 animate-shimmer"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1 animate-shimmer"></div>
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1 animate-shimmer"></div>
        </div>
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 animate-pulse">
      <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-shimmer"></div>
      <div className="space-y-6">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-shimmer"></div>
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2 animate-shimmer"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-4/5 animate-shimmer"></div>
        </div>
        <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
      </div>
    </div>
  )
}