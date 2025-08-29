'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Package, MapPin, Calendar, ArrowLeft, Truck } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { Order } from '@/types'

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, token } = useAuth()
  const params = useParams()

  useEffect(() => {
    if (user && token && params.id) {
      fetchOrder(params.id as string)
    }
  }, [user, token, params.id])

  const fetchOrder = async (orderId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const orderData = await response.json()
        setOrder(orderData)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
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
            <Package className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view order details</p>
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
        <Header />
        <Loading text="Loading order details..." />
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Package className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist</p>
            <Button asChild>
              <Link href="/profile">View All Orders</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusSteps = () => {
    const steps = [
      { key: 'PENDING', label: 'Order Placed', icon: Package },
      { key: 'PROCESSING', label: 'Processing', icon: Package },
      { key: 'SHIPPED', label: 'Shipped', icon: Truck },
      { key: 'DELIVERED', label: 'Delivered', icon: Package },
    ]

    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    const currentIndex = statusOrder.indexOf(order.status)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/profile">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.id.slice(-8)}
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Status Tracking */}
          {order.status !== 'CANCELLED' && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Order Tracking</h2>
              <div className="flex items-center justify-between">
                {getStatusSteps().map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                      step.completed 
                        ? 'bg-primary-600 border-primary-600 text-white' 
                        : step.active
                          ? 'border-primary-600 text-primary-600'
                          : 'border-gray-300 text-gray-400'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${
                      step.completed || step.active ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    {index < getStatusSteps().length - 1 && (
                      <div className={`absolute h-0.5 w-full top-6 left-1/2 transform translate-x-1/2 ${
                        step.completed ? 'bg-primary-600' : 'bg-gray-300'
                      }`} style={{ zIndex: -1 }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Order Items</h2>
                </div>
                <div className="divide-y">
                  {order.items?.map((item) => (
                    <div key={item.id} className="p-6 flex items-center space-x-4">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name || 'Product'}
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
                          {item.product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-gray-600">
                          ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                        {item.product?.category && (
                          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mt-1">
                            {item.product.category.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary & Shipping */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(Number(order.total) * 0.1).toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(Number(order.total) * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {order.shippingAddress}
                </p>
              </div>

              {/* Order Actions */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Track Package
                </Button>
                <Button variant="outline" className="w-full">
                  Download Invoice
                </Button>
                {order.status === 'DELIVERED' && (
                  <Button className="w-full">
                    Leave a Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}