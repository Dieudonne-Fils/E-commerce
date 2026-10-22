'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'
import { useAuth } from '@/contexts/AuthContext'
import { Review } from '@/types'
import toast from 'react-hot-toast'

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to write a review')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      })

      if (response.ok) {
        toast.success('Review submitted successfully!')
        setComment('')
        setRating(5)
        setShowReviewForm(false)
        fetchReviews()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl flex items-center">
          Customer Reviews
        </h2>
        {user && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="bg-secondary rounded-3xl p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="font-serif text-5xl text-foreground mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size="lg" />
            <p className="text-gray-600 mt-2">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-sm w-3">{stars}</span>
                  <Star className="w-4 h-4 fill-clay-500 text-clay-500" />
                </div>
                <div className="flex-1 bg-white rounded-full h-2">
                  <div
                    className="bg-clay-500 h-2 rounded-full"
                    style={{
                      width: `${reviews.length > 0 ? (ratingDistribution[stars as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {ratingDistribution[stars as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating 
                rating={rating} 
                interactive 
                onRatingChange={setRating}
                size="lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-input"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border bg-white p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-clay-100 rounded-full flex items-center justify-center">
                  {review.user?.avatar ? (
                    <img 
                      src={review.user.avatar} 
                      alt={review.user.name || 'User'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-clay-700 font-semibold">
                      {(review.user?.name || review.user?.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.user?.name || 'Anonymous'}
                      </h4>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <time className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}