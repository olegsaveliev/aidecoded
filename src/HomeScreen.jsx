import { useState } from 'react'
import ModuleIcon from './ModuleIcon.jsx'
import { CrossIcon } from './ContentIcons.jsx'
import './HomeScreen.css'

const FILTER_COLORS = {
  All: '#1D1D1F',
  Interactive: '#0071E3',
  Visual: '#AF52DE',
  Journey: '#FF9500',
  Practical: '#34C759',
  Technical: '#5856D6',
  Game: '#F59E0B',
}

const FILTERS = Object.keys(FILTER_COLORS)

const TAG_BORDER_COLORS = {
  Interactive: 'rgba(0, 113, 227, 0.5)',
  Visual: 'rgba(175, 82, 222, 0.5)',
  Journey: 'rgba(255, 149, 0, 0.5)',
  Practical: 'rgba(52, 199, 89, 0.5)',
  Technical: 'rgba(88, 86, 214, 0.5)',
  Game: 'rgba(245, 158, 11, 0.5)',
}

const CARDS = [
  {
    id: 'playground',
    title: 'Playground',
    description: 'Chat directly with AI and experiment with parameters in real time',
    tag: 'Interactive',
    accent: '#0071e3',
    group: 'Tools',
  },
  {
    id: 'tokenizer',
    title: 'Tokenizer',
    description: 'See exactly how AI reads your text \u2014 broken into tokens in real time',
    tag: 'Visual',
    accent: '#8b5cf6',
    group: 'Tools',
  },
  {
    id: 'generation',
    title: 'Token Generation',
    description: 'Watch AI predict the next word live \u2014 Manual or Simulate',
    tag: 'Interactive',
    accent: '#eab308',
    group: 'Tools',
  },
  {
    id: 'how-llms-work',
    title: 'How LLMs Work',
    description: 'An interactive 5-stage journey from your prompt to the AI response',
    tag: 'Journey',
    accent: '#ec4899',
    group: 'Foundations',
  },
  {
    id: 'model-training',
    title: 'Model Training',
    description: 'Discover how AI models like ChatGPT are built from scratch \u2014 data to deployment',
    tag: 'Journey',
    accent: '#f97316',
    group: 'Foundations',
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    description: 'Learn how to write better prompts and get dramatically better results from any AI',
    tag: 'Practical',
    accent: '#22c55e',
    group: 'Skills',
  },
  {
    id: 'context-engineering',
    title: 'Context Engineering',
    description: 'Learn how to give AI the right context to get dramatically better results every time',
    tag: 'Practical',
    accent: '#00c7be',
    group: 'Skills',
  },
  {
    id: 'rag',
    title: 'RAG',
    description: 'How AI learns from YOUR documents — Retrieval Augmented Generation explained',
    tag: 'Journey',
    accent: '#5856D6',
    group: 'Advanced',
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    description: 'How machines actually learn from data — the foundation of all modern AI',
    tag: 'Technical',
    accent: '#AF52DE',
    group: 'Foundations',
  },
  {
    id: 'fine-tuning',
    title: 'Fine-Tuning',
    description: 'Turn a general-purpose AI into a domain expert trained on your specific data and style',
    tag: 'Technical',
    accent: '#5856D6',
    group: 'Foundations',
  },
  {
    id: 'ai-city-builder',
    title: 'AI City Builder',
    description: 'Solve AI mysteries. Diagnose failures. Build your city with every case you crack.',
    tag: 'Game',
    accent: '#F59E0B',
    group: 'Play',
    isGame: true,
    difficulty: 'Beginner Friendly',
  },
  {
    id: 'ai-lab-explorer',
    title: 'AI Lab Explorer',
    description: 'Walk through an AI research lab. Unlock each room by completing hands-on challenges.',
    tag: 'Game',
    accent: '#F59E0B',
    group: 'Play',
    isGame: true,
    difficulty: 'Interactive',
  },
]

function HomeScreen({ onSelectTab }) {
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCards = CARDS.filter((card) => {
    const matchesFilter = filter === 'All' || card.tag === filter
    if (!searchQuery.trim()) return matchesFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      card.title.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q) ||
      card.tag.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="home-screen">
      <h2 className="home-welcome">What would you like to explore today?</h2>

      <div className="home-search-wrap">
        <svg className="home-search-icon" viewBox="0 0 20 20" fill="none" width="18" height="18">
          <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.8" />
          <line x1="13" y1="13" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          className="home-search-input"
          type="text"
          placeholder="Search tutorials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="home-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <CrossIcon size={12} color="#8E8E93" />
          </button>
        )}
      </div>

      <div className="home-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`home-filter-btn${filter === f ? ' home-filter-active' : ''}`}
            style={
              filter === f
                ? { background: FILTER_COLORS[f], color: '#fff' }
                : undefined
            }
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredCards.length === 0 ? (
        <div className="home-no-results">
          <span className="home-no-results-icon"><ModuleIcon module="rag" size={24} /></span>
          <span className="home-no-results-text">
            No modules found for &lsquo;{searchQuery}&rsquo;
          </span>
        </div>
      ) : (
        <div className="home-grid">
          {filteredCards.map((card, i) => (
            <button
              key={card.id}
              className={`home-card${card.isGame ? ' home-card-game' : ''}`}
              style={{
                borderLeftColor: TAG_BORDER_COLORS[card.tag] || card.accent,
                animationDelay: `${i * 0.08}s`,
                ...(card.isGame ? { border: '1.5px solid #F59E0B', borderLeft: '1.5px solid #F59E0B' } : {}),
              }}
              onClick={() => onSelectTab(card.id)}
            >
              <span className="home-card-top">
                <span className="home-card-group">{card.group}</span>
                {card.isGame ? (
                  <span className="home-card-game-badge">GAME</span>
                ) : (
                  <span className={`home-card-tag home-tag-${card.tag.toLowerCase()}`}>{card.tag}</span>
                )}
              </span>
              <span className="home-card-title"><ModuleIcon module={card.id} size={20} style={{ color: FILTER_COLORS[card.tag] }} />{card.title}</span>
              <span className="home-card-desc">{card.description}</span>
              {card.difficulty && (
                <span className="home-card-difficulty">{card.difficulty}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomeScreen
