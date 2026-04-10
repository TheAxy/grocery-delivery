import { AuthResponse, CreateOrderRequest, LoginRequest, Order, Product, ProductPayload, RegisterRequest, UserPublic } from '@grocery-delivery/shared'
import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'
import { api } from '../../api'

interface ResourceResult<T> {
  data: T
  loading: boolean
  error: string
  refetch: () => void
}

const tokenKey = 'grocery_token'
const userKey = 'grocery_user'
const productsCacheTtl = 60_000
const ordersCacheTtl = 60_000

function readUser(): UserPublic | null {
  const raw = localStorage.getItem(userKey)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as UserPublic
  } catch {
    localStorage.removeItem(userKey)
    return null
  }
}

class SessionStore {
  token = localStorage.getItem(tokenKey)
  user = readUser()
  isBootstrapping = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    if (this.token) {
      void this.bootstrap()
    }
  }

  private persist() {
    if (this.token) {
      localStorage.setItem(tokenKey, this.token)
    } else {
      localStorage.removeItem(tokenKey)
    }

    if (this.user) {
      localStorage.setItem(userKey, JSON.stringify(this.user))
    } else {
      localStorage.removeItem(userKey)
    }
  }

  applyAuth(response: AuthResponse) {
    this.token = response.token
    this.user = response.user
    this.persist()
  }

  async bootstrap() {
    if (!this.token) {
      return
    }

    this.isBootstrapping = true

    try {
      const profile = await api.me(this.token)
      runInAction(() => {
        this.user = profile
        this.persist()
      })
    } catch {
      runInAction(() => {
        this.logout()
      })
    } finally {
      runInAction(() => {
        this.isBootstrapping = false
      })
    }
  }

  async login(payload: LoginRequest) {
    const response = await api.login(payload)
    runInAction(() => {
      this.applyAuth(response)
    })
    return response
  }

  async register(payload: RegisterRequest) {
    const response = await api.register(payload)
    runInAction(() => {
      this.applyAuth(response)
    })
    return response
  }

  logout() {
    this.token = null
    this.user = null
    this.persist()
  }

  get isAuthenticated() {
    return Boolean(this.token)
  }

  get isAdmin() {
    return this.user?.role === 'admin'
  }
}

class CartStore {
  cart: { productId: number; quantity: number }[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  addToCart(product: Product) {
    const existing = this.cart.find((item) => item.productId === product.id)
    if (existing) {
      existing.quantity += 1
      return
    }
    this.cart.push({ productId: product.id, quantity: 1 })
  }

  removeFromCart(productId: number) {
    this.cart = this.cart.filter((item) => item.productId !== productId)
  }

  changeQuantity(productId: number, quantity: number) {
    this.cart = this.cart
      .map((item) => item.productId === productId ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0)
  }

  clearCart() {
    this.cart = []
  }
}

class CatalogStore {
  products: Product[] = []
  loading = false
  error = ''
  private cache = new Map<string, { data: Product[]; fetchedAt: number }>()
  private activeKey = ''

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private key(search = '', category = '') {
    return `${search.trim().toLowerCase()}::${category.trim().toLowerCase()}`
  }

  async loadProducts(search = '', category = '', force = false) {
    const key = this.key(search, category)
    this.activeKey = key
    const cached = this.cache.get(key)
    const freshEnough = cached && Date.now() - cached.fetchedAt < productsCacheTtl

    if (!force && freshEnough) {
      this.products = cached.data
      this.error = ''
      return cached.data
    }

    this.loading = true
    this.error = ''

    try {
      const data = await api.products(search, category)
      runInAction(() => {
        this.products = data
        this.cache.set(key, { data, fetchedAt: Date.now() })
      })
      return data
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить каталог'
      })
      throw error
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  invalidate() {
    this.cache.clear()
  }

  async createProduct(payload: ProductPayload) {
    const token = this.root.session.token
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    const product = await api.createProduct(payload, token)
    runInAction(() => {
      this.invalidate()
    })
    await this.loadProducts('', '', true)
    return product
  }

  async updateProduct(productId: number, payload: ProductPayload) {
    const token = this.root.session.token
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    const product = await api.updateProduct(productId, payload, token)
    runInAction(() => {
      this.invalidate()
    })
    await this.loadProducts('', '', true)
    return product
  }

  async deleteProduct(productId: number) {
    const token = this.root.session.token
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    const product = await api.deleteProduct(productId, token)
    runInAction(() => {
      this.invalidate()
    })
    await this.loadProducts('', '', true)
    return product
  }

