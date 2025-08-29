'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-gray-300 mb-2">📸</div>
          <p className="text-gray-500">No image available</p>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg">
          <img
            src={images[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
          />
        </div>
        
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
        
        {/* Zoom Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsZoomed(true)}
          className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-primary-500 scale-105 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl max-h-full">
            <img
              src={images[currentIndex]}
              alt={`${productName} - Full size`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation in Fullscreen */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
                
                {/* Fullscreen Thumbnails */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white bg-opacity-20 rounded-lg p-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-12 h-12 rounded overflow-hidden border transition-all duration-200 ${
                        index === currentIndex
                          ? 'border-white scale-110'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}