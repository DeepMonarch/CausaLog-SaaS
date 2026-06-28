import { useState } from 'react'

interface SettingToggle {
  id: string
  label: string
  description: string
  value: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingToggle[]>([
    {
      id: 'auto_analyze',
      label: 'Auto-start analysis on upload',
      description: 'Automatically begin analysis as soon as a file is uploaded.',
      value: true,
    },
    {
      id: 'email_notify',
      label: 'Email notifications',
      description: 'Receive an email when analysis completes. (Phase 3)',
      value: false,
    },
    {
      id: 'show_confidence',
      label: 'Show confidence scores',
      description: 'Display pipeline confidence percentages in analysis results.',
      value: true,
    },
    {
      id: 'show_raw_evidence',
      label: 'Show raw evidence panel',
      description: 'Show the full aggregated evidence object in analysis output.',
      value: false,
    },
  ])

  const toggle = (id: string) => {
    setSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, value: !s.value } : s))
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">Configuration</p>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Settings</h1>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Preferences */}
        <div className="rounded-xl border border-bg-border overflow-hidden" style={{ background: '#0f1526' }}>
          <div className="px-5 py-4 border-b border-bg-border">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Preferences</p>
          </div>
          <div className="divide-y divide-bg-border">
            {settings.map(s => (
              <div key={s.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-mono text-sm text-text-primary">{s.label}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5 leading-relaxed">{s.description}</p>
                </div>
                <button
                  onClick={() => toggle(s.id)}
                  className={`relative shrink-0 w-10 h-5 rounded-full transition-all duration-200 mt-0.5
                    ${s.value ? 'bg-accent-cyan' : 'bg-bg-elevated border border-bg-border'}`}
                  aria-pressed={s.value}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200
                      ${s.value ? 'left-5' : 'left-0.5'}`}
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="rounded-xl border border-bg-border p-5" style={{ background: '#0f1526' }}>
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">About</p>
          <div className="space-y-2">
            {[
              { label: 'Version', value: 'v0.1.0 (Phase 1)' },
              { label: 'Pipeline', value: 'Preprocessing → NLP → TF-IDF → K-Means → Isolation Forest → Inference' },
              { label: 'AI Layer', value: 'Rule-based (LLM in Phase 2)' },
              { label: 'Backend', value: 'FastAPI + PostgreSQL' },
            ].map(row => (
              <div key={row.label} className="flex justify-between gap-4">
                <span className="font-mono text-xs text-text-muted">{row.label}</span>
                <span className="font-mono text-xs text-text-secondary text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-severity-high border-opacity-20 p-5"
          style={{ background: 'rgba(255,107,107,0.03)' }}>
          <p className="font-mono text-xs text-severity-high uppercase tracking-widest mb-3">Danger zone</p>
          <p className="font-mono text-xs text-text-muted mb-4 leading-relaxed">
            Deleting your account is permanent and cannot be undone. All uploads, analyses, and reports will be lost.
          </p>
          <button
            className="font-mono text-xs text-severity-high border border-severity-high border-opacity-30 
              px-4 py-2 rounded-lg hover:bg-severity-high hover:bg-opacity-10 transition-colors"
            onClick={() => alert('Account deletion — Phase 3')}
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}