  get categoryCount() {
    return new Set(this.products.map((product) => product.category)).size
  }
}

class OrdersStore {
  orders: Order[] = []
  loading = false
  error = ''
  private fetchedAt = 0

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  async loadOrders(force = false) {
    if (!this.root.session.token || this.root.session.isAdmin) {
      this.orders = []
      return []
    }

    const freshEnough = this.orders.length > 0 && Date.now() - this.fetchedAt < ordersCacheTtl
    if (!force && freshEnough) {
      return this.orders
    }

    this.loading = true
    this.error = ''

    try {
      const data = await api.orders(this.root.session.token)
      runInAction(() => {
        this.orders = data
        this.fetchedAt = Date.now()
      })
      return data
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить заказы'
      })
      throw error
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  invalidate() {
    this.fetchedAt = 0
  }

  async createOrder(payload: CreateOrderRequest) {
    const token = this.root.session.token
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    const order = await api.createOrder(payload, token)
    runInAction(() => {
      this.invalidate()
      this.root.cart.clearCart()
    })
    await this.loadOrders(true)
    return order
  }

  async cancelOrder(orderId: number) {
    const token = this.root.session.token
    if (!token) {
      throw new Error('Требуется авторизация')
    }
    const order = await api.cancelOrder(orderId, token)
    runInAction(() => {
      this.invalidate()
    })
    await this.loadOrders(true)
    return order
  }

  get activeOrdersCount() {
    return this.orders.filter((order) => order.status === 'created').length
  }
}

class RootStore {
  session = new SessionStore()
  cart = new CartStore()
  catalog = new CatalogStore(this)
  orders = new OrdersStore(this)

  logout() {
    this.session.logout()
    this.cart.clearCart()
    this.catalog.invalidate()
    this.orders.invalidate()
    this.orders.orders = []
  }
}

const RootStoreContext = createContext<RootStore | null>(null)

function useRootStore() {
  const store = useContext(RootStoreContext)
  if (!store) {
    throw new Error('MobX store не инициализирован')
  }
  return store
}

export function MobxAppStateProvider({ children }: PropsWithChildren) {
  const [store] = useState(() => new RootStore())
  return <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>
}

export function useMobxSessionModel() {
  const store = useRootStore()

  return {
    token: store.session.token,
    user: store.session.user,
    isAuthenticated: store.session.isAuthenticated,
    isAdmin: store.session.isAdmin,
    isBootstrapping: store.session.isBootstrapping,
    authError: '',
    login: store.session.login,
    register: store.session.register,
    logout: store.logout.bind(store)
  }
}

export function useMobxCartModel() {
  const store = useRootStore()

  return {
    cart: store.cart.cart,
    addToCart: store.cart.addToCart,
    removeFromCart: store.cart.removeFromCart,
    changeQuantity: store.cart.changeQuantity,
    clearCart: store.cart.clearCart
  }
}

export function useMobxProductsResource(search = '', category = ''): ResourceResult<Product[]> {
  const store = useRootStore()

  useEffect(() => {
    void store.catalog.loadProducts(search, category)
  }, [category, search, store])

  return {
    data: store.catalog.products,
    loading: store.catalog.loading,
    error: store.catalog.error,
    refetch: () => {
      void store.catalog.loadProducts(search, category, true)
    }
  }
}

export function useMobxOrdersResource(): ResourceResult<Order[]> {
  const store = useRootStore()

  useEffect(() => {
    void store.orders.loadOrders()
  }, [store])

  return {
    data: store.orders.orders,
    loading: store.orders.loading,
    error: store.orders.error,
    refetch: () => {
      void store.orders.loadOrders(true)
    }
  }
}

export function useMobxOrderActions() {
  const store = useRootStore()

  return {
    createOrder: store.orders.createOrder,
    cancelOrder: store.orders.cancelOrder,
    isCreating: store.orders.loading,
    isCancelling: store.orders.loading,
    error: store.orders.error
  }
}

export function useMobxAdminProductActions() {
  const store = useRootStore()

  return {
    createProduct: store.catalog.createProduct,
    updateProduct: store.catalog.updateProduct,
    deleteProduct: store.catalog.deleteProduct,
    isSaving: store.catalog.loading,
    isDeleting: store.catalog.loading,
    error: store.catalog.error
  }
}

export function useMobxSharedStats() {
  const store = useRootStore()

  useEffect(() => {
    if (store.session.isAdmin) {
      void store.catalog.loadProducts('', '')
      return
    }
    void store.orders.loadOrders()
  }, [store])

  return {
    user: store.session.user,
    orderCount: store.session.isAdmin ? 0 : store.orders.orders.length,
    activeOrdersCount: store.session.isAdmin ? 0 : store.orders.activeOrdersCount,
    productCount: store.catalog.products.length,
    categoryCount: store.catalog.categoryCount,
    loading: store.catalog.loading || store.orders.loading
  }
}

export const MobxObserver = observer
