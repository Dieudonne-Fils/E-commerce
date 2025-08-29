import { LoginForm } from '@/components/auth/LoginForm'
import { Header } from '@/components/layout/Header'

export default function LoginPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        <LoginForm />
      </main>
    </div>
  )
}