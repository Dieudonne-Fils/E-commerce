import { Category as PrismaCategory, Prisma, Product as PrismaProduct } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Product } from '@/types'

// The id tiebreaker keeps pagination stable when several products share the sorted value
export const PRODUCT_SORTS = {
  newest: [{ createdAt: 'desc' }, { id: 'asc' }],
  'price-asc': [{ price: 'asc' }, { id: 'asc' }],
  'price-desc': [{ price: 'desc' }, { id: 'asc' }],
  rating: [{ averageRating: 'desc' }, { reviewCount: 'desc' }, { id: 'asc' }],
  name: [{ name: 'asc' }, { id: 'asc' }],
} satisfies Record<string, Prisma.ProductOrderByWithRelationInput[]>

export type ProductSort = keyof typeof PRODUCT_SORTS

export interface ProductQuery {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  featured?: boolean
  sort: ProductSort
  page: number
  limit: number
}

type SearchParamsRecord = Record<string, string | string[] | undefined>

const MAX_LIMIT = 100

const toNumber = (value: string | undefined) => {
  const parsed = Number(value)
  return value && Number.isFinite(parsed) ? parsed : undefined
}

const isProductSort = (value: string | undefined): value is ProductSort => !!value && value in PRODUCT_SORTS

// Accepts both an API request's URLSearchParams and a page's searchParams prop
export function parseProductQuery(params: URLSearchParams | SearchParamsRecord, defaultLimit: number): ProductQuery {
  const get = (key: string) => {
    const value = params instanceof URLSearchParams ? params.get(key) : params[key]
    return (Array.isArray(value) ? value[0] : value) || undefined
  }
  const sort = get('sort')

  return {
    category: get('category'),
    search: get('search')?.trim() || undefined,
    minPrice: toNumber(get('minPrice')),
    maxPrice: toNumber(get('maxPrice')),
    minRating: toNumber(get('minRating')),
    inStock: get('inStock') === 'true',
    featured: get('featured') === 'true',
    sort: isProductSort(sort) ? sort : 'newest',
    page: Math.max(1, Math.floor(toNumber(get('page')) ?? 1)),
    limit: Math.min(MAX_LIMIT, Math.max(1, Math.floor(toNumber(get('limit')) ?? defaultLimit))),
  }
}

// Prisma returns Decimal prices and null optionals; client components expect the shared Product type
export function toProduct(product: PrismaProduct & { category: PrismaCategory }): Product {
  return {
    ...product,
    price: Number(product.price),
    description: product.description ?? undefined,
    image: product.image ?? undefined,
    category: { ...product.category, description: product.category.description ?? undefined },
  }
}

export async function findProducts(query: ProductQuery) {
  const where: Prisma.ProductWhereInput = {
    categoryId: query.category,
    featured: query.featured || undefined,
    price: { gte: query.minPrice, lte: query.maxPrice },
    averageRating: query.minRating ? { gte: query.minRating } : undefined,
    stock: query.inStock ? { gt: 0 } : undefined,
    OR: query.search
      ? [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ]
      : undefined,
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: PRODUCT_SORTS[query.sort],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products: products.map(toProduct),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  }
}
