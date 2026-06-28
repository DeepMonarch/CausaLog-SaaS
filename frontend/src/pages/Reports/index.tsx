import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportService } from '../../services/api.service'
import type { Report } from '../../types/api'
import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { ConfidenceBar } from '../../components/ui/ConfidenceBar'

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selected, setSelected] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  reportService.listReports()
    .then((data: Report[]) => {
      setReports(data)
      if (data.length > 0) setSelected(data[0])
    })
    .catch(() => {
      // handle silently or set error state
    })
    .finally(() => setLoading(false))
}, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-text-muted">
        <svg className="w-5 h-5 animate-spin text-accent-cyan" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="font-mono text-sm">Loading reports…</span>
      </div>
    )
  }

  if (!reports.length) {
    return (
      <div className="p-8 text-center py-20">
        <p className="text-text-muted font-mono text-sm mb-3">No reports yet.</p>
        <Link to="/dashboard" className="font-mono text-xs text-accent-cyan hover:text-white transition-colors">
          Upload a log file to generate your first report →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen animate-fade-in" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
      {/* List panel */}
      <div className="w-72 border-r border-bg-border flex flex-col shrink-0" style={{ background: '#0a0e1a' }}>
        <div className="px-5 py-5 border-b border-bg-border">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Reports</p>
          <p className="font-mono text-xs text-text-muted mt-0.5">{reports.length} total</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {reports.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className={`w-full text-left px-5 py-3 border-b border-bg-border transition-colors
                ${selected?.id === r.id ? 'bg-accent-cyan bg-opacity-5' : 'hover:bg-bg-elevated'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity={r.severity} />
                <span className="font-mono text-xs text-text-muted ml-auto">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="font-mono text-xs text-text-primary truncate">{r.root_cause}</p>
              <p className="font-mono text-xs text-text-muted mt-0.5">
                {Math.round(r.confidence * 100)}% confidence
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">Root Cause</p>
                <h1 className="text-xl font-semibold text-text-primary">{selected.root_cause}</h1>
              </div>
              <SeverityBadge severity={selected.severity} size="md" />
            </div>

            <div className="rounded-xl border border-bg-border p-5 mb-5" style={{ background: '#0f1526' }}>
              <p className="font-mono text-xs text-text-muted mb-2">Confidence</p>
              <ConfidenceBar value={selected.confidence} />
            </div>

            {selected.summary && (
              <div className="rounded-xl border border-bg-border p-5 mb-5" style={{ background: '#0f1526' }}>
                <p className="font-mono text-xs text-text-muted mb-2">Summary</p>
                <p className="text-text-secondary text-sm leading-relaxed">{selected.summary}</p>
              </div>
            )}

            {selected.suggested_fixes && selected.suggested_fixes.length > 0 && (
              <div className="rounded-xl border border-bg-border p-5 mb-5" style={{ background: '#0f1526' }}>
                <p className="font-mono text-xs text-text-muted mb-3">Suggested Fixes</p>
                <ul className="space-y-3">
                  {selected.suggested_fixes.map((fix, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-mono text-xs text-accent-cyan mt-0.5 shrink-0 w-4">{i + 1}.</span>
                      <span className="text-text-secondary text-sm leading-relaxed">{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.evidence_summary && (
              <div className="rounded-xl border border-bg-border p-5" style={{ background: '#0f1526' }}>
                <p className="font-mono text-xs text-text-muted mb-3">Evidence Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selected.evidence_summary).map(([k, v]) => {
                    if (typeof v === 'object') return null
                    return (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="font-mono text-xs text-text-muted capitalize">
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-xs text-text-secondary">{String(v)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}