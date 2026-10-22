'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAdminData } from '@/hooks/useAdminData'
import { useDebounce } from '@/hooks/useDebounce'
import { User } from '@/types'
import { formatPrice } from '@/lib/utils'

interface AdminUser extends Pick<User, 'id' | 'name' | 'email' | 'role' | 'createdAt'> {
  orderCount: number
  totalSpent: number
}

interface UsersResponse {
  users: AdminUser[]
  pagination: { page: number; pages: number; total: number }
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)
  const params = new URLSearchParams({ page: String(page), ...(debouncedSearch && { search: debouncedSearch }) })
  const { data, isLoading, error } = useAdminData<UsersResponse>(`/api/admin/users?${params}`)
  const pages = Math.max(1, data?.pagination.pages ?? 1)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <AdminPageHeader title="Users" description={data ? `${data.pagination.total} registered accounts` : 'Registered accounts'} />

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by name or email"
            className="pl-9"
            aria-label="Search users"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">Could not load users: {error}</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Orders</th>
                  <th className="px-4 py-3 font-medium text-right">Spent (excl. tax)</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
                {!isLoading && data?.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">No users match this search</td>
                  </tr>
                )}
                {data?.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{user.name || 'No name'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{user.orderCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatPrice(user.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {page} of {pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pages || isLoading} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
