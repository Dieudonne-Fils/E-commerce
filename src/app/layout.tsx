import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { siteConfig } from '@/lib/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{ className: '!rounded-full !bg-primary !text-primary-foreground !text-sm' }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}