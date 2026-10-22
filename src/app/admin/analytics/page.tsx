'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Receipt, ShoppingCart, TrendingUp } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { BarList, DailyPoint, RevenueColumnChart } from '@/components/admin/AnalyticsCharts'
import { orderStatusLabel } from '@/components/admin/OrderStatusBadge'
import { StatTiles } from '@/components/admin/StatTiles'
import { errorBoxClass, tableStyles } from '@/components/admin/adminStyles'
import { Loading } from '@/components/ui/Loading'
import { useAdminData } from '@/hooks/useAdminData'
import { OrderStatus } from '@/types'
import { cn, formatPrice } from '@/lib/utils'

const RANGES = [7, 30, 90]

interface AnalyticsResponse {
  days: number
  kpis: { revenue: number; orders: number; averageOrderValue: number; unitsSold: number }
  daily: DailyPoint[]
  ordersByStatus: { status: OrderStatus; count: number }[]
  topProducts: { id: string; name: string; units: number; revenue: number }[]
  revenueByCategory: { name: string; revenue: number }[]
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const { data, isLoading, error } = useAdminData<AnalyticsResponse>(`/api/admin/analytics?days=${days}`)
  const hasSales = !!data && data.kpis.orders > 0

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Revenue excludes tax and cancelled orders"
        action={
          <div className="flex flex-wrap gap-2" role="group" aria-label="Period">
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDays(range)}
                aria-pressed={days === range}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition-colors',
                  days === range ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-white hover:bg-secondary'
                )}
              >
                Last {range} days
              </button>
            ))}
          </div>
        }
      />

      {error && <p className={cn(errorBoxClass, 'mb-6')}>Could not load analytics: {error}</p>}

      {!data ? (
        !error && <Loading text="Loading analytics..." />
      ) : (
        // A refetch keeps the previous figures on screen, dimmed, instead of flashing a loader
        <div className={cn('space-y-6 transition-opacity', isLoading && 'opacity-60')} aria-busy={isLoading}>
          <StatTiles
            items={[
              { label: 'Revenue', value: formatPrice(data.kpis.revenue), icon: TrendingUp },
              { label: 'Paid orders', value: data.kpis.orders.toLocaleString('en-US'), icon: ShoppingCart },
              { label: 'Average order value', value: formatPrice(data.kpis.averageOrderValue), icon: Receipt },
              { label: 'Units sold', value: data.kpis.unitsSold.toLocaleString('en-US'), icon: Package },
            ]}
          />

          <AdminCard title="Revenue per day">
            {hasSales ? (
              <RevenueColumnChart data={data.daily} />
            ) : (
              <p className="py-12 text-center text-muted-foreground">No paid orders in the last {data.days} days</p>
            )}
          </AdminCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard title="Orders by status">
              <BarList
                items={data.ordersByStatus.map((entry) => ({
                  label: orderStatusLabel(entry.status),
                  value: entry.count,
                  display: entry.count.toLocaleString('en-US'),
                }))}
              />
            </AdminCard>

            <AdminCard title="Revenue by category">
              {data.revenueByCategory.length > 0 ? (
                <BarList
                  items={data.revenueByCategory.map((entry) => ({
                    label: entry.name,
                    value: entry.revenue,
                    display: formatPrice(entry.revenue),
                  }))}
                />
              ) : (
                <p className="py-8 text-center text-muted-foreground">No sales in this period</p>
              )}
            </AdminCard>
          </div>

          <AdminCard title="Top products" bodyClassName="">
            {data.topProducts.length > 0 ? (
              <div className={tableStyles.scroll}>
                <table className={tableStyles.table}>
                  <thead className={tableStyles.head}>
                    <tr>
                      <th className={tableStyles.th}>Product</th>
                      <th className={`${tableStyles.th} text-right`}>Units</th>
                      <th className={`${tableStyles.th} text-right`}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product) => (
                      <tr key={product.id} className={tableStyles.row}>
                        <td className={tableStyles.td}>
                          <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:underline underline-offset-4">
                            {product.name}
                          </Link>
                        </td>
                        <td className={`${tableStyles.td} text-right tabular-nums`}>{product.units}</td>
                        <td className={`${tableStyles.td} text-right tabular-nums`}>{formatPrice(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-8 text-center text-muted-foreground">No sales in this period</p>
            )}
          </AdminCard>
        </div>
      )}
    </>
  )
}
