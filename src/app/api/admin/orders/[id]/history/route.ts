import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id

    // Check if order exists
    const orderExists = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true }
    })

    if (!orderExists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get status history
    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { changedAt: 'desc' }
    })

    return NextResponse.json({ history })

  } catch (error) {
    console.error('Order history fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order history' },
      { status: 500 }
    )
  }
}