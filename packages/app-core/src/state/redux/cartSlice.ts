import { CreateOrderItemRequest, Product } from '@grocery-delivery/shared'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface CartState {
  items: CreateOrderItemRequest[]
}

const initialState: CartState = {
  items: []
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find((item) => item.productId === action.payload.id)
      if (existing) {
        existing.quantity += 1
        return
      }
      state.items.push({ productId: action.payload.id, quantity: 1 })
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.productId !== action.payload)
    },
    changeQuantity(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      state.items = state.items
        .map((item) => item.productId === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item)
        .filter((item) => item.quantity > 0)
    },
    clearCart(state) {
      state.items = []
    }
  }
})

export const { addToCart, removeFromCart, changeQuantity, clearCart } = cartSlice.actions
export const cartReducer = cartSlice.reducer
