import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HeroSection } from '@/components/home/HeroSection'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProductCard } from '@/components/product/ProductCard'
import { findProducts } from '@/lib/catalog'
import { prisma } from '@/lib/prisma'
import { categoryHref } from '@/lib/site'

// Reads the catalog on every request instead of at build time
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [categories, featured, topRated] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
        products: { take: 1, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }], select: { image: true } },
      },
    }),
    findProducts({ featured: true, sort: 'newest', page: 1, limit: 8 }),
    findProducts({ minRating: 1, sort: 'rating', page: 1, limit: 4 }),
  ])
  const productCount = categories.reduce((total, category) => total + category._count.products, 0)

  return (
    <main>
      <HeroSection productCount={productCount} />

      <section id="categories" className="container mx-auto px-4 py-16 scroll-mt-28">
        <SectionHeading eyebrow="Browse" title="Shop by category" link={{ href: '/products', label: 'All products' }} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={categoryHref(category.id)}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
            >
              {category.products[0]?.image && (
                <Image
                  src={category.products[0].image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 16vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="font-serif text-xl leading-tight">{category.name}</h3>
                <p className="mt-1 text-sm text-white/80">{category._count.products} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.products.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <SectionHeading eyebrow="Editor's picks" title="Bestsellers right now" link={{ href: '/products', label: 'Shop all' }} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {featured.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-16">
        <div className="grid overflow-hidden rounded-3xl bg-secondary md:grid-cols-2">
          <div className="relative min-h-[18rem] md:min-h-[28rem]">
            <Image
              src="/images/products/velvet-three-seater-sofa.jpg"
              alt="Deep green velvet sofa"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">The home edit</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Slow living starts at home.</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Soft linen, warm light and furniture with character. Everything you need to make a space feel like yours.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href={categoryHref('cat_home')}>
                  Shop home & kitchen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {topRated.products.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <SectionHeading
            eyebrow="Loved by customers"
            title="Top rated"
            link={{ href: '/products?sort=rating', label: 'See all top rated' }}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {topRated.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}