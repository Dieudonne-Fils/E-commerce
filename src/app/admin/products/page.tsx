'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { Category, Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 20

export default function AdminProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const fetchProducts = useCallback(async (page: number) => {
    setIsLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (category) params.set('category', category)
    try {
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      setProducts(data.products ?? [])
      setPagination({ page: data.pagination.page, pages: Math.max(1, data.pagination.pages), total: data.pagination.total })
    } catch {
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, category])

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  useEffect(() => {
    fetch('/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => toast.error('Failed to load categories'))
  }, [])

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setDeletingId(product.id)
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || 'Failed to delete the product')
        return
      }
      toast.success('Product deleted')
      fetchProducts(pagination.page)
    } catch {
      toast.error('Failed to delete the product')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <AdminPageHeader
          title="Products"
          description={`${pagination.total} products in the catalog`}
          action={
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          }
        />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or description" className="pl-9" aria-label="Search products" />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="h-11 rounded-lg border border-input bg-white px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">No products match these filters</td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/products/${product.id}`} className="font-medium hover:underline underline-offset-4">
                          {product.name}
                        </Link>
                        {product.featured && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-brand-600">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{product.category?.name}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className={product.stock === 0 ? 'font-medium text-red-600' : product.stock <= 5 ? 'font-medium text-brand-600' : ''}>
                      {product.stock === 0 ? 'Sold out' : product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        aria-label={`Delete ${product.name}`}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1 || isLoading} onClick={() => fetchProducts(pagination.page - 1)}>
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</span>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages || isLoading} onClick={() => fetchProducts(pagination.page + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
