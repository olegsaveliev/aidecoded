function IconBase({ size = 16, color, className = '', children, ...props }) {
  return (
    <svg
      className={`content-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      {...props}
    >
      {children}
    </svg>
  )
}

export function CheckIcon({ size = 16, color = '#34C759', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </IconBase>
  )
}

export function CrossIcon({ size = 16, color = '#FF3B30', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconBase>
  )
}

export function TipIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </IconBase>
  )
}

export function WarningIcon({ size = 16, color = '#FF9500', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconBase>
  )
}

export function ToolsIcon({ size = 14, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </IconBase>
  )
}

export function TrophyIcon({ size = 32, color = '#FF9500', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M6 9H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="M6 2h12v7a6 6 0 0 1-12 0V2z" />
      <path d="M12 15v3" />
      <path d="M8 21h8" />
      <path d="M8 18h8" />
    </IconBase>
  )
}

export function SeedlingIcon({ size = 32, color = '#34C759', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M12 22V12" />
      <path d="M12 12C12 7 7 2 2 2c0 5 5 10 10 10z" />
      <path d="M12 15c0-5 5-10 10-10 0 5-5 10-10 10z" />
    </IconBase>
  )
}

export function TargetIcon({ size = 32, color = '#0071E3', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </IconBase>
  )
}

export function StarIcon({ size = 32, color = '#FF9500', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </IconBase>
  )
}

export function PencilIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <line x1="18" y1="2" x2="22" y2="6" />
      <path d="M7.5 20.5L4 4l16.5 3.5L11 14l-3.5 6.5z" />
    </IconBase>
  )
}

export function GearIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconBase>
  )
}

export function ChatIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </IconBase>
  )
}

export function RobotIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </IconBase>
  )
}

export function TheaterIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </IconBase>
  )
}

export function WrenchIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </IconBase>
  )
}

export function BookIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </IconBase>
  )
}

export function FileIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </IconBase>
  )
}

export function SkullIcon({ size = 16, color = '#FF3B30', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="12" cy="10" r="8" />
      <circle cx="9" cy="9" r="1.5" fill={color} stroke="none" />
      <circle cx="15" cy="9" r="1.5" fill={color} stroke="none" />
      <path d="M8 22v-4" />
      <path d="M12 22v-4" />
      <path d="M16 22v-4" />
      <path d="M8 18h8" />
    </IconBase>
  )
}

export function SparklesIcon({ size = 16, color = '#34C759', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M18 15l.75 2.25L21 18l-2.25.75L18 21l-.75-2.25L15 18l2.25-.75L18 15z" />
    </IconBase>
  )
}

export function QuestionIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconBase>
  )
}

export function FileCabinetIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="3" y="2" width="18" height="20" rx="2" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="10" y1="7" x2="14" y2="7" />
      <line x1="10" y1="17" x2="14" y2="17" />
    </IconBase>
  )
}

export function MemoIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </IconBase>
  )
}

export function BarChartIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </IconBase>
  )
}

export function SearchIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconBase>
  )
}

export function EyeIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  )
}

export function HashIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </IconBase>
  )
}

export function TypeIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </IconBase>
  )
}

export function ZapIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </IconBase>
  )
}
