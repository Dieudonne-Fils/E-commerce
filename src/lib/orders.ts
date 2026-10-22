import { OrderStatus, Prisma } from '@prisma/client'

const isOrderStatus = (value: string | null): value is OrderStatus =>
  !!value && Object.values(OrderStatus).includes(value as OrderStatus)

// Shared by the admin order list and its CSV export so both always show the same orders
export function adminOrderWhere(status: string | null, search: string | null): Prisma.OrderWhereInput {
  return {
    // An unknown status is ignored instead of reaching Prisma and failing the request
    status: isOrderStatus(status) ? status : undefined,
    OR: search
      ? [
          { id: { contains: search, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ]
      : undefined,
  }
}
