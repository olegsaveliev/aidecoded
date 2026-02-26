import './ModuleIcon.css'

const ICON_PATHS = {
  playground: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  ),
  tokenizer: (
    <>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </>
  ),
  generation: (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  ),
  'how-llms-work': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </>
  ),
  'model-training': (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  'machine-learning': (
    <>
      <circle cx="12" cy="12" r="2" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="6" r="2" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <line x1="6" y1="6" x2="10" y2="11" />
      <line x1="18" y1="6" x2="14" y2="11" />
      <line x1="6" y1="18" x2="10" y2="13" />
      <line x1="18" y1="18" x2="14" y2="13" />
    </>
  ),
  'prompt-engineering': (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  'context-engineering': (
    <>
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M6 21V9a9 9 0 0 0 9 9" />
    </>
  ),
  rag: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  'agentic-ai': (
    <path d="M12 2a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4zM9 14h.01M15 14h.01M9 18h6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'rag-under-the-hood': (
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'fine-tuning': (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  'ai-city-builder': (
    <path d="M6 12h4M8 10v4M15 11h.01M18 11h.01M4 7h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'ai-lab-explorer': (
    <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7zM9 4v13M15 7v13" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'neural-networks': (
    <>
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="19" cy="19" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M7 12h5M14 12l3-5M14 12l3 5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'deep-learning': (
    <path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM4 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM20 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM4 12h3M17 12h3M12 6v3M12 15v3M6.5 11l3.5-3M14 8l3.5 3M6.5 13l3.5 3M14 16l3.5-3" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'prompt-heist': (
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'token-budget': (
    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2M9 2.3a10 10 0 0 0 0 19.4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'ai-ethics-tribunal': (
    <path d="M12 3v18M3 9h18M5 9l2 9M17 9l2 9M19 9c0 3.87-3.13 7-7 7s-7-3.13-7-7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'generative-ai': (
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-5.6 4.3 2.4-7.4L2.6 9.4h7.6L12 2z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'pm-simulator': (
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M12 12h4M12 16h4M8 12h.01M8 16h.01" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'ai-native-pm': (
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v4M10 14h4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'ai-safety': (
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2zM12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'ai-fluency': (
    <path d="M2 20h2v-4H2v4zM6 20h2v-8H6v8zM10 20h2v-12h-2v12zM14 20h2V8h-2v12zM18 20h2V4h-2v16z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'ai-startup-simulator': (
    <path d="M12 2C8 2 4 6 4 12s4 8 8 8 8-4 8-8S16 2 12 2zM12 8v4M12 16h.01M8 12l2-4 4 1 2 3-3 2-5-2z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'precision-recall': (
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'ai-in-production': (
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'alignment-game': (
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 9v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'choosing-ai-model': (
    <path d="M12 3v18M3 9l9-6 9 6M5 20h14M8 12H4l-1 5h18l-1-5h-4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'ollama': (
    <>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <polyline points="6 10 9 13 6 16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="16" x2="18" y2="16" strokeLinecap="round" />
    </>
  ),
  // Eye icon: intentionally uses 1–21 coordinate range (vs some icons using 2–22).
  // Fits the shared 24×24 viewBox and renders consistently at all sizes.
  'computer-vision': (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3 6l2 2M21 6l-2 2M3 18l2-2M21 18l-2-2" strokeLinecap="round" />
    </>
  ),
  'label-master': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
      <path d="M3 9h18M9 3v18" strokeLinecap="round" />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    </>
  ),
  'draw-and-deceive': (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      <circle cx="19" cy="5" r="1.5" strokeLinecap="round" />
    </>
  ),
  'agent-office': (
    <>
      <rect x="3" y="8" width="18" height="13" rx="1" />
      <path d="M3 8l9-5 9 5" />
      <rect x="7" y="12" width="3" height="3" rx="0.5" />
      <rect x="14" y="12" width="3" height="3" rx="0.5" />
      <rect x="10.5" y="15" width="3" height="6" />
      <circle cx="8.5" cy="6" r="1" />
      <circle cx="15.5" cy="6" r="1" />
    </>
  ),
  'claude-code': (
    <>
      <rect x="2" y="3" width="20" height="16" rx="2" />
      <path d="M6 8l3 3-3 3M11 14h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 2l1.5 1.5L19 5M21 1.5h-3" strokeLinecap="round" />
    </>
  ),
}

function ModuleIcon({ module, size = 24, className = '', style }) {
  const paths = ICON_PATHS[module]
  if (!paths) return null

  return (
    <svg
      className={`module-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths}
    </svg>
  )
}

export default ModuleIcon
