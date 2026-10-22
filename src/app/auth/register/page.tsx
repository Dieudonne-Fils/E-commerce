import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Save favourites, follow your orders and get through checkout in seconds."
      image="/images/products/mustard-lounge-chair.jpg"
    >
      <RegisterForm />
    </AuthShell>
  )
}
