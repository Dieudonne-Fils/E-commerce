import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminFromRequest(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalProducts, totalUsers, totalOrders, revenue, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      // Cancelled orders were never paid, so they are left out of revenue (stored totals exclude tax)
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ])

    return NextResponse.json({
      totalProducts,
      totalUsers,
      totalOrders,
      revenue: Number(revenue._sum.total ?? 0),
      recentOrders,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
