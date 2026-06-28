import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { useAuth } from '../../context/AuthContext'
import { CausalogLogo } from '../../components/common/Logo'

interface FormState {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required'
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!values.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!values.password) {
    errors.password = 'Password is required'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = 'Include at least one uppercase letter'
  } else if (!/[0-9]/.test(values.password)) {
    errors.password = 'Include at least one number'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special char', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.pass).length

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]
  const strengthColor = ['', '#ff6b6b', '#ff9f43', '#00d4ff', '#26de81'][score]

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i <= score ? strengthColor : '#1e2840',
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs" style={{ color: strengthColor || '#4a5568' }}>
          {strengthLabel || 'Enter password'}
        </span>
        <div className="flex items-center gap-2">
          {checks.map((c) => (
            <span
              key={c.label}
              className="font-mono text-xs transition-colors"
              style={{ color: c.pass ? '#26de81' : '#4a5568' }}
            >
              {c.pass ? '✓' : '·'} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
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
      await authService.signup(values)
      // Auto-login after signup
      await login(values.email, values.password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to create account. Please try again.'
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
          Already have an account?{' '}
          <Link to="/login" className="btn-ghost">
            Sign in
          </Link>
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-accent-cyan glow-dot"
              style={{ color: '#00d4ff' }}
            />
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Free to start
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-text-primary mb-1 tracking-tight">
            Create your account
          </h1>
          <p className="text-text-secondary text-sm mb-8">
            Start diagnosing root causes in minutes.
          </p>

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
              {/* Name */}
              <div>
                <label htmlFor="name" className="input-label">
                  Full name
                </label>
                <div className="gradient-border rounded-lg">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Alex Chen"
                    className={`input-auth ${errors.name ? 'border-severity-high' : ''}`}
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <p className="input-error">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="input-label">
                  Work email
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
                  />
                </div>
                {errors.email && <p className="input-error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <div className="gradient-border rounded-lg relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-auth pr-11 ${errors.password ? 'border-severity-high' : ''}`}
                    aria-invalid={!!errors.password}
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
                {errors.password ? (
                  <p className="input-error">{errors.password}</p>
                ) : (
                  <PasswordStrength password={values.password} />
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="input-label">
                  Confirm password
                </label>
                <div className="gradient-border rounded-lg relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-auth pr-11 ${errors.confirmPassword ? 'border-severity-high' : ''}`}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
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
                {errors.confirmPassword && (
                  <p className="input-error">{errors.confirmPassword}</p>
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
                    Creating account…
                  </span>
                ) : (
                  'Create account'
                )}
              </button>

              {/* Terms */}
              <p className="text-center text-text-muted text-xs font-mono leading-relaxed">
                By signing up you agree to our{' '}
                <a href="#" className="text-accent-cyan hover:text-white transition-colors">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-accent-cyan hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Bottom status bar */}
      <footer className="border-t border-bg-border px-8 py-3 flex items-center justify-between">
        <span className="font-mono text-xs text-text-muted">causalog v0.1.0</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green" style={{ boxShadow: '0 0 6px #26de81' }} />
          <span className="font-mono text-xs text-text-muted">All systems operational</span>
        </div>
      </footer>
    </div>
  )
}
