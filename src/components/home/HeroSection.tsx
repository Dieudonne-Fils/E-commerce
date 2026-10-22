import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const heroPicks = [
  { href: '/products/prod_floral_summer_dress', image: '/images/products/floral-summer-dress.jpg', label: 'Floral Summer Dress' },
  { href: '/products/prod_wireless_headphones', image: '/images/products/wireless-headphones.jpg', label: 'Wireless Headphones' },
  { href: '/products/prod_tufted_accent_chair', image: '/images/products/tufted-accent-chair.jpg', label: 'Tufted Accent Chair' },
]

const perks = [
  { icon: Truck, label: 'Free shipping' },
  { icon: RotateCcw, label: '30-day returns' },
  { icon: ShieldCheck, label: 'Secure checkout' },
]

interface HeroSectionProps {
  productCount: number
}

export function HeroSection({ productCount }: HeroSectionProps) {
  const [mainPick, ...sidePicks] = heroPicks

  return (
    <section className="container mx-auto px-4 pt-10 pb-16 lg:pt-16 lg:pb-24 grid items-center gap-12 lg:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-clay-600">The everyday edit</p>
        <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl xl:text-7xl">
          Everyday goods, <em className="text-clay-600">thoughtfully</em> chosen.
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">
          {productCount} pieces across tech, wardrobe, home and outdoors. Picked to be used often and kept for years.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/products">
              Shop the collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#categories">Browse categories</Link>
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {perks.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Link href={mainPick.href} className="group relative row-span-2 overflow-hidden rounded-3xl bg-muted">
          <Image src={mainPick.image} alt={mainPick.label} fill priority sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </Link>
        {sidePicks.map((pick) => (
          <Link key={pick.href} href={pick.href} className="group relative aspect-square overflow-hidden rounded-3xl bg-muted">
            <Image src={pick.image} alt={pick.label} fill priority sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          </Link>
        ))}
      </div>
    </section>
  )
}