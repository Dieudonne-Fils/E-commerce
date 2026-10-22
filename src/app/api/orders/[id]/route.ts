import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
        // Who changed the status stays internal: customers only see what happened and when
        statusHistory: {
          select: { id: true, status: true, changedAt: true },
          orderBy: { changedAt: 'asc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}