import { useMemo } from 'react'
import ModuleIcon from './ModuleIcon.jsx'
import { getRandomModules } from './moduleData.js'

function SuggestedModules({ currentModuleId, onSwitchTab }) {
  const suggestions = useMemo(() => getRandomModules(currentModuleId, 3), [currentModuleId])

  if (!onSwitchTab || suggestions.length === 0) return null

  return (
    <>
      <div className="quiz-result-divider" />
      <div className="quiz-explore-section">
        <div className="quiz-explore-heading">What to learn next</div>
        <div className="quiz-explore-cards">
          {suggestions.map((m) => (
            <button
              key={m.id}
              className="quiz-explore-card"
              style={{ borderLeftColor: m.tagColor }}
              onClick={() => onSwitchTab(m.id)}
            >
              <span className="quiz-explore-card-title">
                <ModuleIcon module={m.id} size={20} style={{ color: m.tagColor }} />
                {m.title}
              </span>
              <span className="quiz-explore-card-desc">{m.description}</span>
              <span className="quiz-explore-card-tag" style={{ color: m.tagColor, borderColor: m.tagColor }}>
                {m.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default SuggestedModules
