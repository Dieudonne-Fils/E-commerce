import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

const ALLOWED_RANGES = [7, 30, 90]
const DAY_MS = 24 * 60 * 60 * 1000

// Days are bucketed in UTC so the series does not shift with the server's time zone
const dayKey = (date: Date) => date.toISOString().slice(0, 10)

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminFromRequest(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestedDays = Number(new URL(request.url).searchParams.get('days'))
    const days = ALLOWED_RANGES.includes(requestedDays) ? requestedDays : 30
    const todayStart = new Date(`${dayKey(new Date())}T00:00:00.000Z`)
    const since = new Date(todayStart.getTime() - (days - 1) * DAY_MS)

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: {
        total: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: { select: { id: true, name: true, category: { select: { name: true } } } },
          },
        },
      },
    })

    const ordersByStatus = Object.values(OrderStatus).map((status) => ({
      status,
      count: orders.filter((order) => order.status === status).length,
    }))

    // Cancelled orders were never paid: they count in the status breakdown only
    const paidOrders = orders.filter((order) => order.status !== 'CANCELLED')
    const daily = new Map(
      Array.from({ length: days }, (_, index) => [dayKey(new Date(since.getTime() + index * DAY_MS)), { revenue: 0, orders: 0 }])
    )
    const products = new Map<string, { name: string; units: number; revenue: number }>()
    const categories = new Map<string, number>()
    let unitsSold = 0

    for (const order of paidOrders) {
      const day = daily.get(dayKey(order.createdAt))
      if (day) {
        day.revenue += Number(order.total)
        day.orders += 1
      }
      for (const item of order.items) {
        const lineTotal = Number(item.price) * item.quantity
        const entry = products.get(item.product.id) ?? { name: item.product.name, units: 0, revenue: 0 }
        entry.units += item.quantity
        entry.revenue += lineTotal
        products.set(item.product.id, entry)
        categories.set(item.product.category.name, (categories.get(item.product.category.name) ?? 0) + lineTotal)
        unitsSold += item.quantity
      }
    }

    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0)

    return NextResponse.json({
      days,
      kpis: {
        revenue,
        orders: paidOrders.length,
        averageOrderValue: paidOrders.length > 0 ? revenue / paidOrders.length : 0,
        unitsSold,
      },
      daily: Array.from(daily, ([date, values]) => ({ date, ...values })),
      ordersByStatus,
      topProducts: Array.from(products, ([id, values]) => ({ id, ...values }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
      revenueByCategory: Array.from(categories, ([name, value]) => ({ name, revenue: value }))
        .sort((a, b) => b.revenue - a.revenue),
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
