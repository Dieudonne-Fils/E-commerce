import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to check out faster, track your orders and keep a wishlist."
      image="/images/products/linen-bedding-set.jpg"
    >
      <LoginForm />
    </AuthShell>
  )
}
