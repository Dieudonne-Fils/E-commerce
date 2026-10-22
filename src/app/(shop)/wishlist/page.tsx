'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/product/ProductCard'
import { useAuth } from '@/contexts/AuthContext'
import { WishlistItem } from '@/types'

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user, token } = useAuth()

  useEffect(() => {
    if (user && token) {
      fetchWishlist()
    } else {
      setLoading(false)
    }
  }, [user, token])

  const fetchWishlist = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Heart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist</p>
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="w-8 h-8 mr-3 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save products you love for easy access later</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              item.product && (
                <ProductCard 
                  key={item.id} 
                  product={item.product} 
                />
              )
            ))}
          </div>
        )}
      </main>
    </div>
  )
}