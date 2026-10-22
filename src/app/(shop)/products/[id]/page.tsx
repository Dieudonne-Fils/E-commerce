import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { ProductActions } from '@/components/product/ProductActions'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductReviews } from '@/components/product/ProductReviews'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StarRating } from '@/components/ui/StarRating'
import { findProducts, toProduct } from '@/lib/catalog'
import { prisma } from '@/lib/prisma'
import { categoryHref } from '@/lib/site'
import { cn, formatPrice } from '@/lib/utils'

const perks = [
  { icon: Truck, title: 'Free shipping', detail: 'Ships within 1-2 business days' },
  { icon: RotateCcw, title: '30-day returns', detail: 'Hassle-free, no questions asked' },
  { icon: ShieldCheck, title: 'Secure checkout', detail: 'Your payment details stay private' },
]

// Shared by generateMetadata and the page so the product is only queried once per request
const getProduct = cache(async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } })
  return product && toProduct(product)
})

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct((await params).id)
  return product ? { title: product.name, description: product.description } : {}
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const { products: sameCategory } = await findProducts({ category: product.categoryId, sort: 'rating', page: 1, limit: 5 })
  const related = sameCategory.filter((candidate) => candidate.id !== product.id).slice(0, 4)
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <main className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground truncate">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-foreground">Shop</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={categoryHref(product.categoryId)} className="hover:text-foreground">{product.category.name}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <ProductGallery images={product.image ? [product.image] : []} productName={product.name} />
        </div>

        <div>
          {product.category && (
            <Link href={categoryHref(product.categoryId)} className="text-xs font-semibold uppercase tracking-widest text-brand-600 hover:text-brand-700">
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{product.name}</h1>

          <div className="mt-4 text-sm">
            {product.reviewCount > 0 ? (
              <a href="#reviews" className="inline-flex items-center gap-2 hover:underline underline-offset-4">
                <StarRating rating={product.averageRating} size="sm" />
                <span className="text-muted-foreground">
                  {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </a>
            ) : (
              <a href="#reviews" className="text-muted-foreground hover:underline underline-offset-4">No reviews yet</a>
            )}
          </div>

          <p className="mt-6 text-3xl font-semibold">{formatPrice(product.price)}</p>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                product.stock === 0 ? 'bg-muted-foreground' : isLowStock ? 'bg-brand-500' : 'bg-emerald-600'
              )}
            />
            {product.stock === 0 ? 'Sold out' : isLowStock ? `Only ${product.stock} left, order soon` : 'In stock'}
          </p>

          {product.description && (
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-8">
            <ProductActions product={product} />
          </div>

          <ul className="mt-10 divide-y divide-border border-y border-border">
            {perks.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex items-center gap-4 py-4">
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section id="reviews" className="mt-24 scroll-mt-32">
        <ProductReviews productId={product.id} />
      </section>

      {related.length > 0 && product.category && (
        <section className="mt-24">
          <SectionHeading
            eyebrow="You may also like"
            title={`More in ${product.category.name}`}
            link={{ href: categoryHref(product.categoryId), label: 'View all' }}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}