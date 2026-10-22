'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

// Single access check for every admin page: it waits for the session instead of redirecting a signed-in admin
export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return <Loading text="Loading admin..." />
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl">{user ? 'Access denied' : 'Please sign in'}</h1>
        <p className="mt-3 text-muted-foreground">
          {user ? 'Your account does not have access to the admin area.' : 'Sign in with an admin account to manage the store.'}
        </p>
        <Button asChild className="mt-6">
          <Link href={user ? '/' : '/auth/login'}>{user ? 'Back to the shop' : 'Sign in'}</Link>
        </Button>
      </main>
    )
  }

  return (
    <>
      <nav aria-label="Admin" className="border-b border-border bg-white">
        <div className="container mx-auto flex gap-1 overflow-x-auto px-4">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm transition-colors',
                  isActive ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
      {children}
    </>
  )
}
