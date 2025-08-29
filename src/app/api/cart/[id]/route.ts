import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
})

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  return payload ? payload.userId : null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quantity } = updateCartItemSchema.parse(body)

    const cartItem = await prisma.cartItem.update({
      where: {
        id: params.id,
        userId,
      },
      data: { quantity },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.cartItem.delete({
      where: {
        id: params.id,
        userId,
      },
    })

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}