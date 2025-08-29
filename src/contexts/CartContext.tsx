'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem, Product } from '@/types'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { token, user } = useAuth()

  useEffect(() => {
    if (user && token) {
      fetchCart()
    } else {
      setItems([])
    }
  }, [user, token])

  const fetchCart = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    }
  }

  const addToCart = async (product: Product, quantity = 1) => {
    if (!token) {
      toast.error('Please login to add items to cart')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      })

      if (response.ok) {
        await fetchCart()
        toast.success('Item added to cart')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add item to cart')
      }
    } catch (error) {
      toast.error('Failed to add item to cart')
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId))
        toast.success('Item removed from cart')
      } else {
        toast.error('Failed to remove item from cart')
      }
    } catch (error) {
      toast.error('Failed to remove item from cart')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!token || quantity < 1) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      })

      if (response.ok) {
        await fetchCart()
        toast.success('Cart updated')
      } else {
        toast.error('Failed to update cart')
      }
    } catch (error) {
      toast.error('Failed to update cart')
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    if (!token) return

    setLoading(true)
    try {
      await Promise.all(
        items.map(item => 
          fetch(`/api/cart/${item.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      )
      setItems([])
      toast.success('Cart cleared')
    } catch (error) {
      toast.error('Failed to clear cart')
    } finally {
      setLoading(false)
    }
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.product ? Number(item.product.price) * item.quantity : 0)
    }, 0)
  }

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      loading
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}