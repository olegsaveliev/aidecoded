import { Fragment } from 'react'
import { NAV_GROUPS, getGroupForTab } from './NavDropdown.jsx'
import './Breadcrumb.css'

function Breadcrumb({ activeTab, showHome, subPage, onGoHome, onGroupClick, onTabClick }) {
  // No breadcrumb on landing page (parent handles that)
  // Home screen: just "Home"
  if (showHome) {
    return (
      <nav className="breadcrumb">
        <span className="breadcrumb-current">Home</span>
      </nav>
    )
  }

  const group = getGroupForTab(activeTab)
  const tabItem = group?.items.find((item) => item.id === activeTab)

  // Extract short label for mobile (e.g. "Stage 3: Embeddings" → "Stage 3")
  const shortLabel = subPage ? subPage.replace(/:\s.+$/, '') : null
  const hasShortLabel = shortLabel && shortLabel !== subPage

  const items = [
    { label: 'Home', onClick: onGoHome },
    group && { label: group.label, onClick: () => onGroupClick?.(group.id) },
    tabItem && {
      label: tabItem.name,
      onClick: subPage ? () => onTabClick?.(activeTab) : null,
    },
    subPage && { label: subPage, shortLabel: hasShortLabel ? shortLabel : null },
  ].filter(Boolean)

  return (
    <nav className="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        const isSecondLast = i === items.length - 2
        const hideMobile = !isLast && !isSecondLast
        return (
          <Fragment key={i}>
            {i > 0 && (
              <span className={`breadcrumb-sep${hideMobile ? ' breadcrumb-hide-mobile' : ''}`}>
                &gt;
              </span>
            )}
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
              <span className={hideMobile ? 'breadcrumb-hide-mobile' : undefined}>
                {item.onClick ? (
                  <button className="breadcrumb-link" onClick={item.onClick}>
                    {item.label}
                  </button>
                ) : (
                  <span className="breadcrumb-text">{item.label}</span>
                )}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
