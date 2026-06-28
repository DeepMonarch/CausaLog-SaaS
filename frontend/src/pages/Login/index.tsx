import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CausalogLogo } from '../../components/common/Logo'

interface FormState {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!values.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!values.password) {
    errors.password = 'Password is required'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  return errors
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/dashboard'

  const [values, setValues] = useState<FormState>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validate(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Invalid email or password'
      setErrors({ general: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base bg-grid flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5">
        <CausalogLogo size={28} />
        <span className="text-text-muted text-sm font-mono">
          New here?{' '}
          <Link to="/signup" className="btn-ghost">
            Create an account
          </Link>
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md animate-slide-up">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-accent-cyan glow-dot"
              style={{ color: '#00d4ff' }}
            />
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Secure sign-in
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-text-primary mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-text-secondary text-sm mb-8">
            Sign in to continue analyzing your logs.
          </p>

          {/* Redirect notice (when coming from protected route) */}
          {location.state?.from && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg border border-accent-orange border-opacity-30 bg-accent-orange bg-opacity-5">
              <svg className="w-4 h-4 text-accent-orange mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 3h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
              <p className="text-accent-orange text-xs font-mono">
                Sign in required to access that page.
              </p>
            </div>
          )}

          {/* General error */}
          {errors.general && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg border border-severity-high border-opacity-30 bg-severity-high bg-opacity-5">
              <svg className="w-4 h-4 text-severity-high mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-severity-high text-xs font-mono">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-card space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="input-label">
                  Email address
                </label>
                <div className="gradient-border rounded-lg">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={`input-auth ${errors.email ? 'border-severity-high' : ''}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="input-error">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="input-label mb-0">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-text-muted hover:text-accent-cyan transition-colors font-mono"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="gradient-border rounded-lg relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={values.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-auth pr-11 ${errors.password ? 'border-severity-high' : ''}`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="input-error">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-text-muted text-xs font-mono">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-cyan hover:text-white transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </main>

      {/* Bottom status bar — matches the dark terminal aesthetic */}
      <footer className="border-t border-bg-border px-8 py-3 flex items-center justify-between">
        <span className="font-mono text-xs text-text-muted">causalog v0.1.0</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green glow-dot" style={{ color: '#26de81' }} />
          <span className="font-mono text-xs text-text-muted">All systems operational</span>
        </div>
      </footer>
    </div>
  )
}
