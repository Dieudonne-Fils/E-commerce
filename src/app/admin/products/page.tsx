'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { SearchField } from '@/components/admin/SearchField'
import { selectClass, tableStyles } from '@/components/admin/adminStyles'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { Category, Product } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 20

function StockBadge({ stock }: { stock: number }) {
  const [label, className] =
    stock === 0
      ? ['Sold out', 'bg-red-50 text-red-700 ring-red-200']
      : stock <= 5
        ? [`Low · ${stock}`, 'bg-amber-50 text-amber-800 ring-amber-200']
        : [`In stock · ${stock}`, 'bg-emerald-50 text-emerald-800 ring-emerald-200']
  return <span className={cn('whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', className)}>{label}</span>
}

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
    <>
      <AdminPageHeader
        title="Products"
        description={`${pagination.total} products in the catalog`}
        action={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add product
            </Link>
          </Button>
        }
      />

      <AdminCard bodyClassName="">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <SearchField value={search} onChange={setSearch} placeholder="Search by name or description" label="Search products" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category" className={selectClass}>
            <option value="">All categories</option>
            {categories.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>

        <div className={tableStyles.scroll}>
          <table className={tableStyles.table}>
            <thead className={tableStyles.head}>
              <tr>
                <th className={tableStyles.th}>Product</th>
                <th className={tableStyles.th}>Category</th>
                <th className={`${tableStyles.th} text-right`}>Price</th>
                <th className={tableStyles.th}>Stock</th>
                <th className={`${tableStyles.th} text-right`}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className={cn('transition-opacity', isLoading && 'opacity-50')}>
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No products match these filters</td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className={tableStyles.row}>
                  <td className={tableStyles.td}>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:underline underline-offset-4">
                          {product.name}
                        </Link>
                        {product.featured && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            Featured
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`${tableStyles.td} whitespace-nowrap text-muted-foreground`}>{product.category?.name}</td>
                  <td className={`${tableStyles.td} text-right font-medium tabular-nums whitespace-nowrap`}>{formatPrice(product.price)}</td>
                  <td className={tableStyles.td}><StockBadge stock={product.stock} /></td>
                  <td className={tableStyles.td}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                        <Link href={`/products/${product.id}`} target="_blank" aria-label={`View ${product.name} in the store`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                        <Link href={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        aria-label={`Delete ${product.name}`}
                        className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
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

        <AdminPagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          noun="products"
          onChange={fetchProducts}
          disabled={isLoading}
        />
      </AdminCard>
    </>
  )
}
