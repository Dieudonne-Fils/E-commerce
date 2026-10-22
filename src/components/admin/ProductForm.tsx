'use client'

import { ChangeEvent, DragEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { optimizeImage, validateImageFile } from '@/lib/imageUtils'
import { Category, Product } from '@/types'
import toast from 'react-hot-toast'

interface ProductFormProps {
  // Edit mode when provided, create mode otherwise
  product?: Product
}

const fieldClass = 'w-full px-3 py-2 border border-input rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring/20'
const labelClass = 'block text-sm font-medium text-gray-700 mb-2'

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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className={labelClass}>Product Name *</label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Enter product name" required />
        </div>
        <div>
          <label htmlFor="categoryId" className={labelClass}>Category *</label>
          <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} required className={fieldClass}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className={labelClass}>Price (USD) *</label>
          <Input id="price" name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
        </div>
        <div>
          <label htmlFor="stock" className={labelClass}>Stock Quantity</label>
          <Input id="stock" name="stock" type="number" step="1" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Enter product description" rows={4} className={fieldClass} />
      </div>

      <div>
        <span className={labelClass}>Product Image</span>
        {image ? (
          <div className="flex items-start gap-4">
            <div className="h-40 w-40 overflow-hidden rounded-lg bg-gray-100">
              <img src={image} alt="Product preview" className="h-full w-full object-cover" />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setImage(null)}>
              <X className="mr-1 h-4 w-4" />
              Remove image
            </Button>
          </div>
        ) : (
          <label
            onDragOver={(event) => { event.preventDefault(); setIsDragActive(true) }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? 'border-primary bg-secondary' : 'border-gray-300 hover:border-gray-400'}`}
          >
            {isProcessingImage ? (
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-gray-400" />
            ) : (
              <ImageIcon className="mb-3 h-10 w-10 text-gray-400" />
            )}
            <span className="font-medium">{isProcessingImage ? 'Optimizing image...' : 'Drop an image here or click to choose'}</span>
            <span className="mt-1 text-sm text-gray-500">JPEG, PNG or WebP, up to 10 MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={isProcessingImage}
              onChange={(event) => handleImageFile(event.target.files?.[0])}
            />
          </label>
        )}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="h-4 w-4 accent-primary" />
        Feature this product on the home page (Bestseller badge)
      </label>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/products">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSaving || isProcessingImage}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isSaving ? 'Saving...' : product ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  )
}
