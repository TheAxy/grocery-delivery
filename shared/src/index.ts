export type UserRole = 'customer' | 'admin'

export interface UserPublic {
  id: number
  name: string
  email: string
  role: UserRole
  address: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  address: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: UserPublic
}

export interface Product {
  id: number
  name: string
  description: string
  category: string
  price: number
  imageUrl: string
}

export type OrderStatus = 'created' | 'cancelled'

export interface CreateOrderItemRequest {
  productId: number
  quantity: number
}

export interface CreateOrderRequest {
  deliveryAddress: string
  items: CreateOrderItemRequest[]
}

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: number
  userId: number
  deliveryAddress: string
  status: OrderStatus
  total: number
  createdAt: string
  items: OrderItem[]
}

export interface ApiError {
  message: string
}
