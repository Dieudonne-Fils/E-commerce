'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Loader2, Plus, Star } from 'lucide-react'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { cn, formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  // Local state: the cart context loading flag is shared by every card on the page
  const [isAdding, setIsAdding] = useState(false)

  const href = `/products/${product.id}`
  const isSoldOut = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = async () => {
    setIsAdding(true)
    await addToCart(product, 1)
    setIsAdding(false)
  }

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
              className={cn('object-cover transition-transform duration-500 group-hover:scale-105', isSoldOut && 'opacity-60')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
          )}
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {isSoldOut && (
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium">Sold out</span>
          )}
          {isLowStock && (
            <span className="rounded-full bg-clay-600 px-2.5 py-1 text-xs font-medium text-white">Only {product.stock} left</span>
          )}
          {product.featured && !isSoldOut && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium">Bestseller</span>
          )}
        </div>

        {!isSoldOut && (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-md transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-70"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="mt-3 space-y-1">
        {product.category && (
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.category.name}</p>
        )}
        <h3 className="font-medium leading-snug line-clamp-2">
          <Link href={href} className="hover:underline underline-offset-4">
            {product.name}
          </Link>
        </h3>
        {product.reviewCount > 0 && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-clay-500 text-clay-500" aria-hidden="true" />
            <span className="font-medium text-foreground">{product.averageRating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </p>
        )}
        <p className="font-semibold">{formatPrice(product.price)}</p>
      </div>
    </article>
  )
}