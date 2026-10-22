'use client'

import { useState } from 'react'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { SearchField } from '@/components/admin/SearchField'
import { errorBoxClass, tableStyles } from '@/components/admin/adminStyles'
import { useAdminData } from '@/hooks/useAdminData'
import { useDebounce } from '@/hooks/useDebounce'
import { User } from '@/types'
import { cn, formatPrice } from '@/lib/utils'

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

  return (
    <>
      <AdminPageHeader title="Users" description={data ? `${data.pagination.total} registered accounts` : 'Registered accounts'} />

      {error ? (
        <p className={errorBoxClass}>Could not load users: {error}</p>
      ) : (
        <AdminCard bodyClassName="">
          <div className="border-b border-border p-4">
            <SearchField
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search by name or email"
              label="Search users"
            />
          </div>

          <div className={tableStyles.scroll}>
            <table className={tableStyles.table}>
              <thead className={tableStyles.head}>
                <tr>
                  <th className={tableStyles.th}>User</th>
                  <th className={tableStyles.th}>Role</th>
                  <th className={tableStyles.th}>Joined</th>
                  <th className={`${tableStyles.th} text-right`}>Orders</th>
                  <th className={`${tableStyles.th} text-right`}>Spent (excl. tax)</th>
                </tr>
              </thead>
              <tbody className={cn('transition-opacity', isLoading && 'opacity-50')}>
                {!isLoading && data?.users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No users match this search</td>
                  </tr>
                )}
                {data?.users.map((user) => (
                  <tr key={user.id} className={tableStyles.row}>
                    <td className={tableStyles.td}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700" aria-hidden="true">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium">{user.name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={tableStyles.td}>
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', user.role === 'ADMIN' ? 'bg-primary-50 text-primary-700 ring-primary-100' : 'bg-secondary text-muted-foreground ring-border')}>
                        {user.role === 'ADMIN' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className={`${tableStyles.td} whitespace-nowrap text-muted-foreground`}>{new Date(user.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                    <td className={`${tableStyles.td} text-right tabular-nums`}>{user.orderCount}</td>
                    <td className={`${tableStyles.td} text-right font-medium tabular-nums whitespace-nowrap`}>{formatPrice(user.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            pages={Math.max(1, data?.pagination.pages ?? 1)}
            total={data?.pagination.total ?? 0}
            noun="users"
            onChange={setPage}
            disabled={isLoading}
          />
        </AdminCard>
      )}
    </>
  )
}
