import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <AdminPageHeader title="Add New Product" description="Create a new product for your store" />
        <ProductForm />
      </div>
    </main>
  )
}
