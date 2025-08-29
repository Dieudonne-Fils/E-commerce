export interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
  avatar?: string
  phone?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  image?: string
  categoryId: string
  featured: boolean
  averageRating: number
  reviewCount: number
  category?: Category
  reviews?: Review[]
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  comment?: string
  user?: User
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  product?: Product
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  product?: Product
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  total: number
  shippingAddress: string
  createdAt: Date
  updatedAt: Date
  items?: OrderItem[]
  user?: User
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product?: Product
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  status: OrderStatus
  changedBy: string
  changedAt: Date
  note?: string
}