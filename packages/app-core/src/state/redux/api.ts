import {
  AuthResponse,
  CreateOrderRequest,
  LoginRequest,
  Order,
  Product,
  ProductPayload,
  RegisterRequest,
  UserPublic
} from '@grocery-delivery/shared'
import { BaseQueryFn, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createApi } from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'

type QueryError = {
  status: number | string
  data?: { message?: string }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState
    if (state.auth.token) {
      headers.set('Authorization', `Bearer ${state.auth.token}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  }
})

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, QueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error) {
    return { error: result.error as QueryError }
  }
  return result as { data: unknown }
}

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery,
  tagTypes: ['Profile', 'Products', 'Orders'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: 'api/auth/login', method: 'POST', body })
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: 'api/auth/register', method: 'POST', body })
    }),
    getMe: builder.query<UserPublic, void>({
      query: () => 'api/auth/me',
      providesTags: ['Profile']
    }),
    getProducts: builder.query<Product[], { search: string; category: string }>({
      query: ({ search, category }) => {
        const query = new URLSearchParams()
        if (search) {
          query.set('search', search)
        }
        if (category) {
          query.set('category', category)
        }
        const suffix = query.toString() ? `?${query.toString()}` : ''
        return `api/catalog/products${suffix}`
      },
      providesTags: ['Products']
    }),
    createProduct: builder.mutation<Product, ProductPayload>({
      query: (body) => ({ url: 'api/catalog/products', method: 'POST', body }),
      invalidatesTags: ['Products']
    }),
    updateProduct: builder.mutation<Product, { productId: number; payload: ProductPayload }>({
      query: ({ productId, payload }) => ({ url: `api/catalog/products/${productId}`, method: 'PUT', body: payload }),
      invalidatesTags: ['Products']
    }),
    deleteProduct: builder.mutation<Product, number>({
      query: (productId) => ({ url: `api/catalog/products/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Products']
    }),
    getOrders: builder.query<Order[], void>({
      query: () => 'api/orders',
      providesTags: ['Orders']
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (body) => ({ url: 'api/orders', method: 'POST', body }),
      invalidatesTags: ['Orders']
    }),
    cancelOrder: builder.mutation<Order, number>({
      query: (orderId) => ({ url: `api/orders/${orderId}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Orders']
    })
  })
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useCancelOrderMutation
} = appApi
