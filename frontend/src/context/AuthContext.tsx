import React, { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { AuthState, User } from '../types/auth'
import { authService } from '../services/auth.service'

// ── Actions ──────────────────────────────────────────────────────────────────
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }

// ── Reducer ───────────────────────────────────────────────────────────────────
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('causalog_token'),
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }

    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // On mount, verify token and fetch user if token exists
  useEffect(() => {
    const token = localStorage.getItem('causalog_token')
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    authService
      .me()
      .then((user) => dispatch({ type: 'SET_USER', payload: user }))
      .catch(() => {
        localStorage.removeItem('causalog_token')
        dispatch({ type: 'LOGOUT' })
      })
  }, [])

  const login = async (email: string, password: string) => {
    const { access_token } = await authService.login({ email, password })
    localStorage.setItem('causalog_token', access_token)
    const user = await authService.me()
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: access_token } })
  }

  const logout = () => {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
