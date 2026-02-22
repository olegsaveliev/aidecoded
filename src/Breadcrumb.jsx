import { Fragment } from 'react'
import { NAV_GROUPS, getGroupForTab } from './NavDropdown.jsx'
import './Breadcrumb.css'

function Breadcrumb({ activeTab, showHome, homeFilter, subPage, onGoHome, onGroupClick, onTabClick }) {
  // Home screen with group filter applied: Home > GroupName
  if (showHome && homeFilter) {
    return (
      <>
        {/* Desktop */}
        <nav className="breadcrumb breadcrumb-desktop">
          <button className="breadcrumb-link" onClick={onGoHome}>Home</button>
          <span className="breadcrumb-sep">&gt;</span>
          <span className="breadcrumb-current">{homeFilter}</span>
        </nav>
        {/* Mobile */}
        <nav className="breadcrumb breadcrumb-mobile">
          <button className="breadcrumb-back" onClick={onGoHome}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Home
          </button>
        </nav>
      </>
    )
  }

  // Home screen without filter: just "Home" (non-clickable)
  if (showHome) {
    return (
      <nav className="breadcrumb breadcrumb-desktop">
        <span className="breadcrumb-current">Home</span>
      </nav>
    )
  }

  // Module view: build full breadcrumb path
  const group = getGroupForTab(activeTab)
  const tabItem = group?.items.find((item) => item.id === activeTab)

  // Extract short label for mobile (e.g. "Stage 3: Embeddings" → "Stage 3")
  const shortLabel = subPage ? subPage.replace(/:\s.+$/, '') : null
  const hasShortLabel = shortLabel && shortLabel !== subPage

  // Build desktop items: Home > Group > Module [> SubPage]
  const items = [
    { label: 'Home', onClick: onGoHome },
    group && { label: group.label, onClick: () => onGroupClick?.(group.label) },
    tabItem && {
      label: tabItem.name,
      onClick: subPage ? () => onTabClick?.(activeTab) : null,
    },
    subPage && { label: subPage, shortLabel: hasShortLabel ? shortLabel : null },
  ].filter(Boolean)

  // Mobile back-link: go one level up
  let mobileBackLabel
  let mobileBackAction
  if (subPage) {
    // Stage → Entry Screen (module name)
    mobileBackLabel = tabItem?.name || 'Back'
    mobileBackAction = () => onTabClick?.(activeTab)
  } else if (group) {
    // Entry Screen → Home filtered to group
    mobileBackLabel = group.label
    mobileBackAction = () => onGroupClick?.(group.label)
  } else {
    // Fallback → Home
    mobileBackLabel = 'Home'
    mobileBackAction = onGoHome
  }

  return (
    <>
      {/* Desktop breadcrumb */}
      <nav className="breadcrumb breadcrumb-desktop">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <Fragment key={i}>
              {i > 0 && <span className="breadcrumb-sep">&gt;</span>}
              {isLast ? (
                <span className="breadcrumb-current">
                  {item.shortLabel ? (
                    <>
                      <span className="breadcrumb-label-full">{item.label}</span>
                      <span className="breadcrumb-label-short">{item.shortLabel}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                item.onClick ? (
                  <button className="breadcrumb-link" onClick={item.onClick}>
                    {item.label}
                  </button>
                ) : (
                  <span className="breadcrumb-text">{item.label}</span>
                )
              )}
            </Fragment>
          )
        })}
      </nav>

      {/* Mobile back-link */}
      <nav className="breadcrumb breadcrumb-mobile">
        <button className="breadcrumb-back" onClick={mobileBackAction}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          {mobileBackLabel}
        </button>
      </nav>
    </>
  )
}

export default Breadcrumb
