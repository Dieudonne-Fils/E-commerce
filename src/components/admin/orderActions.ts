import toast from 'react-hot-toast'
import { orderStatusLabel } from '@/components/admin/OrderStatusBadge'
import { OrderStatus } from '@/types'

// Shared by the order list and the order page; cancelling asks first because it restocks and cannot be undone
export async function changeOrderStatus(orderId: string, status: OrderStatus, token: string | null) {
  if (status === 'CANCELLED' && !window.confirm(`Cancel order #${orderId.slice(-8)}? Its items go back in stock and this cannot be undone.`)) {
    return false
  }
  try {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    const data = await response.json()
    if (!response.ok) {
      toast.error(data.error || 'Failed to update the order')
      return false
    }
    toast.success(`Order marked as ${orderStatusLabel(status).toLowerCase()}`)
    return true
  } catch {
    toast.error('Failed to update the order')
    return false
  }
}
