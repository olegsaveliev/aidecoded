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

export function TipIcon({ size = 16, color = '#eab308', className }) {
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

export function PackageIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </IconBase>
  )
}

export function ScissorsIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </IconBase>
  )
}

export function RulerIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconBase>
  )
}

export function ConstructionIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="2" y="6" width="20" height="8" rx="1" />
      <path d="M17 14v7" />
      <path d="M7 14v7" />
      <path d="M17 3v3" />
      <path d="M7 3v3" />
      <path d="M10 14v7" />
      <path d="M14 14v7" />
    </IconBase>
  )
}

export function BuildingIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="9" y1="22" x2="9" y2="18" />
      <line x1="15" y1="22" x2="15" y2="18" />
      <line x1="8" y1="6" x2="8.01" y2="6" />
      <line x1="16" y1="6" x2="16.01" y2="6" />
      <line x1="8" y1="10" x2="8.01" y2="10" />
      <line x1="16" y1="10" x2="16.01" y2="10" />
      <line x1="8" y1="14" x2="8.01" y2="14" />
      <line x1="16" y1="14" x2="16.01" y2="14" />
    </IconBase>
  )
}

export function CartIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </IconBase>
  )
}

export function HospitalIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </IconBase>
  )
}

export function LaptopIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </IconBase>
  )
}

export function GraduationIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M22 10l-10-5L2 10l10 5 10-5z" />
      <path d="M6 12v5c0 0 3 3 6 3s6-3 6-3v-5" />
      <line x1="22" y1="10" x2="22" y2="16" />
    </IconBase>
  )
}

export function GamepadIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </IconBase>
  )
}

export function TreeIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M12 22v-7" />
      <path d="M17 15H7l2-4H6l6-9 6 9h-3l2 4z" />
    </IconBase>
  )
}

export function PineTreeIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M12 22v-5" />
      <path d="M18 17H6l3-5H5l7-10 7 10h-4l3 5z" />
    </IconBase>
  )
}

export function LinkIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </IconBase>
  )
}

export function BankIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M12 3l9 7H3l9-7z" />
      <line x1="6" y1="10" x2="6" y2="21" />
      <line x1="10" y1="10" x2="10" y2="21" />
      <line x1="14" y1="10" x2="14" y2="21" />
      <line x1="18" y1="10" x2="18" y2="21" />
    </IconBase>
  )
}

export function CarIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2M15 17a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2" />
    </IconBase>
  )
}

export function PhoneIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </IconBase>
  )
}

export function FactoryIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M2 20V8l5 4V8l5 4V8l5 4V4h5v16H2z" />
    </IconBase>
  )
}

export function InboxIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </IconBase>
  )
}

export function BroomIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M12 2L12 12" />
      <path d="M5 12c0 5 3 10 7 10s7-5 7-10H5z" />
    </IconBase>
  )
}

export function MailIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22 6 12 13 2 6" />
    </IconBase>
  )
}

export function BriefcaseIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </IconBase>
  )
}

export function LayersIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </IconBase>
  )
}

export function UserIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconBase>
  )
}

export function RefreshIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </IconBase>
  )
}

export function CpuIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </IconBase>
  )
}

export function BugIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="M8 10H3" />
      <path d="M16 10h5" />
      <path d="M8 16H4" />
      <path d="M16 16h4" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </IconBase>
  )
}

export function TrendingUpIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </IconBase>
  )
}

export function RocketIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </IconBase>
  )
}

export function DumbbellIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M6.5 6.5h11" />
      <path d="M6.5 17.5h11" />
      <path d="M6.5 6.5v11" />
      <path d="M17.5 6.5v11" />
      <path d="M4 8v8a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z" />
      <path d="M22 8v8a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z" />
      <line x1="6.5" y1="12" x2="17.5" y2="12" />
    </IconBase>
  )
}

export function PlayIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </IconBase>
  )
}

export function GlobeIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconBase>
  )
}

export function CodeIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </IconBase>
  )
}

export function RepeatIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </IconBase>
  )
}

export function LockIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </IconBase>
  )
}

export function FlaskIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M9 3h6M10 3v6.5L3.5 20a1 1 0 0 0 .87 1.5h15.26a1 1 0 0 0 .87-1.5L14 9.5V3" />
    </IconBase>
  )
}

export function SlidersIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </IconBase>
  )
}

export function VaultIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <circle cx="12" cy="12" r="10" />
      <rect x="8" y="10" width="8" height="7" rx="1" />
      <path d="M10 10V8a2 2 0 0 1 4 0v2" />
    </IconBase>
  )
}

export function TerminalIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </IconBase>
  )
}

export function ShieldIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </IconBase>
  )
}

export function KeyIcon({ size = 16, color = '#8E8E93', className }) {
  return (
    <IconBase size={size} color={color} className={className}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </IconBase>
  )
}
