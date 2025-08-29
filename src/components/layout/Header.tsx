'use client'

import Link from 'next/link'
import { ShoppingCart, User, Search, Menu, LogOut, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchBox } from '@/components/ui/SearchBox'
import { QuickSearch } from '@/components/ui/QuickSearch'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

export function Header() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          E-Commerce
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
            Products
          </Link>
          <Link href="/categories" className="text-gray-600 hover:text-gray-900 transition-colors">
            Categories
          </Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <SearchBox />
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {user && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
          )}
          
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </Button>
          
          {user ? (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  {user.name || user.email}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Quick Search Modal */}
      <QuickSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white animate-slide-in-top">
          <div className="container mx-auto px-4 py-4 space-y-4">
            
            <nav className="flex flex-col space-y-2">
              <Link href="/products" className="text-gray-600 hover:text-gray-900 py-2">
                Products
              </Link>
              <Link href="/categories" className="text-gray-600 hover:text-gray-900 py-2">
                Categories
              </Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 py-2">
                  Admin
                </Link>
              )}
            </nav>
            
            <div className="flex items-center justify-between pt-4 border-t">
              {user && (
                <Button variant="ghost" asChild>
                  <Link href="/wishlist">
                    <Heart className="h-5 w-5 mr-2" />
                    Wishlist
                  </Link>
                </Button>
              )}
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/profile">Profile</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}