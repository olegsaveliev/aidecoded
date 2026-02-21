import { useState } from 'react'
import './HomeScreen.css'

const FILTERS = ['All', 'Interactive', 'Visual', 'Journey', 'Practical', 'Technical']

const CARDS = [
  {
    id: 'playground',
    icon: '\u{1F4AC}',
    title: 'Playground',
    description: 'Chat directly with AI and experiment with parameters in real time',
    tag: 'Interactive',
    tagColor: 'green',
    accent: '#0071e3',
    group: '🛠️ Tools',
  },
  {
    id: 'tokenizer',
    icon: '\u{1F524}',
    title: 'Tokenizer',
    description: 'See exactly how AI reads your text \u2014 broken into tokens in real time',
    tag: 'Visual',
    tagColor: 'purple',
    accent: '#8b5cf6',
    group: '🛠️ Tools',
  },
  {
    id: 'generation',
    icon: '\u26A1',
    title: 'Token Generation',
    description: 'Watch AI predict the next word live \u2014 Manual, Simulate or Automatic',
    tag: 'Interactive',
    tagColor: 'green',
    accent: '#eab308',
    group: '🛠️ Tools',
  },
  {
    id: 'how-llms-work',
    icon: '\u{1F9E0}',
    title: 'How LLMs Work',
    description: 'An interactive 5-stage journey from your prompt to the AI response',
    tag: 'Journey',
    tagColor: 'blue',
    accent: '#ec4899',
    group: '🧠 Foundations',
  },
  {
    id: 'model-training',
    icon: '\u{1F3D7}\uFE0F',
    title: 'Model Training',
    description: 'Discover how AI models like ChatGPT are built from scratch \u2014 data to deployment',
    tag: 'Journey',
    tagColor: 'blue',
    accent: '#f97316',
    group: '🧠 Foundations',
  },
  {
    id: 'prompt-engineering',
    icon: '✍️',
    title: 'Prompt Engineering',
    description: 'Learn how to write better prompts and get dramatically better results from any AI',
    tag: 'Practical',
    tagColor: 'green',
    accent: '#22c55e',
    group: '💡 Skills',
  },
  {
    id: 'context-engineering',
    icon: '🧩',
    title: 'Context Engineering',
    description: 'Learn how to give AI the right context to get dramatically better results every time',
    tag: 'Practical',
    tagColor: 'green',
    accent: '#00c7be',
    group: '💡 Skills',
  },
  {
    id: 'rag',
    icon: '🔍',
    title: 'RAG',
    description: 'How AI learns from YOUR documents — Retrieval Augmented Generation explained',
    tag: 'Journey',
    tagColor: 'blue',
    accent: '#5856D6',
    group: '⚡ Advanced',
  },
  {
    id: 'machine-learning',
    icon: '🤖',
    title: 'Machine Learning',
    description: 'How machines actually learn from data — the foundation of all modern AI',
    tag: 'Technical',
    tagColor: 'purple',
    accent: '#AF52DE',
    group: '🧠 Foundations',
  },
]

function HomeScreen({ onSelectTab }) {
  const [filter, setFilter] = useState('All')

  return (
    <div className="home-screen">
      <h2 className="home-welcome">What would you like to explore today?</h2>
      <div className="home-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`home-filter-btn${filter === f ? ' home-filter-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="home-grid">
        {CARDS.map((card, i) => {
          const visible = filter === 'All' || card.tag === filter
          return (
            <button
              key={card.id}
              className={`home-card${visible ? '' : ' home-card-hidden'}`}
              style={{ borderLeftColor: card.accent, animationDelay: `${i * 0.08}s` }}
              onClick={() => onSelectTab(card.id)}
              tabIndex={visible ? 0 : -1}
            >
              <span className={`home-card-tag home-tag-${card.tagColor}`}>{card.tag}</span>
              <span className="home-card-group">{card.group}</span>
              <span className="home-card-icon">{card.icon}</span>
              <span className="home-card-title">{card.title}</span>
              <span className="home-card-desc">{card.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default HomeScreen
