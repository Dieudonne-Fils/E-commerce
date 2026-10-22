'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductForm } from '@/components/admin/ProductForm'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { Product } from '@/types'

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <Loading text="Loading product..." />
        ) : product ? (
          <>
            <AdminPageHeader title="Edit Product" description={product.name} />
            <ProductForm product={product} />
          </>
        ) : (
          <div className="py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Button asChild>
              <Link href="/admin/products">Back to products</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
