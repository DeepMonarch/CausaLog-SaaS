import { useAuth } from '../../context/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Profile</h1>
      </div>
      <div className="max-w-md rounded-xl border border-bg-border p-6" style={{ background: '#0f1526' }}>
        <div className="w-12 h-12 rounded-full bg-accent-cyan bg-opacity-10 flex items-center justify-center mb-4">
          <span className="font-mono text-lg text-accent-cyan font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="font-mono text-xs text-text-muted mb-0.5">Name</p>
            <p className="font-mono text-sm text-text-primary">{user?.name}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-text-muted mb-0.5">Email</p>
            <p className="font-mono text-sm text-text-primary">{user?.email}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-text-muted mb-0.5">Member since</p>
            <p className="font-mono text-sm text-text-primary">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}