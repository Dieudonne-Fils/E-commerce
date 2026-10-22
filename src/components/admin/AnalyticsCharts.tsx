'use client'

import { useState } from 'react'
import { cn, formatPrice } from '@/lib/utils'

// Inline styles below carry data-driven geometry only (bar sizes, tick positions); all styling uses tokens

const compactCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })

export const formatDay = (date: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' })

// Rounds the axis maximum up to 1, 2 or 5 times a power of ten so ticks land on clean values
const niceMax = (value: number) => {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  return ([1, 2, 5, 10].find((step) => value <= step * magnitude) ?? 10) * magnitude
}

export interface DailyPoint {
  date: string
  revenue: number
  orders: number
}

export function RevenueColumnChart({ data }: { data: DailyPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isTableView, setIsTableView] = useState(false)
  const max = niceMax(Math.max(...data.map((point) => point.revenue)))
  const ticks = [max, max / 2, 0]
  const labelEvery = Math.ceil(data.length / 6)
  const active = activeIndex === null ? null : data[activeIndex]
  const activeShare = activeIndex === null ? 0 : (activeIndex + 0.5) / data.length

  return (
    <figure>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setIsTableView(!isTableView)} className="text-sm font-medium underline underline-offset-4">
          {isTableView ? 'View as chart' : 'View as table'}
        </button>
      </div>

      {isTableView ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-2 font-medium">Day</th>
                <th className="py-2 text-right font-medium">Orders</th>
                <th className="py-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((point) => (
                <tr key={point.date}>
                  <td className="py-2">{formatDay(point.date, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                  <td className="py-2 text-right tabular-nums">{point.orders}</td>
                  <td className="py-2 text-right tabular-nums">{formatPrice(point.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="flex gap-3">
            <div className="relative h-56 w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground" aria-hidden="true">
              {ticks.map((tick) => (
                <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - tick / max) * 100}%` }}>
                  {compactCurrency.format(tick)}
                </span>
              ))}
            </div>
            <div className="relative h-56 flex-1">
              {ticks.map((tick) => (
                <div key={tick} className="absolute inset-x-0 border-t border-border" style={{ top: `${(1 - tick / max) * 100}%` }} />
              ))}
              <div className="absolute inset-0 flex items-end gap-0.5">
                {data.map((point, index) => (
                  // The whole column band is the hover and focus target, not just the painted bar
                  <button
                    key={point.date}
                    type="button"
                    onPointerEnter={() => setActiveIndex(index)}
                    onPointerLeave={() => setActiveIndex(null)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(null)}
                    aria-label={`${formatDay(point.date)}: ${formatPrice(point.revenue)}, ${point.orders} orders`}
                    className="flex h-full flex-1 items-end justify-center focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        'w-full max-w-6 rounded-t bg-brand-600 transition-opacity',
                        activeIndex !== null && activeIndex !== index && 'opacity-40'
                      )}
                      style={{ height: `${(point.revenue / max) * 100}%` }}
                    />
                  </button>
                ))}
              </div>
              {active && (
                <div
                  role="status"
                  className={cn(
                    'pointer-events-none absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-lg',
                    activeShare < 0.2 ? 'translate-x-0' : activeShare > 0.8 ? '-translate-x-full' : '-translate-x-1/2'
                  )}
                  style={{ left: `${activeShare * 100}%` }}
                >
                  <p className="font-semibold">{formatPrice(active.revenue)}</p>
                  <p className="text-muted-foreground">
                    {formatDay(active.date, { weekday: 'short', month: 'short', day: 'numeric' })} · {active.orders} {active.orders === 1 ? 'order' : 'orders'}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="ml-[3.75rem] mt-2 flex text-xs text-muted-foreground" aria-hidden="true">
            {data.map((point, index) => (
              <span key={point.date} className="flex-1 whitespace-nowrap text-center">
                {index % labelEvery === 0 ? formatDay(point.date) : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </figure>
  )
}

interface BarListItem {
  label: string
  value: number
  display: string
}

// One series, every value labelled at the bar tip: no legend or tooltip needed
export function BarList({ items }: { items: BarListItem[] }) {
  const max = Math.max(0, ...items.map((item) => item.value))

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[9.5rem_1fr] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{item.label}</span>
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 shrink-0 rounded-r bg-brand-600"
              style={{ width: `${max > 0 ? (item.value / max) * 75 : 0}%` }}
            />
            <span className="font-medium tabular-nums">{item.display}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
