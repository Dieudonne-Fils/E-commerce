import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Prices arrive as numbers or as Decimal strings from JSON responses
export function formatPrice(value: number | string) {
  return priceFormatter.format(Number(value))
}

export const TAX_RATE = 0.1

// Orders and carts store the pre-tax amount; tax is added on top wherever a total is shown
export function priceBreakdown(subtotal: number) {
  const tax = subtotal * TAX_RATE
  return { subtotal, tax, total: subtotal + tax }
}