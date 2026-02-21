import { useState, useEffect, useRef, useCallback } from 'react'
import './NavDropdown.css'

const NAV_GROUPS = [
  {
    id: 'tools',
    label: 'Tools',
    emoji: '🛠️',
    items: [
      { id: 'playground', icon: '💬', name: 'Playground', tag: 'Interactive' },
      { id: 'tokenizer', icon: '🔤', name: 'Tokenizer', tag: 'Visual' },
      { id: 'generation', icon: '⚡', name: 'Generation', tag: 'Interactive' },
    ],
  },
  {
    id: 'foundations',
    label: 'Foundations',
    emoji: '🧠',
    items: [
      { id: 'how-llms-work', icon: '🧠', name: 'How LLMs Work', tag: 'Journey' },
      { id: 'model-training', icon: '🏗️', name: 'Model Training', tag: 'Journey' },
      { id: 'machine-learning', icon: '🤖', name: 'Machine Learning', tag: 'Technical' },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    emoji: '💡',
    items: [
      { id: 'prompt-engineering', icon: '✍️', name: 'Prompt Engineering', tag: 'Practical' },
      { id: 'context-engineering', icon: '🧩', name: 'Context Engineering', tag: 'Practical' },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    emoji: '⚡',
    items: [
      { id: 'rag', icon: '🔍', name: 'RAG', tag: 'Journey' },
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
  const [openGroup, setOpenGroup] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)
  const mobileRef = useRef(null)

  const activeGroup = getGroupForTab(activeTab)
  const closeAll = useCallback(() => {
    setOpenGroup(null)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        closeAll()
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target) && !e.target.closest('.nav-hamburger')) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeAll])

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

  // Close mobile menu on tab select
  function handleItemClick(tabId) {
    onSelectTab(tabId)
    closeAll()
    setMobileOpen(false)
  }

  function toggleGroup(groupId) {
    setOpenGroup((prev) => (prev === groupId ? null : groupId))
  }

  if (showHome) return null

  return (
    <>
      {/* Desktop nav */}
      <nav className="nav-dropdown-bar" ref={navRef}>
        {NAV_GROUPS.map((group) => {
          const isActive = activeGroup?.id === group.id
          const isOpen = openGroup === group.id
          return (
            <div key={group.id} className="nav-dropdown-group">
              <button
                className={`nav-dropdown-trigger${isActive ? ' nav-dropdown-trigger-active' : ''}`}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <span className="nav-dropdown-trigger-emoji">{group.emoji}</span>
                <span className="nav-dropdown-trigger-label">{group.label}</span>
                <svg className={`nav-dropdown-chevron${isOpen ? ' nav-dropdown-chevron-open' : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <div className="nav-dropdown-menu">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      className={`nav-dropdown-item${activeTab === item.id ? ' nav-dropdown-item-active' : ''}`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <span className="nav-dropdown-item-icon">{item.icon}</span>
                      <span className="nav-dropdown-item-name">{item.name}</span>
                      <span className="nav-dropdown-item-tag">{item.tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Mobile hamburger */}
      <button
        className={`nav-hamburger${mobileOpen ? ' nav-hamburger-active' : ''}`}
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
            {NAV_GROUPS.map((group) => (
              <div key={group.id} className="nav-mobile-group">
                <div className="nav-mobile-group-label">
                  <span>{group.emoji}</span> {group.label}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-mobile-item${activeTab === item.id ? ' nav-mobile-item-active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <span className="nav-mobile-item-icon">{item.icon}</span>
                    <span className="nav-mobile-item-name">{item.name}</span>
                    <span className="nav-mobile-item-tag">{item.tag}</span>
                  </button>
                ))}
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
