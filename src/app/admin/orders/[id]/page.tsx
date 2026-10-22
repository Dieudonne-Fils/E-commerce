'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Loader2, Mail, Phone } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { NEXT_ORDER_STATUS, OrderStatusBadge, canCancelOrder, orderStatusLabel } from '@/components/admin/OrderStatusBadge'
import { changeOrderStatus } from '@/components/admin/orderActions'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { Order, OrderStatus, OrderStatusHistory } from '@/types'
import { formatPrice, priceBreakdown } from '@/lib/utils'

const formatDateTime = (date: Date | string) =>
  new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const { token } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [history, setHistory] = useState<OrderStatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchOrder = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [orderResponse, historyResponse] = await Promise.all([
        fetch(`/api/admin/orders/${params.id}`, { headers }),
        fetch(`/api/admin/orders/${params.id}/history`, { headers }),
      ])
      setOrder(orderResponse.ok ? (await orderResponse.json()).order : null)
      setHistory(historyResponse.ok ? (await historyResponse.json()).history ?? [] : [])
    } catch {
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }, [params.id, token])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return
    setIsUpdating(true)
    if (await changeOrderStatus(order.id, status, token)) {
      await fetchOrder()
    }
    setIsUpdating(false)
  }

  if (isLoading) {
    return <Loading text="Loading order..." />
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-4 text-3xl">Order not found</h1>
        <Button asChild>
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  const { subtotal, tax, total } = priceBreakdown(Number(order.total))
  const nextStatus = NEXT_ORDER_STATUS[order.status]
  // The history API lists newest first; the timeline reads oldest first, starting with the order itself
  const timeline = [
    { id: 'placed', label: 'Order placed', date: order.createdAt },
    ...[...history].reverse().map((entry) => ({ id: entry.id, label: orderStatusLabel(entry.status), date: entry.changedAt })),
  ]

  return (
    <>
      <AdminPageHeader
        title={`Order #${order.id.slice(-8)}`}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <span>Placed {formatDateTime(order.createdAt)}</span>
          </span>
        }
        back={{ href: '/admin/orders', label: 'Orders' }}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminCard title={`Items (${order.items?.length ?? 0})`} bodyClassName="divide-y divide-border">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.product?.image && <img src={item.product.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/products/${item.productId}/edit`} className="font-medium hover:underline underline-offset-4">
                    {item.product?.name ?? 'Deleted product'}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.price)} × {item.quantity}
                    {item.product && ` · ${item.product.stock} left in stock`}
                  </p>
                </div>
                <p className="font-medium tabular-nums">{formatPrice(Number(item.price) * item.quantity)}</p>
              </div>
            ))}
          </AdminCard>

          <div className="grid gap-6 sm:grid-cols-2">
            <AdminCard title="Customer">
              <p className="font-medium">{order.user?.name || 'No name'}</p>
              {order.user?.email && (
                <a href={`mailto:${order.user.email}`} className="mt-2 flex items-center gap-2 text-sm text-primary-700 hover:underline underline-offset-4">
                  <Mail className="h-4 w-4" />
                  {order.user.email}
                </a>
              )}
              {order.user?.phone && (
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {order.user.phone}
                </p>
              )}
            </AdminCard>
            <AdminCard title="Shipping address">
              <p className="whitespace-pre-line text-sm leading-relaxed">{order.shippingAddress}</p>
            </AdminCard>
          </div>
        </div>

        <div className="space-y-6">
          <AdminCard title="Summary">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>Free</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd className="tabular-nums">{formatPrice(tax)}</dd></div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total paid</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
            </dl>
          </AdminCard>

          <AdminCard title="Actions" bodyClassName="space-y-3 p-6">
            {nextStatus || canCancelOrder(order.status) ? (
              <>
                {nextStatus && (
                  <Button className="w-full" disabled={isUpdating} onClick={() => handleStatusChange(nextStatus)}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mark as {orderStatusLabel(nextStatus).toLowerCase()}
                  </Button>
                )}
                {canCancelOrder(order.status) && (
                  <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" disabled={isUpdating} onClick={() => handleStatusChange('CANCELLED')}>
                    Cancel order
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {order.status === 'DELIVERED' ? 'This order has been delivered. Nothing left to do.' : 'This order was cancelled and its items are back in stock.'}
              </p>
            )}
          </AdminCard>

          <AdminCard title="History">
            <ol className="space-y-4" aria-label="Order history">
              {timeline.map((event, index) => (
                <li key={event.id} className="flex gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${index === timeline.length - 1 ? 'bg-primary' : 'bg-border'}`} />
                  <div>
                    <p className="text-sm font-medium">{event.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(event.date)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </AdminCard>
        </div>
      </div>
    </>
  )
}
