'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { BarList, DailyPoint, RevenueColumnChart } from '@/components/admin/AnalyticsCharts'
import { Loading } from '@/components/ui/Loading'
import { useAdminData } from '@/hooks/useAdminData'
import { OrderStatus } from '@/types'
import { cn, formatPrice } from '@/lib/utils'

const RANGES = [7, 30, 90]

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

interface AnalyticsResponse {
  days: number
  kpis: { revenue: number; orders: number; averageOrderValue: number; unitsSold: number }
  daily: DailyPoint[]
  ordersByStatus: { status: OrderStatus; count: number }[]
  topProducts: { id: string; name: string; units: number; revenue: number }[]
  revenueByCategory: { name: string; revenue: number }[]
}

const cardClass = 'rounded-lg border bg-white p-6 shadow-sm'

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const { data, isLoading, error } = useAdminData<AnalyticsResponse>(`/api/admin/analytics?days=${days}`)
  const hasSales = !!data && data.kpis.orders > 0

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <AdminPageHeader title="Analytics" description="Revenue excludes tax and cancelled orders" />

        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Period">
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

        {error && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">Could not load analytics: {error}</p>
        )}

        {!data ? (
          !error && <Loading text="Loading analytics..." />
        ) : (
          // A refetch keeps the previous figures on screen, dimmed, instead of flashing a loader
          <div className={cn('space-y-6 transition-opacity', isLoading && 'opacity-60')} aria-busy={isLoading}>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Revenue', value: formatPrice(data.kpis.revenue) },
                { label: 'Paid orders', value: data.kpis.orders.toLocaleString('en-US') },
                { label: 'Average order value', value: formatPrice(data.kpis.averageOrderValue) },
                { label: 'Units sold', value: data.kpis.unitsSold.toLocaleString('en-US') },
              ].map((tile) => (
                <div key={tile.label} className={cardClass}>
                  <p className="text-sm text-gray-600">{tile.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{tile.value}</p>
                </div>
              ))}
            </div>

            <section className={cardClass}>
              <h2 className="font-sans text-lg font-semibold">Revenue per day</h2>
              {hasSales ? (
                <RevenueColumnChart data={data.daily} />
              ) : (
                <p className="py-12 text-center text-gray-500">No paid orders in the last {data.days} days</p>
              )}
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className={cardClass}>
                <h2 className="mb-4 font-sans text-lg font-semibold">Orders by status</h2>
                <BarList
                  items={data.ordersByStatus.map((entry) => ({
                    label: STATUS_LABELS[entry.status],
                    value: entry.count,
                    display: entry.count.toLocaleString('en-US'),
                  }))}
                />
              </section>

              <section className={cardClass}>
                <h2 className="mb-4 font-sans text-lg font-semibold">Revenue by category</h2>
                {data.revenueByCategory.length > 0 ? (
                  <BarList
                    items={data.revenueByCategory.map((entry) => ({
                      label: entry.name,
                      value: entry.revenue,
                      display: formatPrice(entry.revenue),
                    }))}
                  />
                ) : (
                  <p className="py-8 text-center text-gray-500">No sales in this period</p>
                )}
              </section>
            </div>

            <section className={cardClass}>
              <h2 className="mb-4 font-sans text-lg font-semibold">Top products</h2>
              {data.topProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="py-2 font-medium">Product</th>
                        <th className="py-2 text-right font-medium">Units</th>
                        <th className="py-2 text-right font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.topProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="py-2">
                            <Link href={`/admin/products/${product.id}/edit`} className="hover:underline underline-offset-4">
                              {product.name}
                            </Link>
                          </td>
                          <td className="py-2 text-right tabular-nums">{product.units}</td>
                          <td className="py-2 text-right tabular-nums">{formatPrice(product.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">No sales in this period</p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
