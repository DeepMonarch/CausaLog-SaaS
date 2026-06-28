import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { historyService } from '@/services/api.service'
import type { HistoryItem } from '@/types/api'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { StatusDot } from '@/components/ui/StatusDot'
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historyService.getHistory().then(setItems).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-text-muted">
        <svg className="w-5 h-5 animate-spin text-accent-cyan" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="font-mono text-sm">Loading history…</span>
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">Upload history</p>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">History</h1>
      </div>

      {!items.length ? (
        <div className="text-center py-20">
          <p className="text-text-muted font-mono text-sm mb-3">No uploads yet.</p>
          <Link to="/dashboard" className="font-mono text-xs text-accent-cyan hover:text-white transition-colors">
            Upload your first log file →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-bg-border overflow-hidden" style={{ background: '#0f1526' }}>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-bg-border">
            {['File', 'Size', 'Status', 'Root Cause', 'Severity', 'Date', ''].map((h, i) => (
              <div key={i} className={`font-mono text-xs text-text-muted uppercase tracking-widest
                ${i === 0 ? 'col-span-3' : i === 3 ? 'col-span-3' : 'col-span-1'}`}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {items.map(item => (
            <div
              key={item.upload_id}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-bg-border hover:bg-bg-elevated transition-colors"
            >
              <div className="col-span-3 flex items-center gap-2 min-w-0">
                <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-mono text-xs text-text-primary truncate">{item.original_filename}</span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="font-mono text-xs text-text-muted">{formatBytes(item.file_size)}</span>
              </div>
              <div className="col-span-1 flex items-center gap-1.5">
                <StatusDot status={item.status} />
                <span className="font-mono text-xs text-text-muted capitalize">{item.status}</span>
              </div>
              <div className="col-span-3 flex items-center">
                <span className="font-mono text-xs text-text-secondary truncate">
                  {item.root_cause ?? '—'}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                {item.severity ? <SeverityBadge severity={item.severity} /> : <span className="text-text-muted text-xs">—</span>}
              </div>
              <div className="col-span-1 flex items-center">
                <span className="font-mono text-xs text-text-muted">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                {item.status === 'completed' && (
                  <Link
                    to={`/analysis?upload=${item.upload_id}`}
                    className="font-mono text-xs text-accent-cyan hover:text-white transition-colors"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}