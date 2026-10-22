import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// Storefront chrome; the admin area has its own layout without the shop header and footer
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
