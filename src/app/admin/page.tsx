'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, Package, Plus, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { StatTiles } from '@/components/admin/StatTiles'
import { errorBoxClass, tableStyles } from '@/components/admin/adminStyles'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useAdminData } from '@/hooks/useAdminData'
import { Order } from '@/types'
import { formatPrice, priceBreakdown } from '@/lib/utils'

interface AdminStats {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  revenue: number
  recentOrders: Order[]
}

const QUICK_LINKS = [
  { href: '/admin/products', label: 'Products', description: 'Add, edit and price the catalog', icon: Package },
  { href: '/admin/orders', label: 'Orders', description: 'Ship, cancel and export orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', description: 'Customers and what they spend', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', description: 'Revenue trends and best sellers', icon: BarChart3 },
]

export default function AdminPage() {
  const { data: stats, isLoading, error } = useAdminData<AdminStats>('/api/admin/stats')

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of your store"
        action={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add product
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <Loading text="Loading dashboard..." />
      ) : error || !stats ? (
        <p className={errorBoxClass}>Could not load the dashboard: {error}</p>
      ) : (
        <div className="space-y-8">
          <StatTiles
            items={[
              { label: 'Revenue', value: formatPrice(stats.revenue), icon: TrendingUp, hint: 'Excl. tax and cancelled orders' },
              { label: 'Orders', value: stats.totalOrders.toLocaleString('en-US'), icon: ShoppingCart },
              { label: 'Products', value: stats.totalProducts.toLocaleString('en-US'), icon: Package },
              { label: 'Users', value: stats.totalUsers.toLocaleString('en-US'), icon: Users },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-white p-5 transition-colors hover:border-primary-500"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 font-medium">
                    {label}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
                </span>
              </Link>
            ))}
          </div>

          <AdminCard
            title="Recent orders"
            action={<Link href="/admin/orders" className="text-sm font-medium text-primary-700 hover:underline underline-offset-4">View all</Link>}
            bodyClassName=""
          >
            {stats.recentOrders.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">No orders yet</p>
            ) : (
              <div className={tableStyles.scroll}>
                <table className={tableStyles.table}>
                  <thead className={tableStyles.head}>
                    <tr>
                      <th className={tableStyles.th}>Order</th>
                      <th className={tableStyles.th}>Customer</th>
                      <th className={tableStyles.th}>Status</th>
                      <th className={tableStyles.th}>Date</th>
                      <th className={`${tableStyles.th} text-right`}>Total</th>
                      <th className={tableStyles.th}><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className={tableStyles.row}>
                        <td className={`${tableStyles.td} font-medium whitespace-nowrap`}>#{order.id.slice(-8)}</td>
                        <td className={tableStyles.td}>
                          <p className="font-medium">{order.user?.name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                        </td>
                        <td className={tableStyles.td}><OrderStatusBadge status={order.status} /></td>
                        <td className={`${tableStyles.td} whitespace-nowrap text-muted-foreground`}>{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                        <td className={`${tableStyles.td} text-right font-medium tabular-nums whitespace-nowrap`}>{formatPrice(priceBreakdown(Number(order.total)).total)}</td>
                        <td className={`${tableStyles.td} text-right`}>
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
          </AdminCard>
        </div>
      )}
    </>
  )
}