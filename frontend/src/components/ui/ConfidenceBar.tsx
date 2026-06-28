interface Props {
  value: number // 0-1
}

export function ConfidenceBar({ value }: Props) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? '#26de81' : pct >= 60 ? '#ff9f43' : '#ff6b6b'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono text-xs" style={{ color }}>{pct}%</span>
    </div>
  )
}