'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, LayoutDashboard, LogOut, Package, ShoppingCart, Store, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { Logo } from '@/components/layout/Logo'
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
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (loading) {
    return <Loading fullScreen text="Loading admin..." />
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center">
          <Logo className="text-2xl" />
          <h1 className="mt-6 text-3xl">{user ? 'Access denied' : 'Please sign in'}</h1>
          <p className="mt-3 text-muted-foreground">
            {user ? 'Your account does not have access to the admin area.' : 'Sign in with an admin account to manage the store.'}
          </p>
          <Button asChild className="mt-6">
            <Link href={user ? '/' : '/auth/login'}>{user ? 'Back to the shop' : 'Sign in'}</Link>
          </Button>
        </div>
      </main>
    )
  }

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-border bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-6 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo className="text-2xl" />
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">Admin</span>
          </Link>
          <div className="flex items-center gap-1 lg:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="View store">
                <Store className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-primary-50 font-medium text-primary-700' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden border-t border-border p-3 lg:block">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Store className="h-4 w-4" />
            View store
          </Link>
          <div className="mt-2 flex items-center gap-3 px-3 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name || 'Admin'}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  )
}
