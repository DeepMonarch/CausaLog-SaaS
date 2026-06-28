interface Props {
  severity: string
  size?: 'sm' | 'md'
}

const config: Record<string, { label: string; color: string; bg: string }> = {
  HIGH:   { label: 'HIGH',   color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)' },
  MEDIUM: { label: 'MEDIUM', color: '#ff9f43', bg: 'rgba(255,159,67,0.12)'  },
  LOW:    { label: 'LOW',    color: '#26de81', bg: 'rgba(38,222,129,0.12)'  },
  INFO:   { label: 'INFO',   color: '#00d4ff', bg: 'rgba(0,212,255,0.12)'   },
  ERROR:  { label: 'ERROR',  color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)' },
  WARN:   { label: 'WARN',   color: '#ff9f43', bg: 'rgba(255,159,67,0.12)'  },
}

export function SeverityBadge({ severity, size = 'sm' }: Props) {
  const c = config[severity?.toUpperCase()] ?? config.INFO
  const padding = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize = size === 'sm' ? '10px' : '12px'
  return (
    <span
      className="font-mono font-semibold rounded-full uppercase tracking-widest"
      style={{ color: c.color, background: c.bg, padding, fontSize }}
    >
      {c.label}
    </span>
  )
}