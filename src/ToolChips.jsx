import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ToolsIcon } from './ContentIcons.jsx'

function ToolChips({ tools }) {
  const [activeTool, setActiveTool] = useState(null)
  const [popupPos, setPopupPos] = useState(null)
  const chipRefs = useRef({})
  const popupRef = useRef(null)

  function openPopup(name) {
    const el = chipRefs.current[name]
    if (!el) return
    const r = el.getBoundingClientRect()
    setPopupPos({ left: r.left + r.width / 2, top: r.top - 8 })
    setActiveTool(name)
  }

  function closePopup() {
    setActiveTool(null)
    setPopupPos(null)
  }

  useEffect(() => {
    if (!activeTool) return
    function onDocClick(e) {
      const chip = chipRefs.current[activeTool]
      const popup = popupRef.current
      if (chip && chip.contains(e.target)) return
      if (popup && popup.contains(e.target)) return
      closePopup()
    }
    function onKey(e) {
      if (e.key === 'Escape') closePopup()
    }
    const id = setTimeout(() => {
      document.addEventListener('mousedown', onDocClick, true)
      document.addEventListener('keydown', onKey)
    }, 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', onDocClick, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [activeTool])

  const activeToolData = activeTool ? tools.find((t) => t.name === activeTool) : null

  return (
    <div className="mt-tools-section">
      <div className="mt-tools-title"><ToolsIcon size={14} /> Tools used in industry:</div>
      <div className="mt-tools-chips">
        {tools.map((tool) => (
          <div
            key={tool.name}
            ref={(el) => { chipRefs.current[tool.name] = el }}
            className={`mt-tool-chip ${activeTool === tool.name ? 'mt-tool-chip-active' : ''}`}
            onClick={() => activeTool === tool.name ? closePopup() : openPopup(tool.name)}
          >
            <span
              className="mt-tool-chip-dot"
              style={{ background: tool.color }}
            />
            <span className="mt-tool-chip-name">{tool.name}</span>
          </div>
        ))}
      </div>
      {activeTool && popupPos && activeToolData && createPortal(
        <div
          ref={popupRef}
          className="mt-tool-popup"
          style={{ left: popupPos.left, top: popupPos.top }}
        >
          <div className="mt-tool-popup-name" style={{ color: activeToolData.color }}>{activeToolData.name}</div>
          <div className="mt-tool-popup-desc">{activeToolData.desc}</div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default ToolChips
