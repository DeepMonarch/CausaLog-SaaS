import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CausalogLogo } from '../components/common/Logo'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <NavIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    path: '/analysis',
    label: 'Analysis',
    icon: <NavIcon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: <NavIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  },
  {
    path: '/history',
    label: 'History',
    icon: <NavIcon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
]

const bottomItems: NavItem[] = [
  {
    path: '/profile',
    label: 'Profile',
    icon: <NavIcon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
  },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r border-bg-border transition-all duration-200 shrink-0"
        style={{
          width: collapsed ? 64 : 220,
          background: '#0a0e1a',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-bg-border">
          {!collapsed && <CausalogLogo size={24} />}
          {collapsed && <CausalogLogo size={24} showText={false} />}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="text-text-muted hover:text-text-secondary transition-colors ml-auto"
            aria-label="Toggle sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                 ${isActive
                   ? 'bg-accent-cyan bg-opacity-10 text-accent-cyan'
                   : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated'
                 }`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <span className={`shrink-0 ${isActive ? 'text-accent-cyan' : ''}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="font-mono text-sm truncate">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1 h-1 rounded-full bg-accent-cyan shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="py-4 px-2 border-t border-bg-border space-y-0.5">
          {bottomItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                 ${isActive
                   ? 'bg-accent-cyan bg-opacity-10 text-accent-cyan'
                   : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated'
                 }`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="font-mono text-sm truncate">{item.label}</span>}
            </NavLink>
          ))}

          {/* User + logout */}
          <div className="mt-2 px-3 py-2">
            {!collapsed && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-accent-cyan bg-opacity-20 flex items-center justify-center shrink-0">
                  <span className="font-mono text-xs text-accent-cyan font-bold">
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-text-primary truncate">{user?.name}</p>
                  <p className="font-mono text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-text-muted hover:text-severity-high transition-colors w-full"
              title={collapsed ? 'Sign out' : undefined}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!collapsed && <span className="font-mono text-xs">Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}