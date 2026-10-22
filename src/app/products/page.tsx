import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Button } from '@/components/ui/Button'
import { findProducts, parseProductQuery } from '@/lib/catalog'
import { prisma } from '@/lib/prisma'
import { productsHref } from '@/lib/site'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Shop' }

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const rawParams = await searchParams
  // Repeated keys are ignored: every filter takes a single value
  const params = Object.fromEntries(
    Object.entries(rawParams).flatMap(([key, value]) => (typeof value === 'string' && value ? [[key, value]] : []))
  )
  const query = parseProductQuery(params, 12)

  const [{ products, pagination }, categories] = await Promise.all([
    findProducts(query),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const activeCategory = categories.find((category) => category.id === query.category)
  const title = activeCategory?.name ?? 'All products'

  return (
    <main className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        {activeCategory ? (
          <>
            <Link href="/products" className="hover:text-foreground">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{activeCategory.name}</span>
          </>
        ) : (
          <span className="text-foreground">Shop</span>
        )}
      </nav>

      <h1 className="mt-4 text-4xl md:text-5xl">{title}</h1>
      {query.search && (
        <p className="mt-3 text-muted-foreground">
          Results for <span className="font-medium text-foreground">&ldquo;{query.search}&rdquo;</span>
          <Link href={productsHref(params, { search: undefined })} className="ml-3 text-sm underline underline-offset-4">
            Clear search
          </Link>
        </p>
      )}

      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2">
        {[{ id: '', name: 'All' }, ...categories].map((category) => {
          const isActive = (query.category ?? '') === category.id
          return (
            <Link
              key={category.id || 'all'}
              href={productsHref(params, { category: category.id || undefined })}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm transition-colors',
                isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-white hover:bg-secondary'
              )}
            >
              {category.name}
            </Link>
          )
        })}
      </div>

      <div className="mt-6">
        <ProductFilters params={params} total={pagination.total}>
          {products.length === 0 ? (
            <div className="rounded-3xl bg-secondary px-6 py-20 text-center">
              <h2 className="text-2xl">No products match these filters</h2>
              <p className="mt-2 text-muted-foreground">Try a wider price range or another category.</p>
              <Button asChild className="mt-6">
                <Link href={productsHref({}, { category: query.category })}>Reset filters</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination params={params} page={pagination.page} pages={pagination.pages} />
        </ProductFilters>
      </div>
    </main>
  )
}

interface PaginationProps {
  params: Record<string, string>
  page: number
  pages: number
}

function Pagination({ params, page, pages }: PaginationProps) {
  if (pages <= 1) return null

  // First, last and the neighbours of the current page; gaps become an ellipsis
  const visible = Array.from({ length: pages }, (_, index) => index + 1)
    .filter((candidate) => candidate === 1 || candidate === pages || Math.abs(candidate - page) <= 1)
  const pageHref = (target: number) => productsHref(params, { page: target > 1 ? String(target) : undefined })
  const itemClass = 'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm'

  return (
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link href={pageHref(page - 1)} className={cn(itemClass, 'hover:bg-secondary')}>Previous</Link>
      )}
      {visible.map((target, index) => (
        <span key={target} className="flex items-center gap-1">
          {index > 0 && target - visible[index - 1] > 1 && <span className="px-1 text-muted-foreground">...</span>}
          <Link
            href={pageHref(target)}
            aria-current={target === page ? 'page' : undefined}
            className={cn(itemClass, target === page ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}
          >
            {target}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={pageHref(page + 1)} className={cn(itemClass, 'hover:bg-secondary')}>Next</Link>
      )}
    </nav>
  )
}