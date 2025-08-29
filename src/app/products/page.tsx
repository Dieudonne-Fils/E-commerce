'use client'

import { useState, useEffect, useCallback } from 'react'
import { Filter, Grid, List } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters, FilterState } from '@/components/product/ProductFilters'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { ProductCardSkeleton } from '@/components/ui/Loading'
import { Product, Category } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [pagination.page])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?page=${pagination.page}&limit=${pagination.limit}`)
      const data = await response.json()
      setProducts(data.products)
      setFilteredProducts(data.products)
      setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleFiltersChange = useCallback((filters: FilterState) => {
    let filtered = [...products]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.categoryId === filters.category)
    }

    // Price filter
    filtered = filtered.filter(product => {
      const price = Number(product.price)
      return price >= filters.minPrice && price <= filters.maxPrice
    })

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(product => product.averageRating >= filters.minRating)
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0)
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    setFilteredProducts(filtered)
  }, [products])

  if (loading) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="border rounded-lg p-1 hidden md:flex">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              categories={categories}
              onFiltersChange={handleFiltersChange}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </div>

          {/* Products Grid/List */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, index) => {
                    const pageNum = index + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}