'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false,
  onRatingChange 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const starRating = index + 1
        const isFilled = starRating <= Math.floor(rating)
        const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
            className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : isHalfFilled
                    ? 'fill-yellow-200 text-yellow-400'
                    : 'fill-gray-200 text-gray-300'
              } transition-colors`}
            />
          </button>
        )
      })}
      {rating > 0 && (
        <span className="text-sm text-gray-600 ml-2">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  )
}