'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBoxProps {
  onClose?: () => void
}

interface SearchResult {
  products: Product[]
  categories: Array<{ id: string; name: string }>
  suggestions: string[]
}

export function SearchBox({ onClose }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=6`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
      setIsOpen(true)
    } else {
      setResults(null)
      setIsOpen(false)
    }
  }, [debouncedQuery, performSearch])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(-1)
  }

  // Save search to recent searches
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveSearch(query)
      window.location.href = `/products?search=${encodeURIComponent(query)}`
    }
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setResults(null)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results) return

    const allItems = [
      ...results.products,
      ...results.categories.map(c => ({ type: 'category' as const, ...c })),
      ...results.suggestions.map(s => ({ type: 'suggestion' as const, name: s }))
    ]

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % allItems.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? allItems.length - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          const item = allItems[selectedIndex]
          if ('type' in item) {
            if (item.type === 'category') {
              window.location.href = `/products?category=${item.id}`
            } else if (item.type === 'suggestion') {
              setQuery(item.name)
              performSearch(item.name)
            }
          } else {
            window.location.href = `/products/${item.id}`
          }
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setIsOpen(false)
        onClose?.()
        break
    }
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full max-w-lg" ref={resultsRef}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products, categories..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Searching...</p>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Recent Searches
              </h3>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search)
                      performSearch(search)
                    }}
                    className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {results && (
            <>
              {/* Products */}
              {results.products.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Products</h3>
                  <div className="space-y-2">
                    {results.products.map((product, index) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className={`flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                          selectedIndex === index ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => saveSearch(query)}
                      >
                        {product.image && (
                          <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-primary-600 font-semibold">
                            ${Number(product.price).toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {results.products.length >= 6 && (
                    <Link
                      href={`/products?search=${encodeURIComponent(query)}`}
                      className="block text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      onClick={() => saveSearch(query)}
                    >
                      View all results
                    </Link>
                  )}
                </div>
              )}

              {/* Categories */}
              {results.categories.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                  <div className="space-y-1">
                    {results.categories.map((category, index) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.id}`}
                        className={`block p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                          selectedIndex === results.products.length + index ? 'bg-primary-50' : ''
                        }`}
                      >
                        <span className="text-sm text-gray-900">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {results.suggestions.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Popular Searches
                  </h3>
                  <div className="space-y-1">
                    {results.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(suggestion)
                          performSearch(suggestion)
                        }}
                        className={`block w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                          selectedIndex === results.products.length + results.categories.length + index ? 'bg-primary-50' : ''
                        }`}
                      >
                        <span className="text-sm text-gray-600">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.products.length === 0 && results.categories.length === 0 && results.suggestions.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-600">No results found for "{query}"</p>
                  <Link
                    href="/products"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
                  >
                    Browse all products
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}