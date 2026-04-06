import { AuthResponse, CreateOrderRequest, LoginRequest, Order, Product, ProductPayload, RegisterRequest, UserPublic } from '@grocery-delivery/shared'
import { PropsWithChildren, useEffect } from 'react'
import { Provider } from 'react-redux'
import { appApi, useCancelOrderMutation, useCreateOrderMutation, useCreateProductMutation, useDeleteProductMutation, useGetMeQuery, useGetOrdersQuery, useGetProductsQuery, useLoginMutation, useRegisterMutation, useUpdateProductMutation } from './redux/api'
import { clearAuth, setCredentials, setUser } from './redux/authSlice'
import { addToCart, changeQuantity, clearCart, removeFromCart } from './redux/cartSlice'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import { reduxStore } from './redux/store'

interface ResourceResult<T> {
  data: T
  loading: boolean
  error: string
  refetch: () => void
}

function formatError(error: unknown): string {
  if (!error) {
    return ''
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const data = 'data' in error ? (error as { data?: unknown }).data : undefined
    const maybeMessage = data && typeof data === 'object' && 'message' in data
      ? String((data as { message?: string }).message)
      : ''
    return maybeMessage || 'Ошибка запроса'
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: string }).message
    return message || 'Ошибка запроса'
  }

  return 'Ошибка запроса'
}

export function AppStateProvider({ children }: PropsWithChildren) {
  return <Provider store={reduxStore}>{children}</Provider>
}

export function useSessionModel() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)
  const [loginMutation, loginState] = useLoginMutation()
  const [registerMutation, registerState] = useRegisterMutation()
  const profileQuery = useGetMeQuery(undefined, { skip: !token })

  useEffect(() => {
    if (profileQuery.data) {
      dispatch(setUser(profileQuery.data))
    }
  }, [dispatch, profileQuery.data])

  useEffect(() => {
    if (!token || !profileQuery.error || !('status' in profileQuery.error)) {
      return
    }

    if (profileQuery.error.status === 401) {
      dispatch(clearAuth())
      dispatch(appApi.util.resetApiState())
    }
  }, [dispatch, profileQuery.error, token])

  const login = async (payload: LoginRequest): Promise<AuthResponse> => {
    const response = await loginMutation(payload).unwrap()
    dispatch(setCredentials(response))
    return response
  }

  const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
    const response = await registerMutation(payload).unwrap()
    dispatch(setCredentials(response))
    return response
  }

  const logout = () => {
    dispatch(clearAuth())
    dispatch(clearCart())
    dispatch(appApi.util.resetApiState())
  }

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === 'admin',
    isBootstrapping: Boolean(token) && profileQuery.isFetching,
    authError: formatError(loginState.error || registerState.error || profileQuery.error),
    login,
    register,
    logout
  }
}

export function useCartModel() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)

  return {
    cart: items,
    addToCart: (product: Product) => dispatch(addToCart(product)),
    removeFromCart: (productId: number) => dispatch(removeFromCart(productId)),
    changeQuantity: (productId: number, quantity: number) => dispatch(changeQuantity({ productId, quantity })),
    clearCart: () => dispatch(clearCart())
  }
}

export function useProductsResource(search = '', category = ''): ResourceResult<Product[]> {
  const query = useGetProductsQuery({ search, category })

  return {
    data: query.data || [],
    loading: query.isLoading || query.isFetching,
    error: formatError(query.error),
    refetch: () => {
      void query.refetch()
    }
  }
}

export function useOrdersResource(): ResourceResult<Order[]> {
  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)
  const query = useGetOrdersQuery(undefined, { skip: !token || user?.role === 'admin' })

  return {
    data: query.data || [],
    loading: Boolean(token) && user?.role !== 'admin' && (query.isLoading || query.isFetching),
    error: formatError(query.error),
    refetch: () => {
      void query.refetch()
    }
  }
}

export function useOrderActions() {
  const [createOrderMutation, createOrderState] = useCreateOrderMutation()
  const [cancelOrderMutation, cancelOrderState] = useCancelOrderMutation()

  return {
    createOrder: (payload: CreateOrderRequest) => createOrderMutation(payload).unwrap(),
    cancelOrder: (orderId: number) => cancelOrderMutation(orderId).unwrap(),
    isCreating: createOrderState.isLoading,
    isCancelling: cancelOrderState.isLoading,
    error: formatError(createOrderState.error || cancelOrderState.error)
  }
}

export function useAdminProductActions() {
  const [createMutation, createState] = useCreateProductMutation()
  const [updateMutation, updateState] = useUpdateProductMutation()
  const [deleteMutation, deleteState] = useDeleteProductMutation()

  return {
    createProduct: (payload: ProductPayload) => createMutation(payload).unwrap(),
    updateProduct: (productId: number, payload: ProductPayload) => updateMutation({ productId, payload }).unwrap(),
    deleteProduct: (productId: number) => deleteMutation(productId).unwrap(),
    isSaving: createState.isLoading || updateState.isLoading,
    isDeleting: deleteState.isLoading,
    error: formatError(createState.error || updateState.error || deleteState.error)
  }
}

export function useSharedStats() {
  const user = useAppSelector((state) => state.auth.user) as UserPublic | null
  const orders = useOrdersResource()
  const products = useProductsResource()

  return {
    user,
    orderCount: user?.role === 'admin' ? 0 : orders.data.length,
    activeOrdersCount: user?.role === 'admin' ? 0 : orders.data.filter((order) => order.status === 'created').length,
    productCount: products.data.length,
    categoryCount: new Set(products.data.map((product) => product.category)).size,
    loading: orders.loading || products.loading
  }
}
