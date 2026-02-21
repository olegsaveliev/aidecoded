import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { createPortal } from 'react-dom'
import './NavDropdown.css'

const NAV_GROUPS = [
  {
    id: 'tools',
    label: 'Tools',
    color: '#0071E3',
    items: [
      { id: 'playground', icon: '💬', name: 'Playground', tag: 'Interactive' },
      { id: 'tokenizer', icon: '🔤', name: 'Tokenizer', tag: 'Visual' },
      { id: 'generation', icon: '⚡', name: 'Generation', tag: 'Interactive' },
    ],
  },
  {
    id: 'foundations',
    label: 'Foundations',
    color: '#AF52DE',
    items: [
      { id: 'how-llms-work', icon: '🧠', name: 'How LLMs Work', tag: 'Journey' },
      { id: 'model-training', icon: '🏗️', name: 'Model Training', tag: 'Journey' },
      { id: 'machine-learning', icon: '🤖', name: 'Machine Learning', tag: 'Technical' },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    color: '#34C759',
    items: [
      { id: 'prompt-engineering', icon: '✍️', name: 'Prompt Engineering', tag: 'Practical' },
      { id: 'context-engineering', icon: '🧩', name: 'Context Engineering', tag: 'Practical' },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    color: '#FF9500',
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

  if (showHome) return null

  const openGroupData = openGroup ? NAV_GROUPS.find((g) => g.id === openGroup) : null

  return (
    <>
      {/* Desktop nav */}
      <nav className="nav-dropdown-bar" ref={navRef}>
        {NAV_GROUPS.map((group, i) => {
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
      {openGroupData && menuPos && createPortal(
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
            {openGroupData.items.map((item) => (
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
        </div>,
        document.body
      )}

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
                  <span style={{ color: group.color }}>{'\u2014'}</span> {group.label}
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
