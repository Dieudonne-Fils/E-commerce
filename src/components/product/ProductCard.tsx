'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Product } from '@/types'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, loading } = useCart()

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300 group hover-lift bg-white">
      <div className="aspect-square relative mb-4 bg-gray-100 rounded-md overflow-hidden group-hover:scale-110 transition-transform duration-300">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {product.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center space-x-2">
            <StarRating rating={product.averageRating} size="sm" />
            <span className="text-sm text-gray-500">
              ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(Number(product.price))}
          </span>
          <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          {product.category && (
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
              {product.category.name}
            </span>
          )}
          {product.featured && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              ⭐ Featured
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button asChild className="flex-1" variant="outline">
          <Link href={`/products/${product.id}`}>
            View Details
          </Link>
        </Button>
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock === 0 || loading}
          className="flex-1 hover-glow transition-all duration-300"
        >
          <ShoppingCart className={`h-4 w-4 mr-2 transition-transform duration-200 ${loading ? 'animate-spin' : 'group-hover:animate-bounce'}`} />
          {loading ? 'Adding...' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  )
}