import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/api.service'
import { authService } from '@/services/auth.service'

type Tab = 'info' | 'security'

export default function ProfilePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('info')

  // Profile edit
  const [name, setName] = useState(user?.name ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState('')

  // Password change
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters')
      return
    }
    setNameLoading(true)
    setNameError('')
    setNameSuccess(false)
    try {
      await userService.updateProfile(name.trim())
      setNameSuccess(true)
      // Refresh user from server by re-fetching
      await authService.me()
    } catch {
      setNameError('Failed to update profile. Please try again.')
    } finally {
      setNameLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('Passwords do not match')
      return
    }
    setPwLoading(true)
    setPwError('')
    setPwSuccess(false)
    try {
      await userService.changePassword(currentPw, newPw)
      setPwSuccess(true)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to change password.'
      setPwError(msg)
    } finally {
      setPwLoading(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Profile Info' },
    { id: 'security', label: 'Security' },
  ]

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Profile</h1>
      </div>

      <div className="max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-accent-cyan bg-opacity-10 border border-accent-cyan border-opacity-20 flex items-center justify-center">
            <span className="font-mono text-xl text-accent-cyan font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-text-primary">{user?.name}</p>
            <p className="font-mono text-xs text-text-muted">{user?.email}</p>
            <p className="font-mono text-xs text-text-muted mt-0.5">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl border border-bg-border" style={{ background: '#0a0e1a' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg font-mono text-xs transition-all duration-150
                ${tab === t.id
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Info tab */}
        {tab === 'info' && (
          <form onSubmit={handleUpdateName}>
            <div className="rounded-xl border border-bg-border p-6 space-y-5" style={{ background: '#0f1526' }}>
              <div>
                <label className="input-label">Full name</label>
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); setNameSuccess(false); setNameError('') }}
                  className="input-auth"
                  placeholder="Your name"
                />
                {nameError && <p className="input-error">{nameError}</p>}
                {nameSuccess && (
                  <p className="font-mono text-xs text-accent-green mt-1.5">Profile updated successfully.</p>
                )}
              </div>
              <div>
                <label className="input-label">Email address</label>
                <input
                  value={user?.email ?? ''}
                  disabled
                  className="input-auth opacity-50 cursor-not-allowed"
                />
                <p className="font-mono text-xs text-text-muted mt-1.5">Email cannot be changed.</p>
              </div>
              <button type="submit" disabled={nameLoading} className="btn-primary">
                {nameLoading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <form onSubmit={handleChangePassword}>
            <div className="rounded-xl border border-bg-border p-6 space-y-5" style={{ background: '#0f1526' }}>
              <div>
                <label className="input-label">Current password</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={e => { setCurrentPw(e.target.value); setPwError(''); setPwSuccess(false) }}
                  className="input-auth"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="input-label">New password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => { setNewPw(e.target.value); setPwError(''); setPwSuccess(false) }}
                  className="input-auth"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="input-label">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setPwError(''); setPwSuccess(false) }}
                  className="input-auth"
                  placeholder="••••••••"
                />
              </div>
              {pwError && <p className="input-error">{pwError}</p>}
              {pwSuccess && (
                <p className="font-mono text-xs text-accent-green">Password changed successfully.</p>
              )}
              <button type="submit" disabled={pwLoading} className="btn-primary">
                {pwLoading ? 'Changing…' : 'Change password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}