'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, User, MapPin, CreditCard, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AnimatedElement } from '@/components/ui/AnimatedComponents'
import { useAuth } from '@/contexts/AuthContext'
import { Order, OrderStatus, OrderStatusHistory } from '@/types'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

const statusConfig = {
  PENDING: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock,
    badge: 'secondary'
  },
  PROCESSING: { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-800', 
    icon: Package,
    badge: 'default'
  },
  SHIPPED: { 
    label: 'Shipped', 
    color: 'bg-purple-100 text-purple-800', 
    icon: Truck,
    badge: 'default'
  },
  DELIVERED: { 
    label: 'Delivered', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle,
    badge: 'default'
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle,
    badge: 'destructive'
  },
} as const

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const { token } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      const [orderResponse, historyResponse] = await Promise.all([
        fetch(`/api/admin/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`/api/admin/orders/${params.id}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ])

      if (orderResponse.ok) {
        const orderData = await orderResponse.json()
        setOrder(orderData.order)
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setStatusHistory(historyData.history || [])
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      toast.error('Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`Order status updated to ${statusConfig[newStatus].label}`)
        fetchOrderDetails() // Refresh order details
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update order status')
      }
    } catch (error) {
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'PENDING':
        return 'PROCESSING'
      case 'PROCESSING':
        return 'SHIPPED'
      case 'SHIPPED':
        return 'DELIVERED'
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The requested order could not be found.</p>
            <Button asChild>
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const config = statusConfig[order.status]
  const StatusIcon = config.icon
  const nextStatus = getNextStatus(order.status)

  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <AnimatedElement animation="slide-right" className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="ghost" asChild className="mr-4">
                <Link href="/admin/orders">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.id.slice(-8)}
                </h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge 
                variant={config.badge as any}
                className={`inline-flex items-center ${config.color}`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </AnimatedElement>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <AnimatedElement animation="fade-in" delay={100} className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{order.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{order.user?.email || 'N/A'}</p>
                  </div>
                </div>
              </AnimatedElement>

              {/* Shipping Address */}
              <AnimatedElement animation="fade-in" delay={200} className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                <p className="text-gray-900 whitespace-pre-line">{order.shippingAddress}</p>
              </AnimatedElement>

              {/* Order Items */}
              <AnimatedElement animation="fade-in" delay={300} className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items ({order.items?.length || 0})
                </h2>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      {item.product?.image && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.product?.name || 'Product not found'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(Number(item.price))}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(Number(item.price) * item.quantity)} total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedElement>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <AnimatedElement animation="slide-left" delay={100} className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({order.items?.length || 0})</span>
                    <span className="font-semibold">{formatPrice(Number(order.total))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-lg text-primary-600">
                        {formatPrice(Number(order.total))}
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedElement>

              {/* Order Actions */}
              <AnimatedElement animation="slide-left" delay={200} className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <div className="space-y-3">
                  {nextStatus && (
                    <Button
                      onClick={() => updateOrderStatus(nextStatus)}
                      disabled={updating}
                      className="w-full hover-glow"
                    >
                      {updating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Package className="w-4 h-4 mr-2" />
                      )}
                      Mark as {statusConfig[nextStatus].label}
                    </Button>
                  )}
                  
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <Button
                      onClick={() => updateOrderStatus('CANCELLED')}
                      disabled={updating}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </AnimatedElement>

              {/* Status History */}
              <AnimatedElement animation="slide-left" delay={300} className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Status History
                </h2>
                <div className="space-y-3">
                  {statusHistory.length > 0 ? (
                    statusHistory.map((history, index) => {
                      const historyConfig = statusConfig[history.status]
                      const HistoryIcon = historyConfig.icon
                      
                      return (
                        <div key={history.id} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${historyConfig.color}`}>
                            <HistoryIcon className="w-3 h-3" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {historyConfig.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(history.changedAt).toLocaleString()}
                            </p>
                            {history.note && (
                              <p className="text-xs text-gray-600 mt-1">
                                {history.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No status history available</p>
                  )}
                </div>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}