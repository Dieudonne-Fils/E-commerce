'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, LogOut, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchBox } from '@/components/ui/SearchBox'
import { QuickSearch } from '@/components/ui/QuickSearch'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { categoryHref, siteConfig } from '@/lib/site'

export function Header() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 print:hidden">
      <div className="bg-primary text-primary-foreground">
        <p className="container mx-auto px-4 py-2 text-center text-xs tracking-wide">
          {siteConfig.perks.map((perk, index) => (
            <span key={perk} className={index > 0 ? 'hidden sm:inline' : undefined}>
              {index > 0 && <span className="mx-2">·</span>}
              {perk}
            </span>
          ))}
        </p>
      </div>

      <div className="border-b border-border bg-background/90 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight" onClick={closeMenu}>
            {siteConfig.name}
          </Link>

          <nav className="hidden lg:flex items-center gap-6 ml-6 text-sm">
            <Link href="/products" className="font-medium hover:text-clay-600 transition-colors">
              Shop all
            </Link>
            {siteConfig.navCategories.map((category) => (
              <Link
                key={category.id}
                href={categoryHref(category.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {category.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="font-medium text-clay-600 hover:text-clay-700 transition-colors">
                Admin
              </Link>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <div className="hidden md:block w-56 xl:w-72 mr-2">
              <SearchBox />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {user && (
              <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
                <Link href="/wishlist" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
              <Link href={user ? '/profile' : '/auth/login'} aria-label={user ? 'My account' : 'Sign in'}>
                <User className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart" aria-label={`Cart, ${cartItemsCount} items`}>
                <ShoppingBag className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-clay-600 text-white text-[10px] font-semibold leading-[1.125rem] text-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </Button>

            {user && (
              <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={logout} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <QuickSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {isMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background shadow-lg max-h-[calc(100vh-6.5rem)] overflow-y-auto">
          <nav className="container mx-auto px-4 py-4 flex flex-col">
            <Link href="/products" onClick={closeMenu} className="py-3 font-serif text-xl">
              Shop all
            </Link>
            {siteConfig.navCategories.map((category) => (
              <Link
                key={category.id}
                href={categoryHref(category.id)}
                onClick={closeMenu}
                className="py-3 font-serif text-xl border-t border-border"
              >
                {category.label}
              </Link>
            ))}
          </nav>

          <div className="container mx-auto px-4 py-4 border-t border-border flex flex-wrap gap-2">
            {user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile" onClick={closeMenu}>
                    <User className="h-4 w-4 mr-2" />
                    My account
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/wishlist" onClick={closeMenu}>
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Link>
                </Button>
                {user.role === 'ADMIN' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin" onClick={closeMenu}>Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => { logout(); closeMenu() }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" asChild>
                  <Link href="/auth/login" onClick={closeMenu}>Sign in</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/register" onClick={closeMenu}>Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}