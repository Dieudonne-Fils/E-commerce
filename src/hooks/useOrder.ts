import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Order } from '@/types'

// Waits for the session to load, so a signed-in visitor is never shown the "please login" state
export function useOrder(orderId: string | undefined) {
  const { token, loading: isAuthLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthLoading) return
    if (!token || !orderId) {
      setIsLoading(false)
      return
    }

    let isCancelled = false
    setIsLoading(true)
    fetch(`/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Order | null) => {
        if (!isCancelled) setOrder(data)
      })
      .catch(() => {
        if (!isCancelled) setOrder(null)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [token, orderId, isAuthLoading])

  return { order, isLoading: isAuthLoading || isLoading }
}
