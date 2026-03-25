import { AuthResponse, CreateOrderRequest, LoginRequest, Order, Product, RegisterRequest, UserPublic } from '@grocery-delivery/shared'

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data ? String(data.message) : 'Ошибка запроса'
    throw new Error(message)
  }

  return data as T
}

export const api = {
  register(payload: RegisterRequest) {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  login(payload: LoginRequest) {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  me(token: string) {
    return request<UserPublic>('/api/auth/me', {}, token)
  },
  products(search = '', category = '') {
    const query = new URLSearchParams()
    if (search) {
      query.set('search', search)
    }
    if (category) {
      query.set('category', category)
    }
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return request<Product[]>(`/api/catalog/products${suffix}`)
  },
  createOrder(payload: CreateOrderRequest, token: string) {
    return request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token)
  },
  orders(token: string) {
    return request<Order[]>('/api/orders', {}, token)
  },
  cancelOrder(orderId: number, token: string) {
    return request<Order>(`/api/orders/${orderId}/cancel`, {
      method: 'PATCH'
    }, token)
  }
}
