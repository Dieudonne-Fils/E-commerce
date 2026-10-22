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

  if (isLoading) {
    return <Loading text="Loading product..." />
  }

  if (!product) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-4 text-3xl">Product not found</h1>
        <Button asChild>
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        title={product.name}
        description="Edit product"
        back={{ href: '/admin/products', label: 'Products' }}
        action={
          <Button variant="outline" asChild>
            <Link href={`/products/${product.id}`} target="_blank">View in store</Link>
          </Button>
        }
      />
      <ProductForm product={product} />
    </>
  )
}
