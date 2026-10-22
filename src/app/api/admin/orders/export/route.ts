import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { adminOrderWhere } from '@/lib/orders'
import { priceBreakdown } from '@/lib/utils'

const HEADER = ['Order ID', 'Date', 'Customer', 'Email', 'Status', 'Items', 'Subtotal', 'Tax', 'Total', 'Shipping address']

// Quotes every cell and neutralises spreadsheet formulas typed by customers (names, addresses)
const csvCell = (value: string | number) => {
  const text = String(value)
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminFromRequest(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orders = await prisma.order.findMany({
      where: adminOrderWhere(searchParams.get('status'), searchParams.get('search')),
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const rows = orders.map((order) => {
      const { subtotal, tax, total } = priceBreakdown(Number(order.total))
      return [
        order.id,
        order.createdAt.toISOString(),
        order.user.name ?? '',
        order.user.email,
        order.status,
        order.items.reduce((count, item) => count + item.quantity, 0),
        subtotal.toFixed(2),
        tax.toFixed(2),
        total.toFixed(2),
        order.shippingAddress,
      ]
    })

    // The BOM makes Excel read the file as UTF-8 (accented addresses)
    const csv = '﻿' + [HEADER, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
    const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Orders export error:', error)
    return NextResponse.json({ error: 'Failed to export orders' }, { status: 500 })
  }
}
