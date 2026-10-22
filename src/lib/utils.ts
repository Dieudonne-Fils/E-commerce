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