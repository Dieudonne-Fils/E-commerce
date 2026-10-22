'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Order } from '@/types'
import { Package, User, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, priceBreakdown } from '@/lib/utils'

export default function ProfilePage() {
  const { user, token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && token) {
      fetchOrders()
    }
  }, [user, token])

  const fetchOrders = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <User className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your profile</p>
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name || 'User'}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <Button variant="outline">
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Order History
              </h2>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.id.slice(-8)}</h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{formatPrice(priceBreakdown(Number(order.total)).total)}</div>
                        <div className="text-sm text-gray-600">
                          {order.items?.length || 0} item(s)
                        </div>
                      </div>
                    </div>

                    {order.shippingAddress && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {order.shippingAddress}
                      </div>
                    )}

                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Items:</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span className="text-sm">
                                {item.product?.name} × {item.quantity}
                              </span>
                              <span className="text-sm font-medium">
                                {formatPrice(Number(item.price) * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}