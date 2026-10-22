'use client'

import Link from 'next/link'
import { BarChart3, Package, Plus, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAdminData } from '@/hooks/useAdminData'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils'

interface AdminStats {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  revenue: number
  recentOrders: Order[]
}

const QUICK_LINKS = [
  { href: '/admin/products', label: 'Manage Products', icon: Package },
  { href: '/admin/orders', label: 'View Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

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

export default function AdminPage() {
  const { data: stats, isLoading, error } = useAdminData<AdminStats>('/api/admin/stats')

  const statCards = stats
    ? [
        { label: 'Total Products', value: stats.totalProducts, icon: Package, tint: 'bg-blue-100 text-blue-600' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, tint: 'bg-green-100 text-green-600' },
        { label: 'Total Users', value: stats.totalUsers, icon: Users, tint: 'bg-purple-100 text-purple-600' },
        { label: 'Revenue (excl. tax)', value: formatPrice(stats.revenue), icon: TrendingUp, tint: 'bg-yellow-100 text-yellow-600' },
      ]
    : []

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error || !stats ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
            Could not load the dashboard: {error}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map(({ label, value, icon: Icon, tint }) => (
                <div key={label} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${tint}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {QUICK_LINKS.map(({ href, label, icon: Icon }, index) => (
                <Button key={href} asChild variant={index === 0 ? 'default' : 'outline'} className="h-16">
                  <Link href={href} className="flex flex-col items-center">
                    <Icon className="w-6 h-6 mb-1" />
                    {label}
                  </Link>
                </Button>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <Link href="/admin/orders" className="text-sm font-medium underline underline-offset-4">
                  All orders
                </Link>
              </div>
              {stats.recentOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No orders yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Order ID', 'Customer', 'Date', 'Status', 'Subtotal', ''].map((heading) => (
                          <th key={heading} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id.slice(-8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.user?.name || order.user?.email}
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
                            {formatPrice(Number(order.total))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>View</Link>
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
  )
}