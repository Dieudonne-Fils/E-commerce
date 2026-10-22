'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { Logo } from '@/components/layout/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useOrder } from '@/hooks/useOrder'
import { siteConfig } from '@/lib/site'
import { TAX_RATE, formatPrice, priceBreakdown } from '@/lib/utils'

export default function InvoicePage() {
  const { user } = useAuth()
  const params = useParams<{ id: string }>()
  const { order, isLoading } = useOrder(params.id)
  const hasPrinted = useRef(false)

  // Opened from "Download Invoice": the browser print dialog offers "Save as PDF"
  useEffect(() => {
    if (order && !hasPrinted.current && new URLSearchParams(window.location.search).get('print') === '1') {
      hasPrinted.current = true
      window.print()
    }
  }, [order])

  if (isLoading) {
    return <Loading text="Preparing your invoice..." />
  }

  if (!user || !order) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl">Invoice unavailable</h1>
        <p className="mt-3 text-muted-foreground">
          {user ? 'This order does not exist or belongs to another account.' : 'Sign in to download your invoices.'}
        </p>
        <Button asChild className="mt-6">
          <Link href={user ? '/profile' : '/auth/login'}>{user ? 'View my orders' : 'Sign in'}</Link>
        </Button>
      </main>
    )
  }

  const { subtotal, tax, total } = priceBreakdown(Number(order.total))
  const issuedOn = new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })
  const sectionLabel = 'font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground'

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" asChild>
          <Link href={`/orders/${order.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to order
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print or save as PDF
        </Button>
      </div>

      <article className="rounded-3xl border border-border bg-white p-6 sm:p-12 print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
          <div>
            <Logo className="text-3xl" />
            <p className="mt-1 text-sm text-muted-foreground">{siteConfig.tagline}</p>
          </div>
          <div className="sm:text-right">
            <h1 className="text-3xl">Invoice</h1>
            <p className="mt-1 text-sm font-medium">INV-{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">Issued {issuedOn}</p>
          </div>
        </header>

        <section className="grid gap-6 border-b border-border py-8 sm:grid-cols-2">
          <div>
            <h2 className={sectionLabel}>Billed to</h2>
            <p className="mt-2 font-medium">{user.name || user.email}</p>
            {user.name && <p className="text-sm text-muted-foreground">{user.email}</p>}
          </div>
          <div>
            <h2 className={sectionLabel}>Ship to</h2>
            <p className="mt-2 text-sm leading-relaxed">{order.shippingAddress}</p>
          </div>
        </section>

        <table className="my-8 w-full text-sm">
          <thead>
            <tr className={`border-b border-border text-left ${sectionLabel}`}>
              <th className="pb-3 font-semibold">Item</th>
              <th className="pb-3 text-right font-semibold">Qty</th>
              <th className="hidden pb-3 text-right font-semibold sm:table-cell print:table-cell">Unit price</th>
              <th className="pb-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-3 pr-4">{item.product?.name ?? 'Product'}</td>
                <td className="py-3 text-right tabular-nums">{item.quantity}</td>
                <td className="hidden py-3 text-right tabular-nums sm:table-cell print:table-cell">{formatPrice(item.price)}</td>
                <td className="py-3 text-right tabular-nums">{formatPrice(Number(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>Free</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax ({TAX_RATE * 100}%)</dt>
            <dd className="tabular-nums">{formatPrice(tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(total)}</dd>
          </div>
        </dl>

        <p className="mt-12 text-center text-sm text-muted-foreground">Thank you for shopping with {siteConfig.name}.</p>
      </article>
    </main>
  )
}
