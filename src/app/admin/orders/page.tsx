'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, Package, Truck, CheckCircle, XCircle, Clock, Filter, Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AnimatedElement } from '@/components/ui/AnimatedComponents'
import { useAuth } from '@/contexts/AuthContext'
import { Order, OrderStatus } from '@/types'
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

export default function AdminOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'newest'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [filters, pagination.page])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy
      })

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`Order status updated to ${statusConfig[newStatus].label}`)
        fetchOrders() // Refresh orders
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update order status')
      }
    } catch (error) {
      toast.error('Failed to update order status')
    } finally {
      setUpdating(null)
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

  const exportOrders = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        format: 'csv'
      })

      const response = await fetch(`/api/admin/orders/export?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Orders exported successfully')
      } else {
        toast.error('Failed to export orders')
      }
    } catch (error) {
      toast.error('Failed to export orders')
    }
  }

  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <AnimatedElement animation="slide-right" className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="ghost" className="mr-4" asChild>
                <Link href="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600">Manage and track all customer orders</p>
              </div>
            </div>
            
            <Button onClick={exportOrders} variant="outline" className="hover-lift">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </AnimatedElement>

          {/* Filters */}
          <AnimatedElement animation="fade-in" delay={200} className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Value</option>
                  <option value="lowest">Lowest Value</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Showing {orders.length} of {pagination.total} orders</span>
              </div>
            </div>
          </AnimatedElement>

          {/* Orders Table */}
          <AnimatedElement animation="slide-up" delay={300} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">No orders match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const config = statusConfig[order.status]
                      const StatusIcon = config.icon
                      const nextStatus = getNextStatus(order.status)
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900">
                                #{order.id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order?.items?.length || 0} item(s)
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.user?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.user?.email || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={config.badge as any}
                              className={`inline-flex items-center ${config.color}`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                            {formatPrice(Number(order.total))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button variant="outline" size="sm">
                              <Link href={`/admin/orders/${order.id}`}> 
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Link>
                            </Button>
                            
                            {nextStatus && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, nextStatus)}
                                disabled={updating === order.id}
                                className="hover-glow"
                              >
                                {updating === order.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                                ) : (
                                  <Package className="w-3 h-3 mr-1" />
                                )}
                                {statusConfig[nextStatus].label}
                              </Button>
                            )}
                            
                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                disabled={updating === order.id}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatedElement>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <AnimatedElement animation="fade-in" delay={500} className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {[...Array(Math.min(5, pagination.pages))].map((_, index) => {
                  const pageNum = index + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </AnimatedElement>
          )}
        </div>
      </main>
    </div>
  )
}