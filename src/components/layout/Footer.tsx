import Link from 'next/link'
import { categoryHref, siteConfig } from '@/lib/site'

const accountLinks = [
  { href: '/auth/login', label: 'Sign in' },
  { href: '/auth/register', label: 'Create account' },
  { href: '/profile', label: 'Orders & profile' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/cart', label: 'Cart' },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground print:hidden">
      <div className="container mx-auto px-4 py-16 grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <Link href="/" className="font-serif text-3xl font-semibold">
            {siteConfig.name}
          </Link>
          <p className="text-primary-foreground/70 leading-relaxed">
            {siteConfig.tagline} {siteConfig.description}
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary-foreground/70">
            {siteConfig.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </div>

        <nav aria-label="Shop" className="space-y-4">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">Shop</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="hover:text-clay-100 transition-colors">All products</Link>
            </li>
            {siteConfig.navCategories.map((category) => (
              <li key={category.id}>
                <Link href={categoryHref(category.id)} className="hover:text-clay-100 transition-colors">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account" className="space-y-4">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">Account</h2>
          <ul className="space-y-2">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-clay-100 transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="container mx-auto px-4 py-6 text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} {siteConfig.name}. Product photography from Unsplash.
        </p>
      </div>
    </footer>
  )
}