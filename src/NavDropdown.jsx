import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { createPortal } from 'react-dom'
import ModuleIcon from './ModuleIcon.jsx'
import { LockIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import { useRelease } from './ReleaseContext'
import './NavDropdown.css'

const NAV_GROUPS = [
  {
    id: 'tools',
    label: 'Tools',
    color: '#0071E3',
    items: [
      { id: 'playground', name: 'Playground', tag: 'Interactive' },
      { id: 'tokenizer', name: 'Tokenizer', tag: 'Visual' },
      { id: 'generation', name: 'Generation', tag: 'Interactive' },
    ],
  },
  {
    id: 'foundations',
    label: 'Foundations',
    color: '#AF52DE',
    items: [
      { id: 'how-llms-work', name: 'How LLMs Work', tag: 'Journey' },
      { id: 'model-training', name: 'Model Training', tag: 'Journey' },
      { id: 'machine-learning', name: 'Machine Learning', tag: 'Technical' },
      { id: 'neural-networks', name: 'Neural Networks', tag: 'Technical' },
      { id: 'computer-vision', name: 'Computer Vision', tag: 'Technical' },
      { id: 'precision-recall', name: 'Precision & Recall', tag: 'Technical' },
      { id: 'deep-learning', name: 'Deep Learning', tag: 'Technical' },
      { id: 'fine-tuning', name: 'Fine-Tuning', tag: 'Technical' },
      { id: 'generative-ai', name: 'Generative AI', tag: 'Journey' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    color: '#EF4444',
    items: [
      { id: 'prompt-injection', name: 'Prompt Injection', tag: 'Security' },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    color: '#34C759',
    items: [
      { id: 'prompt-engineering', name: 'Prompt Engineering', tag: 'Practical' },
      { id: 'context-engineering', name: 'Context Engineering', tag: 'Practical' },
      { id: 'ai-safety', name: 'AI Safety', tag: 'Practical' },
      { id: 'ai-fluency', name: 'AI Fluency', tag: 'Practical' },
      { id: 'choosing-ai-model', name: 'Choosing AI Model', tag: 'Practical' },
      { id: 'ollama', name: 'Run AI Locally', tag: 'Practical' },
      { id: 'claude-code', name: 'Claude Code', tag: 'Practical' },
      { id: 'spec-driven-dev', name: 'Spec-Driven Dev', tag: 'Practical' },
      { id: 'ai-coding-tools', name: 'AI Coding Tools', tag: 'Practical' },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    color: '#FF9500',
    items: [
      { id: 'rag', name: 'RAG', tag: 'Journey' },
      { id: 'agentic-ai', name: 'Agentic AI', tag: 'Technical' },
      { id: 'agent-teams', name: 'Agent Teams', tag: 'Technical' },
      { id: 'custom-agents', name: 'Custom Agents', tag: 'Technical' },
      { id: 'rag-under-the-hood', name: 'Why RAG Fails', tag: 'Technical' },
      { id: 'ai-in-production', name: 'AI in Production', tag: 'Technical' },
    ],
  },
  {
    id: 'play',
    label: 'Play',
    color: '#F59E0B',
    items: [
      { id: 'ai-city-builder', name: 'AI City Builder', tag: 'Game' },
      { id: 'ai-lab-explorer', name: 'AI Lab Explorer', tag: 'Game' },
      { id: 'prompt-heist', name: 'Prompt Heist', tag: 'Game' },
      { id: 'token-budget', name: 'Token Budget', tag: 'Game' },
      { id: 'ai-ethics-tribunal', name: 'AI Ethics Tribunal', tag: 'Game' },
      { id: 'pm-simulator', name: 'PM Simulator', tag: 'Game' },
      { id: 'ai-startup-simulator', name: 'AI Startup Simulator', tag: 'Game' },
      { id: 'alignment-game', name: 'The Alignment Game', tag: 'Game' },
      { id: 'label-master', name: 'Label Master', tag: 'Game' },
      { id: 'draw-and-deceive', name: 'Draw & Deceive', tag: 'Game' },
      { id: 'agent-office', name: 'Agent Office', tag: 'Game' },
      { id: 'model-training-tycoon', name: 'Training Tycoon', tag: 'Game' },
      { id: 'system-design-interview', name: 'System Design', tag: 'Game' },
    ],
  },
  {
    id: 'professional',
    label: 'Professional',
    color: '#0EA5E9',
    items: [
      { id: 'ai-native-pm', name: 'AI-Native PM', tag: 'Professional' },
      { id: 'ai-pm-workflows', name: 'AI-Native PM Workflows', tag: 'Professional' },
    ],
  },
]

function getGroupForTab(tabId) {
  for (const group of NAV_GROUPS) {
    if (group.items.some((item) => item.id === tabId)) {
      return group
    }
  }
  return null
}

function NavDropdown({ activeTab, onSelectTab, showHome }) {
  const { isModuleLocked } = useAuth()
  const { hiddenModules } = useRelease()
  const [openGroup, setOpenGroup] = useState(null)
  const [menuPos, setMenuPos] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)
  const mobileRef = useRef(null)
  const triggerRefs = useRef({})

  const activeGroup = getGroupForTab(activeTab)
  const closeAll = useCallback(() => {
    setOpenGroup(null)
    setMenuPos(null)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    if (!openGroup) return
    function handleClickOutside(e) {
      // Check if click is on a trigger button
      for (const ref of Object.values(triggerRefs.current)) {
        if (ref && ref.contains(e.target)) return
      }
      // Check if click is inside the portal menu
      const portalMenu = document.querySelector('.nav-dropdown-menu-portal')
      if (portalMenu && portalMenu.contains(e.target)) return
      closeAll()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openGroup, closeAll])

  // Close mobile on click outside
  useEffect(() => {
    if (!mobileOpen) return
    function handleClickOutside(e) {
      if (mobileRef.current && !mobileRef.current.contains(e.target) && !e.target.closest('.nav-hamburger')) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileOpen])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeAll()
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeAll])

  function handleItemClick(tabId) {
    onSelectTab(tabId)
    closeAll()
    setMobileOpen(false)
  }

  function toggleGroup(groupId) {
    if (openGroup === groupId) {
      closeAll()
    } else {
      const btn = triggerRefs.current[groupId]
      if (btn) {
        const rect = btn.getBoundingClientRect()
        setMenuPos({ top: rect.bottom + 6, left: rect.left })
      }
      setOpenGroup(groupId)
    }
  }

  const openGroupData = openGroup ? NAV_GROUPS.find((g) => g.id === openGroup) : null

  return (
    <>
      {/* Desktop nav */}
      <nav className={`nav-dropdown-bar${showHome ? ' nav-dropdown-bar-hidden' : ''}`} ref={navRef}>
        {NAV_GROUPS.filter(g => g.items.some(item => !hiddenModules.has(item.id))).map((group, i) => {
          const isActive = activeGroup?.id === group.id
          const isOpen = openGroup === group.id
          return (
            <Fragment key={group.id}>
              {i > 0 && <span className="nav-dropdown-sep" />}
              <div className="nav-dropdown-group">
                <button
                  ref={(el) => { triggerRefs.current[group.id] = el }}
                  className={`nav-dropdown-trigger${isActive ? ' nav-dropdown-trigger-active' : ''}`}
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                >
                  {group.label}
                </button>
              </div>
            </Fragment>
          )
        })}
      </nav>

      {/* Portal dropdown menu */}
      {!showHome && openGroupData && menuPos && createPortal(
        <div
          className="nav-dropdown-menu-portal"
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            zIndex: 9999,
          }}
        >
          <div className="nav-dropdown-menu">
            {openGroupData.items.filter(item => !hiddenModules.has(item.id)).map((item) => {
              const locked = isModuleLocked(item.id)
              return (
                <button
                  key={item.id}
                  className={`nav-dropdown-item${activeTab === item.id ? ' nav-dropdown-item-active' : ''}${locked ? ' nav-dropdown-item-locked' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <span className="nav-dropdown-item-icon"><ModuleIcon module={item.id} size={18} className={activeTab === item.id ? 'module-icon-active' : ''} /></span>
                  <span className="nav-dropdown-item-name">{item.name}</span>
                  {locked ? (
                    <span className="nav-dropdown-item-lock"><LockIcon size={14} color="var(--text-tertiary)" /></span>
                  ) : (
                    <span className="nav-dropdown-item-tag" data-tag={item.tag}>{item.tag}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}

      {/* Mobile hamburger */}
      <button
        className={`nav-hamburger${mobileOpen ? ' nav-hamburger-active' : ''}${showHome ? ' nav-hamburger-hidden' : ''}`}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Open navigation menu"
      >
        <span className="nav-hamburger-line" />
        <span className="nav-hamburger-line" />
        <span className="nav-hamburger-line" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="nav-mobile-overlay" ref={mobileRef}>
          <div className="nav-mobile-panel">
            {NAV_GROUPS.filter(g => g.items.some(item => !hiddenModules.has(item.id))).map((group) => (
              <div key={group.id} className="nav-mobile-group">
                <div className="nav-mobile-group-label">
                  <span style={{ color: group.color }}>{'\u2014'}</span> {group.label}
                </div>
                {group.items.filter(item => !hiddenModules.has(item.id)).map((item) => {
                  const locked = isModuleLocked(item.id)
                  return (
                    <button
                      key={item.id}
                      className={`nav-mobile-item${activeTab === item.id ? ' nav-mobile-item-active' : ''}${locked ? ' nav-mobile-item-locked' : ''}`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <span className="nav-mobile-item-icon"><ModuleIcon module={item.id} size={18} className={activeTab === item.id ? 'module-icon-active' : ''} /></span>
                      <span className="nav-mobile-item-name">{item.name}</span>
                      {locked ? (
                        <span className="nav-mobile-item-lock"><LockIcon size={14} color="var(--text-tertiary)" /></span>
                      ) : (
                        <span className="nav-mobile-item-tag" data-tag={item.tag}>{item.tag}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export { NAV_GROUPS, getGroupForTab }
export default NavDropdown
