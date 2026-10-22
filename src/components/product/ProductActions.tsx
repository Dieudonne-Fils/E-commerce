'use client'

import { useState } from 'react'
import { Minus, Plus, Share2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WishlistButton } from './WishlistButton'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, loading } = useCart()
  const { user } = useAuth()
  const isSoldOut = product.stock === 0

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
      <div className="flex flex-wrap items-center gap-3">
        {!isSoldOut && (
          <div className="flex h-12 items-center rounded-full border border-input bg-white">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-12 w-11 items-center justify-center rounded-l-full hover:bg-secondary disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
              className="flex h-12 w-11 items-center justify-center rounded-r-full hover:bg-secondary disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={isSoldOut || loading}
          size="lg"
          className="min-w-[12rem] flex-1"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {isSoldOut ? 'Sold out' : loading ? 'Adding...' : 'Add to cart'}
        </Button>

        <div className="flex gap-3">
          <WishlistButton productId={product.id} />
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label="Share this product"
            className="h-12 w-12"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {quantity > 1 && (
        <p className="text-sm text-muted-foreground">
          Total for {quantity}: <span className="font-semibold text-foreground">{formatPrice(product.price * quantity)}</span>
        </p>
      )}
    </div>
  )
}