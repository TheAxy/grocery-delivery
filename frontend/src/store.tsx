import { AuthResponse, CreateOrderItemRequest, Product, UserPublic } from '@grocery-delivery/shared'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

interface AppState {
  token: string | null
  user: UserPublic | null
  cart: CreateOrderItemRequest[]
  setAuth: (value: AuthResponse | null) => void
  refreshProfile: () => Promise<void>
  logout: () => void
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  changeQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

const AppContext = createContext<AppState | null>(null)

const tokenKey = 'grocery_token'
const userKey = 'grocery_user'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenKey))
  const [user, setUser] = useState<UserPublic | null>(() => {
    const raw = localStorage.getItem(userKey)
    return raw ? JSON.parse(raw) as UserPublic : null
  })
  const [cart, setCart] = useState<CreateOrderItemRequest[]>([])

  const setAuth = (value: AuthResponse | null) => {
    if (!value) {
      setToken(null)
      setUser(null)
      localStorage.removeItem(tokenKey)
      localStorage.removeItem(userKey)
      return
    }

    setToken(value.token)
    setUser(value.user)
    localStorage.setItem(tokenKey, value.token)
    localStorage.setItem(userKey, JSON.stringify(value.user))
  }

  const refreshProfile = async () => {
    if (!token) {
      return
    }

    const profile = await api.me(token)
    setUser(profile)
    localStorage.setItem(userKey, JSON.stringify(profile))
  }

  const logout = () => {
    setAuth(null)
    setCart([])
  }

  const addToCart = (product: Product) => {
    setCart((current) => {
      const item = current.find((entry) => entry.productId === product.id)
      if (!item) {
        return [...current, { productId: product.id, quantity: 1 }]
      }
      return current.map((entry) => entry.productId === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry)
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((current) => current.filter((item) => item.productId !== productId))
  }

  const changeQuantity = (productId: number, quantity: number) => {
    setCart((current) => current
      .map((item) => item.productId === productId ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0))
  }

  const clearCart = () => {
    setCart([])
  }

  useEffect(() => {
    if (!token) {
      setUser(null)
    }
  }, [token])

  const value = useMemo<AppState>(() => ({
    token,
    user,
    cart,
    setAuth,
    refreshProfile,
    logout,
    addToCart,
    removeFromCart,
    changeQuantity,
    clearCart
  }), [token, user, cart])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore(): AppState {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('Контекст не инициализирован')
  }
  return context
}
