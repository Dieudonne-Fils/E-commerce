import { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-50 text-blue-800 ring-blue-200' },
  SHIPPED: { label: 'Shipped', className: 'bg-violet-50 text-violet-800 ring-violet-200' },
  DELIVERED: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-50 text-red-700 ring-red-200' },
}

export const ORDER_STATUSES = Object.keys(STATUS_STYLES) as OrderStatus[]

export const orderStatusLabel = (status: OrderStatus) => STATUS_STYLES[status].label

// Mirrors the transitions the status API accepts (api/admin/orders/[id]/status)
export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

export const canCancelOrder = (status: OrderStatus) => status === 'PENDING' || status === 'PROCESSING'

// The dot and the label carry the state, so it never relies on colour alone
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', style.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {style.label}
    </span>
  )
}
