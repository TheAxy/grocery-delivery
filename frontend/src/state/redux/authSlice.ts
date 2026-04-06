import { AuthResponse, UserPublic } from '@grocery-delivery/shared'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  user: UserPublic | null
}

const tokenKey = 'grocery_token'
const userKey = 'grocery_user'

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

const initialState: AuthState = {
  token: localStorage.getItem(tokenKey),
  user: readUser()
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem(tokenKey, action.payload.token)
      localStorage.setItem(userKey, JSON.stringify(action.payload.user))
    },
    setUser(state, action: PayloadAction<UserPublic | null>) {
      state.user = action.payload
      if (action.payload) {
        localStorage.setItem(userKey, JSON.stringify(action.payload))
      } else {
        localStorage.removeItem(userKey)
      }
    },
    clearAuth(state) {
      state.token = null
      state.user = null
      localStorage.removeItem(tokenKey)
      localStorage.removeItem(userKey)
    }
  }
})

export const { setCredentials, setUser, clearAuth } = authSlice.actions
export const authReducer = authSlice.reducer
