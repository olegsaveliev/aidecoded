import './HomeScreen.css'

const CARDS = [
  {
    id: 'playground',
    icon: '\u{1F4AC}',
    title: 'Playground',
    description: 'Chat directly with AI and experiment with parameters in real time',
    tag: 'Interactive',
    tagColor: 'green',
    accent: '#0071e3',
  },
  {
    id: 'tokenizer',
    icon: '\u{1F524}',
    title: 'Tokenizer',
    description: 'See exactly how AI reads your text \u2014 broken into tokens in real time',
    tag: 'Visual',
    tagColor: 'purple',
    accent: '#8b5cf6',
  },
  {
    id: 'generation',
    icon: '\u26A1',
    title: 'Token Generation',
    description: 'Watch AI predict the next word live \u2014 Manual, Simulate or Automatic',
    tag: 'Interactive',
    tagColor: 'green',
    accent: '#eab308',
  },
  {
    id: 'how-llms-work',
    icon: '\u{1F9E0}',
    title: 'How LLMs Work',
    description: 'An interactive 5-stage journey from your prompt to the AI response',
    tag: 'Journey',
    tagColor: 'blue',
    accent: '#ec4899',
  },
  {
    id: 'model-training',
    icon: '\u{1F3D7}\uFE0F',
    title: 'Model Training',
    description: 'Discover how AI models like ChatGPT are built from scratch \u2014 data to deployment',
    tag: 'Journey',
    tagColor: 'blue',
    accent: '#f97316',
  },
  {
    id: 'prompt-engineering',
    icon: '✍️',
    title: 'Prompt Engineering',
    description: 'Learn how to write better prompts and get dramatically better results from any AI',
    tag: 'Practical',
    tagColor: 'green',
    accent: '#22c55e',
  },
]

function HomeScreen({ onSelectTab }) {
  return (
    <div className="home-screen">
      <h2 className="home-welcome">What would you like to explore today?</h2>
      <div className="home-grid">
        {CARDS.map((card, i) => (
          <button
            key={card.id}
            className="home-card"
            style={{ borderLeftColor: card.accent, animationDelay: `${i * 0.08}s` }}
            onClick={() => onSelectTab(card.id)}
          >
            <span className={`home-card-tag home-tag-${card.tagColor}`}>{card.tag}</span>
            <span className="home-card-icon">{card.icon}</span>
            <span className="home-card-title">{card.title}</span>
            <span className="home-card-desc">{card.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default HomeScreen
