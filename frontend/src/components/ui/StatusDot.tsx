interface Props { status: string }

const colors: Record<string, string> = {
  pending:    '#4a5568',
  processing: '#ff9f43',
  running:    '#ff9f43',
  completed:  '#26de81',
  failed:     '#ff6b6b',
}

export function StatusDot({ status }: Props) {
  const color = colors[status] ?? '#4a5568'
  const isPulsing = status === 'processing' || status === 'running'
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${isPulsing ? 'animate-pulse' : ''}`}
      style={{ background: color, boxShadow: isPulsing ? `0 0 6px ${color}` : undefined }}
    />
  )
}