import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminFromRequest(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const page = Math.max(1, Math.floor(Number(searchParams.get('page'))) || 1)
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        // Explicit select: the password hash must never leave the server
        select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      }),
      prisma.user.count({ where }),
    ])

    // Same rule as revenue: cancelled orders are not money spent, and stored totals exclude tax
    const spend = await prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { in: users.map((user) => user.id) }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    })
    const spendByUser = new Map(spend.map((entry) => [entry.userId, Number(entry._sum.total ?? 0)]))

    return NextResponse.json({
      users: users.map(({ _count, ...user }) => ({
        ...user,
        orderCount: _count.orders,
        totalSpent: spendByUser.get(user.id) ?? 0,
      })),
      pagination: { page, limit: PAGE_SIZE, total, pages: Math.ceil(total / PAGE_SIZE) },
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}
