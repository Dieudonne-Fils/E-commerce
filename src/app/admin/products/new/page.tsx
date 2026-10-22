import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader title="Add product" description="Create a new product for your store" back={{ href: '/admin/products', label: 'Products' }} />
      <ProductForm />
    </>
  )
}
