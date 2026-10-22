export const siteConfig = {
  name: 'Oakline',
  tagline: 'Thoughtfully chosen goods for everyday life.',
  description: 'Electronics, clothing, home and outdoor essentials, chosen to last.',
  perks: ['Free shipping on every order', '30-day returns', 'Secure checkout'],
  // Category ids come from the catalog migration (prisma/migrations/*_add_catalog)
  navCategories: [
    { id: 'cat_electronics', label: 'Electronics' },
    { id: 'cat_clothing', label: 'Clothing' },
    { id: 'cat_home', label: 'Home' },
    { id: 'cat_sports', label: 'Sports' },
    { id: 'cat_beauty', label: 'Beauty' },
    { id: 'cat_accessories', label: 'Accessories' },
  ],
} as const

export const categoryHref = (categoryId: string) => `/products?category=${categoryId}`

// Builds a /products URL from the current filters; any change sends the visitor back to page 1
export function productsHref(current: Record<string, string>, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams(current)
  params.delete('page')
  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
  }
  const query = params.toString()
  return query ? `/products?${query}` : '/products'
}
