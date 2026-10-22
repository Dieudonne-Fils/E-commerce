'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { Category } from '@/types'
import { batchOptimizeImages, validateImageFile } from '@/lib/imageUtils'
import toast from 'react-hot-toast'

export default function NewProductPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    images: [] as string[],
    featured: false,
  })

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchCategories()
  }, [user, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const maxFiles = 5
    
    if (imagePreviews.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Validate files first
      const fileArray = Array.from(files)
      for (const file of fileArray) {
        const validation = validateImageFile(file)
        if (validation) {
          toast.error(`${file.name}: ${validation}`)
          setIsUploading(false)
          return
        }
      }

      // Optimize and process images
      const optimizedImages = await batchOptimizeImages(
        fileArray,
        {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          format: 'jpeg'
        },
        (progress) => setUploadProgress(progress)
      )

      setImagePreviews(prev => [...prev, ...optimizedImages])
      setFormData(prev => ({ ...prev, images: [...prev.images, ...optimizedImages] }))
      toast.success(`${optimizedImages.length} image(s) uploaded and optimized successfully`)
      
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to process images. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeImage = (index: number) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index)
    const updatedImages = formData.images.filter((_, i) => i !== index)
    setImagePreviews(updatedPreviews)
    setFormData(prev => ({ ...prev, images: updatedImages }))
    toast.success('Image removed')
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const updatedPreviews = [...imagePreviews]
    const updatedImages = [...formData.images]
    
    const [movedPreview] = updatedPreviews.splice(fromIndex, 1)
    const [movedImage] = updatedImages.splice(fromIndex, 1)
    
    updatedPreviews.splice(toIndex, 0, movedPreview)
    updatedImages.splice(toIndex, 0, movedImage)
    
    setImagePreviews(updatedPreviews)
    setFormData(prev => ({ ...prev, images: updatedImages }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fakeEvent = {
        target: { files: e.dataTransfer.files }
      } as React.ChangeEvent<HTMLInputElement>
      handleImageUpload(fakeEvent)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Please login as admin')
      return
    }

    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          categoryId: formData.categoryId,
          images: formData.images,
          featured: formData.featured,
        }),
      })

      if (response.ok) {
        toast.success('Product created successfully!')
        router.push('/admin')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to create product')
      }
    } catch (error) {
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access this page</p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a new product for your store</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <Input
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images ({imagePreviews.length}/5)
                </label>
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading images...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="w-6 h-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Area */}
                {imagePreviews.length < 5 && (
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-primary-500 bg-primary-50 scale-105' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className={`transition-transform duration-200 ${dragActive ? 'scale-110' : ''}`}>
                      {dragActive ? (
                        <ImageIcon className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                      ) : (
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      )}
                    </div>
                    <p className={`mb-1 font-medium ${dragActive ? 'text-primary-700' : 'text-gray-600'}`}>
                      {dragActive 
                        ? 'Drop images here' 
                        : imagePreviews.length === 0 
                          ? 'Upload product images' 
                          : 'Add more images'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {dragActive 
                        ? 'Release to upload' 
                        : `PNG, JPG, WebP up to 10MB each. Max ${5 - imagePreviews.length} more images.`
                      }
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploading}
                    />
                    {!dragActive && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={isUploading}
                        className="btn-glow"
                      >
                        {isUploading ? 'Optimizing...' : 'Choose Files'}
                      </Button>
                    )}
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    The first image will be used as the main product image. Drag to reorder.
                  </p>
                )}
              </div>

              {/* Featured Product */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Mark as featured product
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading} className="btn-glow">
                  {loading ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}