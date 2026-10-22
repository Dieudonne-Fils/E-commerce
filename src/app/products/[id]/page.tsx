import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ProductActions } from '@/components/product/ProductActions'
import { ProductReviews } from '@/components/product/ProductReviews'
import { ProductGallery } from '@/components/product/ProductGallery'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'

async function getProduct(id: string) {
  const response = await fetch(`http://localhost:3000/api/products/${id}`, {
    cache: 'no-store',
  })
  
  if (!response.ok) {
    return null
  }
  
  return response.json()
}

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)
  
  if (!product) {
    notFound()
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div className="space-y-4">
            <ProductGallery 
              images={product.images || (product.image ? [product.image] : [])} 
              productName={product.name}
            />
            
            {/* Additional Product Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {product.reviewCount || 0}
                </div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {product.stock > 0 ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">
                  {product.stock > 0 ? 'Available' : 'Sold Out'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                    {product.category.name}
                  </Badge>
                )}
                {product.featured && (
                  <Badge variant="default" className="bg-gradient-primary text-white">
                    ⭐ Featured
                  </Badge>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <Badge variant="destructive" className="bg-red-100 text-red-700">
                    Only {product.stock} left!
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              {product.reviewCount > 0 && (
                <div className="flex items-center space-x-4">
                  <StarRating rating={product.averageRating} size="lg" />
                  <span className="text-lg text-gray-600">
                    <span className="font-semibold">{product.averageRating.toFixed(1)}</span> out of 5
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-4xl font-bold text-primary-600">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    Free shipping included
                  </div>
                </div>
                <div className={`text-right ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="font-semibold text-lg">
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>
                  {product.stock > 0 && (
                    <div className="text-sm">
                      {product.stock} available
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            {product.description && (
              <div className="p-6 bg-white rounded-xl border">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            )}
            
            {/* Product Actions */}
            <div className="sticky top-4">
              <ProductActions product={product} />
            </div>
            
            {/* Product Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-xl border">
                <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <dt className="text-gray-600 font-medium">Category:</dt>
                    <dd className="font-semibold text-primary-600">
                      {product.category?.name || 'Uncategorized'}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <dt className="text-gray-600 font-medium">Availability:</dt>
                    <dd className={`font-semibold flex items-center gap-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-600 font-medium">Product ID:</dt>
                    <dd className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      #{product.id.slice(0, 8)}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="text-xl font-semibold mb-4 text-blue-900">Shipping & Returns</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      🚚
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Free Shipping</div>
                      <div className="text-sm text-blue-600">On all orders</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      🔄
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">30-Day Returns</div>
                      <div className="text-sm text-blue-600">Hassle-free policy</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      ⚡
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Fast Delivery</div>
                      <div className="text-sm text-blue-600">Ships within 1-2 days</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      🔐
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Secure Packaging</div>
                      <div className="text-sm text-blue-600">Guaranteed protection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Reviews */}
        <div className="mt-16">
          <ProductReviews productId={product.id} />
        </div>
        
        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="text-center text-gray-500 py-8">
            Related products coming soon...
          </div>
        </div>
      </main>
    </div>
  )
}