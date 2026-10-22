'use client'

import { useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Package, MapPin, Calendar, ArrowLeft, Truck, Download, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { useOrder } from '@/hooks/useOrder'
import { OrderStatus } from '@/types'
import { formatPrice, priceBreakdown } from '@/lib/utils'

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Order placed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const formatDateTime = (date: Date | string) =>
  new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export default function OrderDetailsPage() {
  const { user } = useAuth()
  const params = useParams<{ id: string }>()
  const { order, isLoading } = useOrder(params.id)
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)
  const trackingRef = useRef<HTMLDivElement>(null)

  if (isLoading) {
    return (
      <div>
        <Loading text="Loading order details..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div>
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

  if (!order) {
    return (
      <div>
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

  const { subtotal, tax, total } = priceBreakdown(Number(order.total))
  const isDelivered = order.status === 'DELIVERED'
  // The order creation is the first event; later ones come from the status history
  const trackingEvents = [
    { id: 'placed', label: STATUS_LABELS.PENDING, date: order.createdAt },
    ...(order.statusHistory ?? []).map((event) => ({ id: event.id, label: STATUS_LABELS[event.status], date: event.changedAt })),
  ]

  const toggleTracking = () => {
    setIsTrackingOpen(!isTrackingOpen)
    if (!isTrackingOpen) {
      trackingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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
          <div ref={trackingRef} className="bg-white rounded-lg shadow-sm border p-6 mb-8 scroll-mt-32">
            <h2 className="text-xl font-bold mb-6">Order Tracking</h2>
            {order.status !== 'CANCELLED' && (
              <div className="flex items-center justify-between">
                {getStatusSteps().map((step, index) => (
                  <div key={step.key} className="relative flex flex-col items-center flex-1">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                      step.completed
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : step.active
                          ? 'bg-white border-primary-600 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${
                      step.completed || step.active ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    {index < getStatusSteps().length - 1 && (
                      <div className={`absolute h-0.5 w-full top-6 left-1/2 ${
                        step.completed ? 'bg-primary-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(isTrackingOpen || order.status === 'CANCELLED') && (
              <ol className={`space-y-4 ${order.status === 'CANCELLED' ? '' : 'mt-8 border-t pt-6'}`} aria-label="Tracking history">
                {trackingEvents.map((event, index) => (
                  <li key={event.id} className="flex items-start gap-4">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${index === trackingEvents.length - 1 ? 'bg-brand-600' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-medium">{event.label}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(event.date)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div id="order-items" className="lg:col-span-2 scroll-mt-32">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Order Items</h2>
                </div>
                <div className="divide-y">
                  {order.items?.map((item) => (
                    <div key={item.id} className="p-6 flex items-center space-x-4">
                      <Link href={`/products/${item.productId}`} className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
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
                      </Link>

                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg">
                          <Link href={`/products/${item.productId}`} className="hover:underline underline-offset-4">
                            {item.product?.name || 'Unknown Product'}
                          </Link>
                        </h3>
                        <p className="text-gray-600">
                          {formatPrice(Number(item.price))} × {item.quantity}
                        </p>
                        {item.product?.category && (
                          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mt-1">
                            {item.product.category.name}
                          </span>
                        )}
                        {isDelivered && (
                          <Link
                            href={`/products/${item.productId}#reviews`}
                            className="mt-2 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                          >
                            <Star className="h-4 w-4" />
                            Write a review
                          </Link>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatPrice(Number(item.price) * item.quantity)}
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
                <Button variant="outline" className="w-full" onClick={toggleTracking} aria-expanded={isTrackingOpen}>
                  <Truck className="w-4 h-4 mr-2" />
                  {isTrackingOpen ? 'Hide tracking history' : 'Track Package'}
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/orders/${order.id}/invoice?print=1`} target="_blank">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Link>
                </Button>
                {isDelivered && (
                  <Button className="w-full" asChild>
                    <Link href="#order-items">Leave a Review</Link>
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