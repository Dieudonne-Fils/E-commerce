'use client'

import { ChangeEvent, DragEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Image as ImageIcon, Loader2, Save, X } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { selectClass } from '@/components/admin/adminStyles'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { optimizeImage, validateImageFile } from '@/lib/imageUtils'
import { Category, Product } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductFormProps {
  // Edit mode when provided, create mode otherwise
  product?: Product
}

const labelClass = 'mb-2 block text-sm font-medium'

export function ProductForm({ product }: ProductFormProps) {
  const { token } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    stock: product ? String(product.stock) : '',
    categoryId: product?.categoryId ?? '',
    featured: product?.featured ?? false,
  })
  const [image, setImage] = useState<string | null>(product?.image ?? null)

  useEffect(() => {
    fetch('/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => toast.error('Failed to load categories'))
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target
    const nextValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value
    setForm((previous) => ({ ...previous, [name]: nextValue }))
  }

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return
    const validationError = validateImageFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }
    setIsProcessingImage(true)
    try {
      // Resized in the browser so the stored image stays small
      setImage(await optimizeImage(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.82, format: 'jpeg' }))
    } catch {
      toast.error('Failed to process the image')
    } finally {
      setIsProcessingImage(false)
    }
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setIsDragActive(false)
    handleImageFile(event.dataTransfer.files[0])
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch(product ? `/api/products/${product.id}` : '/api/products', {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          stock: Number(form.stock || 0),
          categoryId: form.categoryId,
          featured: form.featured,
          // On edit, null clears the image; on create, no image is simply omitted
          image: image ?? (product ? null : undefined),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.details?.[0]?.message ? `${data.error}: ${data.details[0].message}` : data.error || 'Failed to save the product')
        return
      }
      toast.success(product ? 'Product updated' : 'Product created')
      router.push('/admin/products')
    } catch {
      toast.error('Failed to save the product')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <AdminCard title="Details" className="lg:col-span-2" bodyClassName="space-y-6 p-6">
        <div>
          <label htmlFor="name" className={labelClass}>Name *</label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Linen Bedding Set" required />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What makes this product worth buying?"
            rows={5}
            className="w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="categoryId" className={labelClass}>Category *</label>
            <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} required className={cn(selectClass, 'w-full')}>
              <option value="">Select</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>Price (USD) *</label>
            <Input id="price" name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
          </div>
          <div>
            <label htmlFor="stock" className={labelClass}>Stock</label>
            <Input id="stock" name="stock" type="number" step="1" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
          </div>
        </div>
      </AdminCard>

      <div className="space-y-6">
        <AdminCard title="Image">
          {image ? (
            <div className="space-y-3">
              <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                <img src={image} alt="Product preview" className="h-full w-full object-cover" />
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setImage(null)}>
                <X className="mr-1 h-4 w-4" />
                Remove image
              </Button>
            </div>
          ) : (
            <label
              onDragOver={(event) => { event.preventDefault(); setIsDragActive(true) }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
              className={cn(
                'flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors',
                isDragActive ? 'border-primary bg-primary-50' : 'border-input hover:border-primary-500'
              )}
            >
              {isProcessingImage ? (
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{isProcessingImage ? 'Optimizing image...' : 'Drop an image or click to choose'}</span>
              <span className="mt-1 text-xs text-muted-foreground">JPEG, PNG or WebP, up to 10 MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isProcessingImage}
                onChange={(event) => handleImageFile(event.target.files?.[0])}
              />
            </label>
          )}
        </AdminCard>

        <AdminCard title="Visibility">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="mt-0.5 h-4 w-4 accent-primary" />
            <span>
              <span className="block text-sm font-medium">Featured</span>
              <span className="block text-sm text-muted-foreground">Shown in Bestsellers on the home page, with a badge.</span>
            </span>
          </label>
        </AdminCard>
      </div>

      <div className="flex justify-end gap-3 lg:col-span-3">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/products">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSaving || isProcessingImage}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? 'Saving...' : product ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  )
}
