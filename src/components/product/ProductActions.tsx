'use client'

import { useState } from 'react'
import { ShoppingCart, Share2, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WishlistButton } from './WishlistButton'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Product } from '@/types'
import toast from 'react-hot-toast'

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, loading } = useCart()
  const { user } = useAuth()

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }
    await addToCart(product, quantity)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Product link copied to clipboard')
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="h-10 w-10 rounded-r-none"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-16 text-center py-2 font-semibold">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock}
            className="h-10 w-10 rounded-l-none"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-gray-500">
          ({product.stock} available)
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || loading}
          className="flex-1"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {loading ? 'Adding...' : 'Add to Cart'}
        </Button>
        
        <WishlistButton productId={product.id} />
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleShare}
          className="w-14"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Stock Warning */}
      {product.stock > 0 && product.stock <= 5 && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <p className="text-orange-800 text-sm font-medium">
            ⚠️ Only {product.stock} left in stock - order soon!
          </p>
        </div>
      )}

      {/* Out of Stock */}
      {product.stock === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm font-medium">
            😔 This item is currently out of stock
          </p>
        </div>
      )}

      {/* Total Price */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Total:</span>
          <span className="text-2xl font-bold text-primary-600">
            ${(Number(product.price) * quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}