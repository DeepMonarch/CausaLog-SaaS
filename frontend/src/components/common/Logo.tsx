interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export function CausalogLogo({ size = 28, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon — branching causality mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="7" fill="#00d4ff" fillOpacity="0.1" />
        <rect width="28" height="28" rx="7" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.4" />
        {/* Central node */}
        <circle cx="14" cy="14" r="2.5" fill="#00d4ff" />
        {/* Branch lines */}
        <line x1="14" y1="11.5" x2="14" y2="6" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="16.5" x2="9" y2="22" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="16.5" x2="19" y2="22" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
        {/* Endpoint nodes */}
        <circle cx="14" cy="5.5" r="1.5" fill="#00d4ff" fillOpacity="0.6" />
        <circle cx="9" cy="22.5" r="1.5" fill="#00b4d8" fillOpacity="0.6" />
        <circle cx="19" cy="22.5" r="1.5" fill="#00b4d8" fillOpacity="0.6" />
      </svg>

      {showText && (
        <span
          className="font-mono font-medium tracking-tight"
          style={{ fontSize: size * 0.65, color: '#e8eaf0' }}
        >
          Causalog
        </span>
      )}
    </div>
  )
}
