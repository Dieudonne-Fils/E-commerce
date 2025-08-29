import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        products: [],
        categories: [],
        suggestions: []
      })
    }

    const searchTerm = query.trim().toLowerCase()

    // Search products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Calculate average ratings
    const productsWithRatings = products.map(product => {
      const reviews = product.reviews || []
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0
      
      return {
        ...product,
        averageRating,
        reviewCount: reviews.length,
        reviews: undefined // Remove reviews from response
      }
    })

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true
      },
      take: 3
    })

    // Generate search suggestions based on popular searches and existing data
    const suggestions: string[] = []
    
    // Add partial matches from product names
    const productSuggestions = await prisma.product.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        name: true
      },
      take: 3
    })

    productSuggestions.forEach(product => {
      const words = product.name.toLowerCase().split(' ')
      words.forEach(word => {
        if (word.startsWith(searchTerm) && word.length > searchTerm.length && !suggestions.includes(word)) {
          suggestions.push(word)
        }
      })
    })

    // Add category-based suggestions
    const categorySuggestions = await prisma.category.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        name: true
      },
      take: 2
    })

    categorySuggestions.forEach(category => {
      if (!suggestions.includes(category.name.toLowerCase())) {
        suggestions.push(category.name.toLowerCase())
      }
    })

    // Add some popular search terms if we have few suggestions
    const popularTerms = [
      'electronics', 'clothing', 'accessories', 'home', 'garden', 
      'sports', 'books', 'beauty', 'health', 'automotive'
    ]
    
    popularTerms.forEach(term => {
      if (term.includes(searchTerm) && !suggestions.includes(term) && suggestions.length < 5) {
        suggestions.push(term)
      }
    })

    return NextResponse.json({
      products: productsWithRatings,
      categories,
      suggestions: suggestions.slice(0, 5)
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}