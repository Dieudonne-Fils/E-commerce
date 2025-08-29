'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Product, Order, User } from '@/types'
import { Package, Users, ShoppingCart, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) {
      fetchAdminData()
    }
  }, [user, token])

  const fetchAdminData = async () => {
    if (!token) return

    try {
      // Fetch products
      const productsResponse = await fetch('/api/products')
      const productsData = await productsResponse.json()
      
      // Fetch orders (admin endpoint would be needed for all orders)
      const ordersResponse = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const ordersData = await ordersResponse.json()

      setStats({
        totalProducts: productsData.pagination?.total || 0,
        totalOrders: ordersData.orders?.length || 0,
        totalUsers: 0, // Would need admin endpoint
        totalRevenue: ordersData.orders?.reduce((total: number, order: Order) => 
          total + Number(order.total), 0) || 0,
      })

      setRecentOrders(ordersData.orders?.slice(0, 5) || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
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
            <p className="text-gray-600 mb-6">You need to be logged in to access the admin panel</p>
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (user.role !== 'ADMIN') {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access this page</p>
            <Button asChild>
              <Link href="/">Go Home</Link>
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
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your e-commerce store</p>
            </div>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${stats.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Button asChild className="h-16">
                  <Link href="/admin/products" className="flex flex-col items-center">
                    <Package className="w-6 h-6 mb-1" />
                    Manage Products
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-16">
                  <Link href="/admin/orders" className="flex flex-col items-center">
                    <ShoppingCart className="w-6 h-6 mb-1" />
                    View Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-16">
                  <Link href="/admin/users" className="flex flex-col items-center">
                    <Users className="w-6 h-6 mb-1" />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-16">
                  <Link href="/admin/analytics" className="flex flex-col items-center">
                    <TrendingUp className="w-6 h-6 mb-1" />
                    Analytics
                  </Link>
                </Button>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Recent Orders</h2>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No recent orders
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.id.slice(-8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${Number(order.total).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}