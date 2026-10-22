'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart()
  const { user, token } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'United States',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Please login to place an order')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)
    
    try {
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        toast.success('Order placed successfully!')
        await clearCart()
        router.push(`/orders/${order.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to place order')
      }
    } catch (error) {
      toast.error('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to checkout</p>
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
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Add some items to your cart before checkout</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <Input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Input
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      {item.product?.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(Number(item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <p>• Secure checkout with SSL encryption</p>
                <p>• Free shipping on all orders</p>
                <p>• 30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}