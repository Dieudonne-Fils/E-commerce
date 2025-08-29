import { RegisterForm } from '@/components/auth/RegisterForm'
import { Header } from '@/components/layout/Header'

export default function RegisterPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">
              Join us to start shopping amazing products
            </p>
          </div>
          <RegisterForm />
        </div>
      </main>
    </div>
  )
}