'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, Loader2 } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { NEXT_ORDER_STATUS, ORDER_STATUSES, OrderStatusBadge, canCancelOrder, orderStatusLabel } from '@/components/admin/OrderStatusBadge'
import { SearchField } from '@/components/admin/SearchField'
import { selectClass, tableStyles } from '@/components/admin/adminStyles'
import { changeOrderStatus } from '@/components/admin/orderActions'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { Order, OrderStatus } from '@/types'
import { cn, formatPrice, priceBreakdown } from '@/lib/utils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest value' },
  { value: 'lowest', label: 'Lowest value' },
]

export default function AdminOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({ pages: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  // Waits for a pause in typing instead of querying on every keystroke
  const debouncedSearch = useDebounce(search, 300)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sortBy })
    if (status) params.set('status', status)
    if (debouncedSearch) params.set('search', debouncedSearch)
    try {
      const response = await fetch(`/api/admin/orders?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setOrders(data.orders ?? [])
      setPagination({ pages: Math.max(1, data.pagination.pages), total: data.pagination.total })
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [token, page, sortBy, status, debouncedSearch])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Any filter change starts again from the first page, so a narrower result is never an empty page
  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(1)
  }

  const handleStatusChange = async (order: Order, nextStatus: OrderStatus) => {
    setUpdatingId(order.id)
    if (await changeOrderStatus(order.id, nextStatus, token)) {
      await fetchOrders()
    }
    setUpdatingId(null)
  }

  const exportOrders = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const response = await fetch(`/api/admin/orders/export?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) {
        toast.error('Failed to export orders')
        return
      }
      const url = window.URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Orders exported successfully')
    } catch {
      toast.error('Failed to export orders')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description={`${pagination.total} orders`}
        action={
          <Button variant="outline" onClick={exportOrders} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export CSV
          </Button>
        }
      />

      <AdminCard bodyClassName="">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row">
          <SearchField value={search} onChange={changeFilter(setSearch)} placeholder="Search by order number, name or email" label="Search orders" />
          <select value={status} onChange={(event) => changeFilter(setStatus)(event.target.value)} aria-label="Filter by status" className={selectClass}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((option) => (
              <option key={option} value={option}>{orderStatusLabel(option)}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(event) => changeFilter(setSortBy)(event.target.value)} aria-label="Sort orders" className={selectClass}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className={tableStyles.scroll}>
          <table className={tableStyles.table}>
            <thead className={tableStyles.head}>
              <tr>
                <th className={tableStyles.th}>Order</th>
                <th className={tableStyles.th}>Customer</th>
                <th className={tableStyles.th}>Status</th>
                <th className={tableStyles.th}>Date</th>
                <th className={`${tableStyles.th} text-right`}>Total</th>
                <th className={`${tableStyles.th} text-right`}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className={cn('transition-opacity', isLoading && 'opacity-50')}>
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No orders match these filters</td>
                </tr>
              )}
              {orders.map((order) => {
                const nextStatus = NEXT_ORDER_STATUS[order.status]
                const isUpdating = updatingId === order.id
                return (
                  <tr key={order.id} className={tableStyles.row}>
                    <td className={`${tableStyles.td} whitespace-nowrap`}>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline underline-offset-4">#{order.id.slice(-8)}</Link>
                      <p className="text-xs text-muted-foreground">{order.items?.length ?? 0} {order.items?.length === 1 ? 'item' : 'items'}</p>
                    </td>
                    <td className={tableStyles.td}>
                      <p className="font-medium">{order.user?.name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                    </td>
                    <td className={tableStyles.td}><OrderStatusBadge status={order.status} /></td>
                    <td className={`${tableStyles.td} whitespace-nowrap text-muted-foreground`}>{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                    <td className={`${tableStyles.td} text-right font-medium tabular-nums whitespace-nowrap`}>{formatPrice(priceBreakdown(Number(order.total)).total)}</td>
                    <td className={tableStyles.td}>
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        {nextStatus && (
                          <Button variant="outline" size="sm" disabled={isUpdating} onClick={() => handleStatusChange(order, nextStatus)}>
                            {isUpdating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                            Mark {orderStatusLabel(nextStatus).toLowerCase()}
                          </Button>
                        )}
                        {canCancelOrder(order.status) && (
                          <Button variant="ghost" size="sm" disabled={isUpdating} onClick={() => handleStatusChange(order, 'CANCELLED')} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                            Cancel
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>View</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <AdminPagination page={page} pages={pagination.pages} total={pagination.total} noun="orders" onChange={setPage} disabled={isLoading} />
      </AdminCard>
    </>
  )
}
