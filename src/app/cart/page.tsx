'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice, priceBreakdown } from '@/lib/utils'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal, loading } = useCart()
  const { user } = useAuth()

  if (!user) {
    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 flex items-center space-x-4">
                <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                  {item.product?.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📦
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">
                    {item.product?.name}
                  </h3>
                  <p className="text-gray-600">
                    {formatPrice(Number(item.product?.price))} each
                  </p>
                  {item.product?.category && (
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mt-1">
                      {item.product.category.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={loading || item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={loading || (item.product && item.quantity >= item.product.stock)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {formatPrice(Number(item.product?.price || 0) * item.quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Items ({items.reduce((total, item) => total + item.quantity, 0)})</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(priceBreakdown(getCartTotal()).tax)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(priceBreakdown(getCartTotal()).total)}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>• Free shipping on all orders</p>
                <p>• Secure checkout</p>
                <p>• 30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}