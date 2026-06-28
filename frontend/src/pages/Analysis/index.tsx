import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { analysisService } from '../../services/api.service'
import type { AnalysisDetail } from '../../types/api'
import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { ConfidenceBar } from '../../components/ui/ConfidenceBar'
import { StatusDot } from '../../components/ui/StatusDot'

export default function AnalysisPage() {
  const [params] = useSearchParams()
  const uploadId = params.get('upload')

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputId, setInputId] = useState(uploadId ?? '')

  const fetchAnalysis = async (id: string) => {
    if (!id.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await analysisService.getAnalysis(id.trim())
      setAnalysis(data)
    } catch {
      setError('Analysis not found. Check the upload ID.')
    } finally {
      setLoading(false)
    }
  }

  // Poll while running
  useEffect(() => {
    if (!uploadId) return
    fetchAnalysis(uploadId)
    const interval = setInterval(() => {
      if (analysis?.status === 'completed' || analysis?.status === 'failed') {
        clearInterval(interval)
        return
      }
      fetchAnalysis(uploadId)
    }, 3000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId, analysis?.status])

  const inference = analysis?.inference_result
  const clusters = analysis?.clusters?.clusters ?? []
  const anomalies = analysis?.anomalies
  const keywords = analysis?.keywords?.top_keywords ?? []

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">Pipeline output</p>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Analysis</h1>
      </div>

      {/* ID input if no upload param */}
      {!uploadId && (
        <div className="mb-6 flex gap-3">
          <input
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            placeholder="Paste upload ID…"
            className="input-auth flex-1"
          />
          <button
            onClick={() => fetchAnalysis(inputId)}
            className="btn-primary"
            style={{ width: 'auto', padding: '0 24px' }}
          >
            Load
          </button>
        </div>
      )}

      {loading && !analysis && (
        <div className="flex items-center gap-3 text-text-muted">
          <svg className="w-5 h-5 animate-spin text-accent-cyan" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-mono text-sm">Loading analysis…</span>
        </div>
      )}

      {error && <p className="text-severity-high font-mono text-sm">{error}</p>}

      {analysis && (
        <div className="space-y-6">
          {/* Status bar */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bg-border"
            style={{ background: '#0f1526' }}>
            <StatusDot status={analysis.status} />
            <span className="font-mono text-sm text-text-secondary capitalize">{analysis.status}</span>
            {analysis.status === 'running' && (
              <span className="font-mono text-xs text-text-muted">— pipeline is processing, auto-refreshing…</span>
            )}
            {analysis.status === 'completed' && analysis.inference_result && (
              <Link
                to={`/reports`}
                className="ml-auto font-mono text-xs text-accent-cyan hover:text-white transition-colors"
              >
                View full report →
              </Link>
            )}
          </div>

          {/* Root cause card */}
          {inference && (
            <div className="rounded-xl border border-bg-border p-6" style={{ background: '#0f1526' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">
                    Root Cause
                  </p>
                  <h2 className="text-lg font-semibold text-text-primary">{inference.root_cause}</h2>
                </div>
                <SeverityBadge severity={inference.severity} size="md" />
              </div>
              <div className="mb-4">
                <p className="font-mono text-xs text-text-muted mb-2">Confidence</p>
                <ConfidenceBar value={inference.confidence} />
              </div>
              <div className="mb-4">
                <p className="font-mono text-xs text-text-muted mb-2">Explanation</p>
                <p className="text-text-secondary text-sm leading-relaxed">{inference.explanation}</p>
              </div>
              {inference.suggested_fixes?.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-text-muted mb-2">Suggested fixes</p>
                  <ul className="space-y-2">
                    {inference.suggested_fixes.map((fix, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-mono text-xs text-accent-cyan mt-0.5 shrink-0">{i + 1}.</span>
                        <span className="text-text-secondary text-sm">{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Keywords + Anomalies row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-bg-border p-5" style={{ background: '#0f1526' }}>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Top Keywords</p>
              <div className="flex flex-wrap gap-2">
                {keywords.length > 0 ? keywords.map(kw => (
                  <span key={kw}
                    className="px-2 py-0.5 rounded font-mono text-xs text-accent-cyan"
                    style={{ background: 'rgba(0,212,255,0.08)' }}>
                    {kw}
                  </span>
                )) : <span className="text-text-muted text-xs font-mono">No keywords extracted</span>}
              </div>
            </div>

            <div className="rounded-xl border border-bg-border p-5" style={{ background: '#0f1526' }}>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Anomaly Detection</p>
              {anomalies ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-text-muted">Total anomalies</span>
                    <span className="font-mono text-xs text-severity-high">{anomalies.total_anomalies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-text-muted">Anomaly rate</span>
                    <span className="font-mono text-xs text-text-secondary">
                      {(anomalies.anomaly_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  {anomalies.anomalous_records.slice(0, 3).map((r, i) => (
                    <div key={i} className="mt-2 p-2 rounded bg-bg-elevated border border-bg-border">
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge severity={r.level} />
                        <span className="font-mono text-xs text-text-muted">line {r.line_number}</span>
                      </div>
                      <p className="font-mono text-xs text-text-secondary truncate">{r.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-text-muted text-xs font-mono">Not yet available</span>
              )}
            </div>
          </div>

          {/* Clusters */}
          {clusters.length > 0 && (
            <div className="rounded-xl border border-bg-border p-5" style={{ background: '#0f1526' }}>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
                Log Clusters ({clusters.length})
              </p>
              <div className="grid gap-3">
                {clusters.map(c => (
                  <div key={c.cluster_id}
                    className="p-4 rounded-lg border border-bg-border bg-bg-elevated">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-text-muted">Cluster {c.cluster_id}</span>
                      <SeverityBadge severity={c.severity} />
                      <span className="font-mono text-xs text-text-muted ml-auto">{c.size} entries</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {c.top_terms.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded font-mono text-xs text-text-muted"
                          style={{ background: '#1a2038' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {c.sample_messages.slice(0, 2).map((msg, i) => (
                      <p key={i} className="font-mono text-xs text-text-muted truncate leading-5">
                        · {msg}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="text-center py-16 text-text-muted">
          <p className="font-mono text-sm">Upload a log file from the Dashboard to see analysis results here.</p>
          <Link to="/dashboard" className="mt-3 inline-block font-mono text-xs text-accent-cyan hover:text-white transition-colors">
            Go to Dashboard →
          </Link>
        </div>
      )}
    </div>
  )
}