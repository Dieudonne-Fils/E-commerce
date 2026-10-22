import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Category as PrismaCategory, Prisma, Product as PrismaProduct } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Product } from '@/types'

// Site images or an in-browser optimised upload; external URLs would break next/image on every listing
export const productImageSchema = z
  .string()
  .max(2_000_000, 'Image is too large')
  .regex(/^(\/images\/|data:image\/(jpeg|png|webp);base64,)/, 'Unsupported image')

export const CATEGORY_NOT_FOUND = 'This category does not exist'
export const PRODUCT_IN_ORDERS = 'This product appears in existing orders and cannot be deleted. Set its stock to 0 to stop selling it.'

// Turns the constraint errors an admin can actually trigger into clear answers instead of a 500.
// A foreign key failure means a missing category on writes, but existing orders on delete.
export function productWriteError(error: unknown, foreignKeyMessage: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }
  switch (error.code) {
    case 'P2002':
      return NextResponse.json({ error: 'A product with this name already exists' }, { status: 409 })
    case 'P2003':
      return NextResponse.json({ error: foreignKeyMessage }, { status: 409 })
    case 'P2025':
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    default:
      return null
  }
}

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
