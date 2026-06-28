import axios from 'axios'
import type { LoginCredentials, SignupCredentials, AuthResponse, User } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('causalog_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('causalog_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // FastAPI OAuth2 expects form data for /auth/token
    const formData = new URLSearchParams()
    formData.append('username', credentials.email)
    formData.append('password', credentials.password)

    const res = await axios.post<AuthResponse>(`${API_BASE}/auth/token`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return res.data
  },

  async signup(credentials: SignupCredentials): Promise<User> {
    const res = await api.post<User>('/auth/register', {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    })
    return res.data
  },

  async me(): Promise<User> {
    const res = await api.get<User>('/users/me')
    return res.data
  },

  logout() {
    localStorage.removeItem('causalog_token')
  },
}

export default api
