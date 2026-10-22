'use client'

import { FormEvent, ReactNode, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { ProductSort } from '@/lib/catalog'
import { productsHref } from '@/lib/site'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: Record<ProductSort, string> = {
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  rating: 'Top rated',
  name: 'Name A-Z',
}

const RATING_OPTIONS = [
  { value: '4', label: '4 stars & up' },
  { value: '3', label: '3 stars & up' },
  { value: '', label: 'Any rating' },
]

const FILTER_KEYS = ['minPrice', 'maxPrice', 'minRating', 'inStock'] as const

interface ProductFiltersProps {
  params: Record<string, string>
  total: number
  children: ReactNode
}

export function ProductFilters({ params, total, children }: ProductFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [minPrice, setMinPrice] = useState(params.minPrice ?? '')
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? '')

  // Keep the inputs in sync when the URL changes from elsewhere (clear link, back button)
  useEffect(() => {
    setMinPrice(params.minPrice ?? '')
    setMaxPrice(params.maxPrice ?? '')
  }, [params.minPrice, params.maxPrice])

  const activeFilterCount = FILTER_KEYS.filter((key) => params[key]).length
  const clearFiltersHref = productsHref(params, Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])))

  const navigate = (updates: Record<string, string | undefined>) => {
    startTransition(() => router.push(productsHref(params, updates), { scroll: false }))
  }

  const handlePriceSubmit = (event: FormEvent) => {
    event.preventDefault()
    const [low, high] = [minPrice, maxPrice].map((value) => (value === '' ? undefined : Number(value)))
    // A reversed range is almost always a typo: swap it rather than return nothing
    const isReversed = low !== undefined && high !== undefined && low > high
    navigate({
      minPrice: (isReversed ? high : low)?.toString(),
      maxPrice: (isReversed ? low : high)?.toString(),
    })
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4 border-y border-border py-3">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          aria-expanded={isPanelOpen}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </Button>
        <p className="hidden text-sm text-muted-foreground lg:block">
          {total} {total === 1 ? 'product' : 'products'}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">Sort by</span>
          <select
            value={params.sort ?? 'newest'}
            onChange={(event) => navigate({ sort: event.target.value === 'newest' ? undefined : event.target.value })}
            className="h-9 rounded-full border border-input bg-white pl-3 pr-8 text-sm"
          >
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-12">
        <aside className={cn('mb-10 space-y-8 lg:mb-0 lg:block', isPanelOpen ? 'block' : 'hidden')}>
          <form onSubmit={handlePriceSubmit} className="space-y-3">
            <h2 className="font-sans text-sm font-semibold">Price</h2>
            <div className="flex items-center gap-2">
              <Input type="number" min="0" inputMode="numeric" placeholder="Min" aria-label="Minimum price" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} />
              <span className="text-muted-foreground">-</span>
              <Input type="number" min="0" inputMode="numeric" placeholder="Max" aria-label="Maximum price" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
            </div>
            <Button type="submit" variant="outline" size="sm" className="w-full">Apply price</Button>
          </form>

          <fieldset className="space-y-2">
            <legend className="mb-3 text-sm font-semibold">Customer rating</legend>
            {RATING_OPTIONS.map((option) => (
              <label key={option.label} className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="minRating"
                  checked={(params.minRating ?? '') === option.value}
                  onChange={() => navigate({ minRating: option.value || undefined })}
                  className="h-4 w-4 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Availability</legend>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={params.inStock === 'true'}
                onChange={(event) => navigate({ inStock: event.target.checked ? 'true' : undefined })}
                className="h-4 w-4 rounded accent-primary"
              />
              In stock only
            </label>
          </fieldset>

          {activeFilterCount > 0 && (
            <Link href={clearFiltersHref} scroll={false} className="block text-sm font-medium underline underline-offset-4">
              Clear all filters
            </Link>
          )}
        </aside>

        <div className={cn('transition-opacity', isPending && 'opacity-50')} aria-busy={isPending}>
          {children}
        </div>
      </div>
    </>
  )
}