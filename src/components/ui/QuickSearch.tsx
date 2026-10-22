'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'
import { formatPrice } from '@/lib/utils'

interface QuickSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickSearch({ isOpen, onClose }: QuickSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [popularSearches] = useState([
    'iPhone', 'MacBook', 'Headphones', 'Gaming', 'Laptop',
    'Camera', 'Tablet', 'Watch', 'Speaker', 'Monitor'
  ])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle ESC key and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  // Search function
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.products || [])
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery])

  const handleSearchSubmit = (searchQuery: string) => {
    onClose()
    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16 px-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in"
      >
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleSearchSubmit(query)
                  }
                }}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching...</p>
            </div>
          )}

          {/* Search Results */}
          {!loading && query && results.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Products
              </h3>
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    {product.image && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {product.category?.name}
                      </p>
                      <p className="text-lg font-semibold text-primary-600">
                        {formatPrice(Number(product.price))}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </Link>
                ))}
              </div>
              
              {results.length >= 5 && (
                <button
                  onClick={() => handleSearchSubmit(query)}
                  className="w-full mt-4 p-3 text-center text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                >
                  View all results for "{query}"
                </button>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find anything for "{query}"
              </p>
              <button
                onClick={() => handleSearchSubmit(query)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Search all products
              </button>
            </div>
          )}

          {/* Popular Searches */}
          {!query && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center uppercase tracking-wide">
                <TrendingUp className="h-4 w-4 mr-2" />
                Popular Searches
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => {
                      setQuery(search)
                      handleSearchSubmit(search)
                    }}
                    className="text-left p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-primary-600"
                  >
                    {search}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center uppercase tracking-wide">
                  <Clock className="h-4 w-4 mr-2" />
                  Quick Links
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-primary-600"
                  >
                    All Products
                  </Link>
                  <Link
                    href="/products?featured=true"
                    onClick={onClose}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-primary-600"
                  >
                    Featured
                  </Link>
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-primary-600"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/products?sort=newest"
                    onClick={onClose}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-primary-600"
                  >
                    New Arrivals
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}