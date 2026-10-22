export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export const optimizeImage = (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      format = 'jpeg'
    } = options

    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      const aspectRatio = width / height

      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }
      
      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx!.drawImage(img, 0, 0, width, height)
      
      // Convert to base64
      const mimeType = `image/${format}`
      const base64 = canvas.toDataURL(mimeType, quality)
      
      resolve(base64)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export const validateImageFile = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    return 'Invalid file type. Please upload JPEG, PNG, or WebP images.'
  }

  if (file.size > maxSize) {
    return 'File size too large. Maximum size is 10MB.'
  }

  return null
}

export const generateImageThumbnail = (
  base64: string,
  size: number = 150
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      canvas.width = size
      canvas.height = size

      // Calculate crop dimensions for square thumbnail
      const { width, height } = img
      const cropSize = Math.min(width, height)
      const cropX = (width - cropSize) / 2
      const cropY = (height - cropSize) / 2

      ctx!.drawImage(
        img,
        cropX, cropY, cropSize, cropSize,
        0, 0, size, size
      )

      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }

    img.onerror = () => reject(new Error('Failed to generate thumbnail'))
    img.src = base64
  })
}
