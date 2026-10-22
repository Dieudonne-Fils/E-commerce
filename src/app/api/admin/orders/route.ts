import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminFromRequest(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        }
      ]
    }

    // Build order clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'highest':
        orderBy = { total: 'desc' }
        break
      case 'lowest':
        orderBy = { total: 'asc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Admin orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}