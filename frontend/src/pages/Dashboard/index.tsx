import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { uploadService, analysisService } from '@/services/api.service'
import { useAuth } from '@/context/AuthContext'
import { StatusDot } from '@/components/ui/StatusDot'
import type { Upload } from '@/types/api'

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<UploadState>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [recentUploads, setRecentUploads] = useState<Upload[]>([])

  useEffect(() => {
    uploadService.listUploads()
      .then(data => setRecentUploads(data.slice(0, 5)))
      .catch(() => {/* silent */})
  }, [state])

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['log', 'txt', 'csv'].includes(ext ?? '')) {
      setErrorMsg('Only .log, .txt, and .csv files are accepted.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File must be under 10 MB.')
      return
    }
    setSelectedFile(file)
    setErrorMsg('')
    setState('uploading')

    try {
      const upload = await uploadService.uploadFile(file)
      setState('analyzing')
      await analysisService.startAnalysis(upload.id)
      setState('done')
      setTimeout(() => navigate(`/analysis?upload=${upload.id}`), 800)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Upload failed. Please try again.'
      setErrorMsg(msg)
      setState('error')
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const isProcessing = state === 'uploading' || state === 'analyzing'

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">Root Cause Analysis</p>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-text-secondary text-sm mt-1">Upload a log file to start diagnosing issues.</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center text-center
          ${dragOver ? 'border-accent-cyan bg-accent-cyan bg-opacity-5' : 'border-bg-border hover:border-opacity-60'}
          ${isProcessing ? 'cursor-not-allowed opacity-80' : ''}
        `}
        style={{ minHeight: 260, background: '#0f1526' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".log,.txt,.csv"
          className="hidden"
          onChange={onInputChange}
          disabled={isProcessing}
        />

        {state === 'idle' || state === 'error' ? (
          <>
            <div
              className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4"
              style={{ boxShadow: dragOver ? '0 0 20px rgba(0,212,255,0.15)' : undefined }}
            >
              <svg className="w-7 h-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-text-primary font-medium mb-1">Drop your log file here</p>
            <p className="text-text-muted text-sm font-mono">
              or click to browse &nbsp;·&nbsp; .log .txt .csv up to 10 MB
            </p>
            {errorMsg && (
              <div className="mt-4 px-4 py-2 rounded-lg border border-severity-high border-opacity-30 bg-severity-high bg-opacity-5">
                <p className="text-severity-high text-xs font-mono">{errorMsg}</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <svg className="w-8 h-8 text-accent-cyan animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div>
              <p className="text-text-primary font-mono text-sm font-medium">
                {state === 'uploading' ? 'Uploading file…' : state === 'analyzing' ? 'Pipeline running…' : 'Complete — redirecting…'}
              </p>
              {selectedFile && (
                <p className="text-text-muted text-xs font-mono mt-1">{selectedFile.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              {['Upload', 'Preprocess', 'ML Pipeline', 'Inference', 'Report'].map((step, i) => {
                const done = (state === 'analyzing' && i === 0) || state === 'done'
                const active = (state === 'uploading' && i === 0) || (state === 'analyzing' && i > 0 && i < 4)
                return (
                  <div key={step} className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        done ? 'bg-accent-green' : active ? 'bg-accent-cyan animate-pulse' : 'bg-bg-border'
                      }`}
                    />
                    <span className={`font-mono text-xs ${done || active ? 'text-text-secondary' : 'text-text-muted'}`}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent uploads */}
      {recentUploads.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs text-text-muted uppercase tracking-widest">Recent uploads</h2>
            <Link to="/history" className="font-mono text-xs text-accent-cyan hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          <div className="rounded-xl border border-bg-border overflow-hidden" style={{ background: '#0f1526' }}>
            {recentUploads.map((upload, i) => (
              <div
                key={upload.id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-bg-elevated transition-colors
                  ${i < recentUploads.length - 1 ? 'border-b border-bg-border' : ''}`}
              >
                <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-mono text-xs text-text-primary flex-1 truncate">{upload.original_filename}</span>
                <span className="font-mono text-xs text-text-muted">{formatBytes(upload.file_size)}</span>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={upload.status} />
                  <span className="font-mono text-xs text-text-muted capitalize">{upload.status}</span>
                </div>
                {upload.status === 'completed' && (
                  <Link
                    to={`/analysis?upload=${upload.id}`}
                    className="font-mono text-xs text-accent-cyan hover:text-white transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature cards */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { icon: '⚡', title: 'Fast analysis', desc: 'Results in seconds via the ML pipeline' },
          { icon: '🔍', title: 'Explainable', desc: 'See exactly which rules and patterns triggered' },
          { icon: '🛠️', title: 'Actionable', desc: 'Concrete debugging steps for each root cause' },
        ].map(card => (
          <div key={card.title} className="rounded-xl border border-bg-border p-4" style={{ background: '#0f1526' }}>
            <div className="text-xl mb-2">{card.icon}</div>
            <h3 className="font-mono text-sm text-text-primary font-medium mb-1">{card.title}</h3>
            <p className="text-text-muted text-xs leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}