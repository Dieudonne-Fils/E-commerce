'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface WishlistButtonProps {
  productId: string
  size?: 'sm' | 'md' | 'lg'
}

export function WishlistButton({ productId, size = 'lg' }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    if (user && token) {
      checkWishlistStatus()
    }
  }, [user, token, productId])

  const checkWishlistStatus = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const isInList = data.items.some((item: any) => item.productId === productId)
        setIsInWishlist(isInList)
      }
    } catch (error) {
      console.error('Failed to check wishlist status:', error)
    }
  }

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist')
      return
    }

    setLoading(true)

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsInWishlist(false)
          toast.success('Removed from wishlist')
        } else {
          toast.error('Failed to remove from wishlist')
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        })

        if (response.ok) {
          setIsInWishlist(true)
          toast.success('Added to wishlist')
        } else {
          const data = await response.json()
          toast.error(data.error || 'Failed to add to wishlist')
        }
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleWishlist}
      disabled={loading}
      className={`w-14 ${isInWishlist ? 'text-red-600 border-red-300 hover:bg-red-50' : ''}`}
    >
      <Heart 
        className={`h-5 w-5 ${isInWishlist ? 'fill-red-600' : ''}`} 
      />
    </Button>
  )
}