import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await getAdminFromRequest(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateStatusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid status', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { status } = validation.data
    const { id: orderId } = await params

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [], // Final state
      'CANCELLED': [] // Final state
    }

    const allowedStatuses = validTransitions[existingOrder.status] || []
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${existingOrder.status} to ${status}` },
        { status: 400 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
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
      }
    })

    // Create status history record
    await prisma.orderStatusHistory.create({
      data: {
        orderId: orderId,
        status: status,
        changedBy: adminId,
        changedAt: new Date(),
        note: `Status updated by admin`
      }
    })

    // TODO: Send notification email to customer
    // This could be implemented with a service like SendGrid, Nodemailer, etc.
    console.log(`Order ${orderId} status updated to ${status} for user ${existingOrder.user.email}`)

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}