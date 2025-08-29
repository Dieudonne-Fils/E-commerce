'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'
import { Category } from '@/types'
import { Filter, X } from 'lucide-react'

interface ProductFiltersProps {
  categories: Category[]
  onFiltersChange: (filters: FilterState) => void
  isOpen: boolean
  onToggle: () => void
}

export interface FilterState {
  search: string
  category: string
  minPrice: number
  maxPrice: number
  minRating: number
  sortBy: string
  inStock: boolean
}

export function ProductFilters({ categories, onFiltersChange, isOpen, onToggle }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    sortBy: 'newest',
    inStock: false,
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(filters)
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      minRating: 0,
      sortBy: 'newest',
      inStock: false,
    })
  }

  const hasActiveFilters = filters.category || filters.minPrice > 0 || filters.maxPrice < 10000 || 
                          filters.minRating > 0 || filters.inStock

  return (
    <div className={`bg-white border rounded-lg ${isOpen ? 'block' : 'hidden'} lg:block`}>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </h3>
        <div className="flex space-x-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
          </label>
          <Input
            type="text"
            placeholder="Search by name or description..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', Number(e.target.value) || 0)}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value) || 10000)}
                min="0"
              />
            </div>
            <div className="text-xs text-gray-500">
              ${filters.minPrice} - ${filters.maxPrice === 10000 ? '∞' : filters.maxPrice}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rating
          </label>
          <div className="space-y-2">
            <StarRating 
              rating={filters.minRating} 
              interactive 
              onRatingChange={(rating) => updateFilter('minRating', rating)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('minRating', 0)}
              className="text-xs"
            >
              Clear rating filter
            </Button>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="inStock"
            checked={filters.inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
            In Stock Only
          </label>
        </div>
      </div>
    </div>
  )
}