import { useState } from 'react'
import './HomeScreen.css'

const FILTER_COLORS = {
  All: '#1D1D1F',
  Interactive: '#0071E3',
  Visual: '#AF52DE',
  Journey: '#FF9500',
  Practical: '#34C759',
  Technical: '#5856D6',
}

const FILTERS = Object.keys(FILTER_COLORS)

const CARDS = [
  {
    id: 'playground',
    icon: '\u{1F4AC}',
    title: 'Playground',
    description: 'Chat directly with AI and experiment with parameters in real time',
    tag: 'Interactive',
    accent: '#0071e3',
    group: 'Tools',
  },
  {
    id: 'tokenizer',
    icon: '\u{1F524}',
    title: 'Tokenizer',
    description: 'See exactly how AI reads your text \u2014 broken into tokens in real time',
    tag: 'Visual',
    accent: '#8b5cf6',
    group: 'Tools',
  },
  {
    id: 'generation',
    icon: '\u26A1',
    title: 'Token Generation',
    description: 'Watch AI predict the next word live \u2014 Manual or Simulate',
    tag: 'Interactive',
    accent: '#eab308',
    group: 'Tools',
  },
  {
    id: 'how-llms-work',
    icon: '\u{1F9E0}',
    title: 'How LLMs Work',
    description: 'An interactive 5-stage journey from your prompt to the AI response',
    tag: 'Journey',
    accent: '#ec4899',
    group: 'Foundations',
  },
  {
    id: 'model-training',
    icon: '\u{1F3D7}\uFE0F',
    title: 'Model Training',
    description: 'Discover how AI models like ChatGPT are built from scratch \u2014 data to deployment',
    tag: 'Journey',
    accent: '#f97316',
    group: 'Foundations',
  },
  {
    id: 'prompt-engineering',
    icon: '✍️',
    title: 'Prompt Engineering',
    description: 'Learn how to write better prompts and get dramatically better results from any AI',
    tag: 'Practical',
    accent: '#22c55e',
    group: 'Skills',
  },
  {
    id: 'context-engineering',
    icon: '🧩',
    title: 'Context Engineering',
    description: 'Learn how to give AI the right context to get dramatically better results every time',
    tag: 'Practical',
    accent: '#00c7be',
    group: 'Skills',
  },
  {
    id: 'rag',
    icon: '🔍',
    title: 'RAG',
    description: 'How AI learns from YOUR documents — Retrieval Augmented Generation explained',
    tag: 'Journey',
    accent: '#5856D6',
    group: 'Advanced',
  },
  {
    id: 'machine-learning',
    icon: '🤖',
    title: 'Machine Learning',
    description: 'How machines actually learn from data — the foundation of all modern AI',
    tag: 'Technical',
    accent: '#AF52DE',
    group: 'Foundations',
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
            ✕
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
          <span className="home-no-results-icon">🔍</span>
          <span className="home-no-results-text">
            No modules found for &lsquo;{searchQuery}&rsquo;
          </span>
        </div>
      ) : (
        <div className="home-grid">
          {filteredCards.map((card, i) => (
            <button
              key={card.id}
              className="home-card"
              style={{ borderLeftColor: card.accent, animationDelay: `${i * 0.08}s` }}
              onClick={() => onSelectTab(card.id)}
            >
              <span className="home-card-top">
                <span className="home-card-group">{card.group}</span>
                <span className={`home-card-tag home-tag-${card.tag.toLowerCase()}`}>{card.tag}</span>
              </span>
              <span className="home-card-title">{card.title}</span>
              <span className="home-card-desc">{card.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomeScreen
