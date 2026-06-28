export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
