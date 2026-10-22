import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Admin pages render inside AdminShell, so the session token is already available here
export function useAdminData<T>(url: string) {
  const { token } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    setError(null)

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) {
          throw new Error(body.error || 'Request failed')
        }
        return body as T
      })
      .then((body) => {
        if (!isCancelled) setData(body)
      })
      .catch((requestError: Error) => {
        if (!isCancelled) setError(requestError.message)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [url, token])

  return { data, isLoading, error }
}
