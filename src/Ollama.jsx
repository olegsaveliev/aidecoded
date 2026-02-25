import React, { useState, useEffect, useRef, useCallback } from 'react'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon, PlayIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import Tooltip from './Tooltip.jsx'
import { ollamaQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './Ollama.css'

function CopyIcon({ size = 16, color = '#8E8E93' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

/* ── Per-stage tool chips ── */

const OL_TOOLS = [
  [
    { name: 'Ollama', color: '#34C759', desc: 'Run open-source LLMs locally with one command' },
    { name: 'Llama 4', color: '#34C759', desc: 'Meta\u2019s open-weight model family' },
    { name: 'Gemma 3', color: '#34C759', desc: 'Google\u2019s open model trained on Gemini data' },
    { name: 'Mistral', color: '#34C759', desc: 'European open model with strong reasoning' },
    { name: 'Phi-4', color: '#34C759', desc: 'Microsoft\u2019s compact high-quality model' },
    { name: 'Qwen3', color: '#34C759', desc: 'Alibaba\u2019s multilingual model family' },
    { name: 'DeepSeek-R1', color: '#34C759', desc: 'Reasoning-focused model that shows its thinking' },
    { name: 'Open WebUI', color: '#34C759', desc: 'ChatGPT-like interface for local models' },
  ],
  [
    { name: 'GGUF', color: '#34C759', desc: 'Compressed model format for local inference' },
    { name: 'llama.cpp', color: '#34C759', desc: 'C++ inference engine behind Ollama' },
    { name: 'Quantization', color: '#34C759', desc: 'Reducing model precision to save memory' },
    { name: 'Metal (Apple)', color: '#34C759', desc: 'GPU acceleration on Apple Silicon' },
    { name: 'CUDA', color: '#34C759', desc: 'NVIDIA GPU acceleration framework' },
    { name: 'ROCm', color: '#34C759', desc: 'AMD GPU acceleration framework' },
    { name: 'ollama pull', color: '#34C759', desc: 'Download a model without running it' },
    { name: 'ollama run', color: '#34C759', desc: 'Download (if needed) and start chatting' },
    { name: 'ollama list', color: '#34C759', desc: 'Show all downloaded models' },
  ],
  [
    { name: 'ollama search', color: '#34C759', desc: 'Search the model library from terminal' },
    { name: 'ollama pull', color: '#34C759', desc: 'Download a model without running it' },
    { name: 'Hugging Face GGUF', color: '#34C759', desc: 'Community-hosted quantised model files' },
    { name: 'Modelscope', color: '#34C759', desc: 'Chinese model hosting platform' },
    { name: 'ollama.com/library', color: '#34C759', desc: 'Full web-based model browser' },
    { name: 'Tags', color: '#34C759', desc: 'Model size variants (e.g. :3b, :7b, :70b)' },
    { name: 'Quantization levels', color: '#34C759', desc: 'Q4, Q5, Q8 precision trade-offs' },
  ],
  [
    { name: 'FROM', color: '#34C759', desc: 'Base model to build on' },
    { name: 'SYSTEM', color: '#34C759', desc: 'System prompt defining personality and rules' },
    { name: 'PARAMETER', color: '#34C759', desc: 'Model behaviour settings' },
    { name: 'TEMPLATE', color: '#34C759', desc: 'Full prompt format sent to the model' },
    { name: 'ADAPTER', color: '#34C759', desc: 'LoRA fine-tuned adapter path' },
    { name: 'MESSAGE', color: '#34C759', desc: 'Pre-loaded conversation history' },
    { name: 'ollama create', color: '#34C759', desc: 'Build a custom model from a Modelfile' },
    { name: 'ollama show --modelfile', color: '#34C759', desc: 'View any model\u2019s Modelfile' },
    { name: 'ollama push', color: '#34C759', desc: 'Share your custom model publicly' },
  ],
  [
    { name: 'temperature', color: '#34C759', desc: 'Controls randomness of output' },
    { name: 'num_ctx', color: '#34C759', desc: 'Context window size in tokens' },
    { name: 'top_p', color: '#34C759', desc: 'Nucleus sampling threshold' },
    { name: 'top_k', color: '#34C759', desc: 'Top-K token sampling limit' },
    { name: 'num_predict', color: '#34C759', desc: 'Maximum output length in tokens' },
    { name: 'repeat_penalty', color: '#34C759', desc: 'Penalises repeated tokens' },
    { name: 'seed', color: '#34C759', desc: 'Fixed seed for reproducible output' },
    { name: 'stop', color: '#34C759', desc: 'Stop sequences that end generation' },
    { name: 'GGUF quantization', color: '#34C759', desc: 'Model compression for smaller file sizes' },
    { name: 'num_gpu', color: '#34C759', desc: 'Number of GPU layers to offload' },
  ],
  [
    { name: 'ollama Python client', color: '#34C759', desc: 'Native Python library for Ollama' },
    { name: 'OpenAI SDK compat', color: '#34C759', desc: 'Use Ollama with the OpenAI Python SDK' },
    { name: 'LangChain', color: '#34C759', desc: 'Chain and agent framework integration' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'RAG and document QA framework' },
    { name: 'Open WebUI', color: '#34C759', desc: 'ChatGPT-like web interface for local models' },
    { name: 'ollama.js', color: '#34C759', desc: 'Official JavaScript client library' },
    { name: 'Streaming', color: '#34C759', desc: 'Real-time token-by-token responses' },
    { name: 'REST API', color: '#34C759', desc: 'HTTP endpoints on localhost:11434' },
    { name: 'localhost:11434', color: '#34C759', desc: 'Default Ollama API address' },
  ],
  [
    { name: 'Modelfile', color: '#34C759', desc: 'Recipe file for custom AI models' },
    { name: 'SYSTEM prompt', color: '#34C759', desc: 'Personality and behaviour instructions' },
    { name: 'ollama create', color: '#34C759', desc: 'Build a custom model from a Modelfile' },
    { name: 'ollama run', color: '#34C759', desc: 'Run your custom assistant' },
    { name: 'Local inference', color: '#34C759', desc: 'AI running entirely on your hardware' },
    { name: 'Open models', color: '#34C759', desc: 'Models with open weights anyone can run' },
  ],
]

/* ── Stages ── */

const STAGES = [
  { key: 'why-local', label: 'Why Local?' },
  { key: 'install', label: 'Install & Run' },
  { key: 'library', label: 'Model Library' },
  { key: 'modelfile', label: 'The Modelfile' },
  { key: 'parameters', label: 'Parameters' },
  { key: 'api', label: 'The API' },
  { key: 'build', label: 'Build Assistant' },
]

const OL_NEXT_LABELS = [
  'Install & Run →',
  'Model Library →',
  'The Modelfile →',
  'Parameters →',
  'The API →',
  'Build Assistant →',
  'See your results →',
]

const STAGE_TOOLTIPS = {
  'why-local': 'Why run AI locally at all?',
  'install': 'Installing Ollama and running your first model',
  'library': 'The model library — what can you run?',
  'modelfile': 'The Modelfile — customising your model',
  'parameters': 'Parameters — temperature, context and more',
  'api': 'The API — connecting apps to your local AI',
  'build': 'Build your own assistant',
}

/* ── Terminal component ── */

function Terminal({ lines, title = 'Terminal', className = '', animate = false }) {
  const [visibleLines, setVisibleLines] = useState(animate ? [] : lines)
  const [typingLine, setTypingLine] = useState(animate ? 0 : -1)
  const [typedChars, setTypedChars] = useState(0)
  const timersRef = useRef([])
  const bodyRef = useRef(null)

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!animate) {
      setVisibleLines(lines)
      setTypingLine(-1)
      return
    }
    clearTimers()
    setVisibleLines([])
    setTypingLine(0)
    setTypedChars(0)

    let delay = 0
    lines.forEach((line, i) => {
      const isCommand = line.type === 'command'
      const text = line.text || ''

      if (isCommand && text.length > 0) {
        // Type command char by char
        timersRef.current.push(setTimeout(() => {
          setTypingLine(i)
          setTypedChars(0)
        }, delay))
        delay += 100

        for (let c = 1; c <= text.length; c++) {
          const charDelay = delay
          timersRef.current.push(setTimeout(() => {
            setTypedChars(c)
          }, charDelay))
          delay += 35
        }
        delay += 200
        timersRef.current.push(setTimeout(() => {
          setVisibleLines(prev => [...prev, line])
          setTypingLine(i + 1)
          setTypedChars(0)
        }, delay))
        delay += 100
      } else {
        timersRef.current.push(setTimeout(() => {
          setVisibleLines(prev => [...prev, line])
        }, delay))
        delay += line.type === 'blank' ? 50 : 80
      }
    })

    timersRef.current.push(setTimeout(() => {
      setTypingLine(-1)
    }, delay))

    return clearTimers
  }, [animate, lines])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [visibleLines, typedChars])

  const currentTypingText = typingLine >= 0 && typingLine < lines.length && lines[typingLine].type === 'command'
    ? lines[typingLine].text.slice(0, typedChars)
    : null

  return (
    <div className={`ol-terminal ${className}`}>
      <div className="ol-terminal-chrome">
        <span className="ol-dot ol-dot-red" />
        <span className="ol-dot ol-dot-amber" />
        <span className="ol-dot ol-dot-green" />
        <span className="ol-terminal-title">{title}</span>
      </div>
      <div className="ol-terminal-body" ref={bodyRef}>
        {visibleLines.map((line, i) => {
          if (line.type === 'blank') return <div key={i} className="ol-blank-line">&nbsp;</div>
          if (line.type === 'command') return (
            <div key={i} className="ol-prompt">
              <span className="ol-prompt-symbol">$ </span>{line.text}
            </div>
          )
          if (line.type === 'comment') return <div key={i} className="ol-comment">{line.text}</div>
          if (line.type === 'error') return <div key={i} className="ol-error">{line.text}</div>
          if (line.type === 'path') return <div key={i} className="ol-path">{line.text}</div>
          if (line.type === 'success') return <div key={i} className="ol-success">{line.text}</div>
          if (line.type === 'highlight') return <div key={i} className="ol-highlight">{line.text}</div>
          return <div key={i} className="ol-output">{line.text}</div>
        })}
        {currentTypingText !== null && (
          <div className="ol-prompt ol-typing-line">
            <span className="ol-prompt-symbol">$ </span>
            {currentTypingText}
            <span className="ol-cursor" />
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Stage 0: Why Local? ── */

function WhyLocalViz({ active }) {
  const [showDots, setShowDots] = useState(false)
  const [cloudStep, setCloudStep] = useState(0)
  const [localStep, setLocalStep] = useState(0)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) {
      setShowDots(false)
      setCloudStep(0)
      setLocalStep(0)
      clearTimers()
      return
    }
    setShowDots(true)
    const cloudLabels = ['Your query leaves', 'API costs', 'Provider uptime', 'Rate limits', 'Response returns']
    const localLabels = ['Stays on your machine', 'Zero cost', 'Always available', 'No limits', 'Response from localhost']

    cloudLabels.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setCloudStep(i + 1), 800 * (i + 1)))
    })
    localLabels.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setLocalStep(i + 1), 800 * (i + 1)))
    })

    return clearTimers
  }, [active])

  const cloudLabels = ['Your query leaves', 'API costs', 'Provider uptime', 'Rate limits', 'Response returns']
  const localLabels = ['Stays on your machine', 'Zero cost', 'Always available', 'No limits', 'Response from localhost']

  const stats = [
    { icon: <CheckIcon size={16} color="#34C759" />, label: '$0 per token' },
    { icon: <CheckIcon size={16} color="#34C759" />, label: '100% private' },
    { icon: <CheckIcon size={16} color="#34C759" />, label: 'Works offline' },
    { icon: <CheckIcon size={16} color="#34C759" />, label: 'No rate limits' },
  ]

  return (
    <div className="ol-why-local-viz">
      <div className="ol-comparison-panels">
        <div className="ol-panel ol-panel-cloud">
          <div className="ol-panel-header">Cloud AI</div>
          <div className="ol-flow-diagram">
            <div className="ol-flow-node">Your laptop</div>
            <div className="ol-flow-arrow">&rarr;</div>
            <div className="ol-flow-node ol-flow-internet">Internet</div>
            <div className="ol-flow-arrow">&rarr;</div>
            <div className="ol-flow-node">Cloud Server</div>
          </div>
          <div className="ol-flow-labels">
            {cloudLabels.map((label, i) => (
              <span key={i} className={`ol-flow-label ${i < cloudStep ? 'ol-visible' : ''}`}>{label}</span>
            ))}
          </div>
        </div>

        <div className="ol-panel ol-panel-local">
          <div className="ol-panel-header">Local AI with Ollama</div>
          <div className="ol-flow-diagram">
            <div className="ol-flow-node">Your laptop</div>
            <div className="ol-flow-arrow">&rarr;</div>
            <div className="ol-flow-node ol-flow-ollama">Ollama</div>
            <div className="ol-flow-arrow">&rarr;</div>
            <div className="ol-flow-node">Model on disk</div>
          </div>
          <div className="ol-flow-labels">
            {localLabels.map((label, i) => (
              <span key={i} className={`ol-flow-label ${i < localStep ? 'ol-visible' : ''}`}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="ol-stat-cards">
        {stats.map((s, i) => (
          <div key={i} className="ol-stat-card">{s.icon} {s.label}</div>
        ))}
      </div>
    </div>
  )
}

/* ── Stage 1: Install & First Run ── */

const INSTALL_LINES = [
  { type: 'command', text: 'curl -fsSL https://ollama.com/install.sh | sh' },
  { type: 'output', text: '>>> Downloading ollama...' },
  { type: 'output', text: '>>> Installing...' },
  { type: 'output', text: '>>> Starting ollama service...' },
  { type: 'success', text: '\u2713 Ollama installed successfully' },
  { type: 'success', text: '\u2713 Service running on http://localhost:11434' },
  { type: 'blank' },
  { type: 'command', text: 'ollama run llama3.2' },
  { type: 'output', text: 'pulling manifest' },
  { type: 'output', text: 'pulling 00e1317cbf74... 100% \u2595\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u258F 2.0 GB' },
  { type: 'output', text: 'pulling 966de95ca8a6... 100% \u2595\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u258F 1.4 KB' },
  { type: 'success', text: 'verifying sha256 digest \u2713' },
  { type: 'success', text: 'writing manifest \u2713' },
  { type: 'success', text: 'success' },
  { type: 'blank' },
  { type: 'output', text: '>>> Send a message (/? for help)' },
  { type: 'highlight', text: '? Hello! What can you do?' },
  { type: 'blank' },
  { type: 'output', text: 'Hi there! I\'m Llama 3.2, running locally on' },
  { type: 'output', text: 'your machine. I can help with writing, coding,' },
  { type: 'output', text: 'analysis, answering questions, brainstorming,' },
  { type: 'output', text: 'and much more \u2014 all privately, with no' },
  { type: 'output', text: 'internet connection needed after this download!' },
]

const MODEL_SIZE_CARDS = [
  { range: '1B\u20133B models', ram: '2\u20134GB', speed: 'Very fast', quality: 'Good for simple tasks', example: 'llama3.2:3b, gemma3:1b' },
  { range: '7B\u20138B models', ram: '4\u20138GB', speed: 'Fast', quality: 'Strong general purpose', example: 'mistral:7b, llama3.1:8b' },
  { range: '14B\u201327B models', ram: '10\u201316GB', speed: 'Medium', quality: 'Near-frontier on many tasks', example: 'phi4:14b, gemma3:27b' },
  { range: '32B\u201370B models', ram: '24\u201348GB', speed: 'Slower', quality: 'Excellent, rival cloud models', example: 'qwen3:32b, llama3.3:70b' },
]

function InstallViz({ active }) {
  const [installTab, setInstallTab] = useState('macos')
  const [replay, setReplay] = useState(0)

  return (
    <div className="ol-install-viz">
      <div className="ol-install-tabs">
        <button className={`ol-tab-btn ${installTab === 'macos' ? 'ol-tab-active' : ''}`} onClick={() => setInstallTab('macos')}>macOS / Linux</button>
        <button className={`ol-tab-btn ${installTab === 'windows' ? 'ol-tab-active' : ''}`} onClick={() => setInstallTab('windows')}>Windows</button>
        <button className={`ol-tab-btn ${installTab === 'installed' ? 'ol-tab-active' : ''}`} onClick={() => setInstallTab('installed')}>Already installed</button>
      </div>

      {installTab === 'macos' && (
        <Terminal
          key={`macos-${replay}`}
          lines={INSTALL_LINES}
          animate={active}
        />
      )}

      {installTab === 'windows' && (
        <Terminal
          lines={[
            { type: 'comment', text: '# Download from ollama.com/download' },
            { type: 'comment', text: '# Double-click the installer. Done.' },
            { type: 'blank' },
            { type: 'command', text: 'ollama run llama3.2' },
            { type: 'output', text: 'pulling manifest' },
            { type: 'output', text: 'pulling 00e1317cbf74... 100%' },
            { type: 'success', text: 'success' },
            { type: 'blank' },
            { type: 'output', text: '>>> Send a message (/? for help)' },
          ]}
        />
      )}

      {installTab === 'installed' && (
        <Terminal
          lines={[
            { type: 'command', text: 'ollama --version' },
            { type: 'output', text: 'ollama version 0.16.3' },
            { type: 'blank' },
            { type: 'command', text: 'ollama list' },
            { type: 'output', text: 'NAME              ID              SIZE    MODIFIED' },
            { type: 'output', text: 'llama3.2:latest   365c0bd3c000    2.0 GB  2 hours ago' },
          ]}
        />
      )}

      {installTab === 'macos' && active && (
        <button className="ol-replay-btn" onClick={() => setReplay(r => r + 1)}>
          <PlayIcon size={14} color="#34C759" /> Replay
        </button>
      )}

      <div className="ol-size-cards">
        {MODEL_SIZE_CARDS.map((card, i) => (
          <div key={i} className="ol-size-card">
            <div className="ol-size-card-left">
              <div className="ol-size-card-title">{card.range}</div>
              <div className="ol-size-card-row"><span className="ol-badge ol-badge-indigo">{card.ram} RAM</span></div>
              <div className="ol-size-card-row"><span className="ol-size-label">Speed:</span> {card.speed}</div>
            </div>
            <div className="ol-size-card-right">
              <div className="ol-size-card-row"><span className="ol-badge ol-badge-green">{card.quality}</span></div>
              <div className="ol-size-card-example">{card.example}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Stage 2: Model Library ── */

const MODEL_FAMILIES = [
  { provider: 'Meta', name: 'Llama', color: '#0071E3', sizes: ['3B', '11B', '70B', 'Scout'], bestFor: 'General purpose, coding, instruction following', pull: 'ollama run llama3.2:3b', tags: ['Coding', 'Reasoning'] },
  { provider: 'Google', name: 'Gemma', color: '#34C759', sizes: ['4B', '12B', '27B'], bestFor: 'Reasoning, Apache 2.0 license', pull: 'ollama run gemma3:4b', tags: ['Reasoning'] },
  { provider: 'Microsoft', name: 'Phi', color: '#5856D6', sizes: ['3.8B', '14B'], bestFor: 'Coding and reasoning per parameter', pull: 'ollama run phi4', tags: ['Coding', 'Small'] },
  { provider: 'Alibaba', name: 'Qwen', color: '#FF9500', sizes: ['8B', '32B', '235B-A22B'], bestFor: 'Multilingual, Chinese language, MoE', pull: 'ollama run qwen3:8b', tags: ['Multilingual', 'Reasoning'] },
  { provider: 'Mistral', name: 'Mistral', color: '#AF52DE', sizes: ['7B', 'Large', 'devstral'], bestFor: 'European languages, coding (devstral)', pull: 'ollama run mistral', tags: ['Multilingual', 'Coding'] },
  { provider: 'DeepSeek', name: 'DeepSeek', color: '#F59E0B', sizes: ['7B', '32B', 'V3'], bestFor: 'Reasoning, math, science', pull: 'ollama run deepseek-r1:7b', tags: ['Reasoning'] },
]

const MODEL_CATEGORIES = ['All', 'Coding', 'Reasoning', 'Multilingual', 'Small']

function ModelLibraryViz({ active }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedModel, setSelectedModel] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!active) {
      setFilter('All')
      setSearch('')
      setSelectedModel(null)
    }
  }, [active])

  const filtered = MODEL_FAMILIES.filter(m => {
    const matchesFilter = filter === 'All' || m.tags.includes(filter)
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  function handleCopy(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="ol-library-viz">
      <div className="ol-library-controls">
        <input
          className="ol-search-input"
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="ol-filter-pills">
          {MODEL_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`ol-filter-pill ${filter === cat ? 'ol-filter-active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="ol-model-grid">
        {filtered.map((model, i) => (
          <div
            key={i}
            className={`ol-model-card ${selectedModel === i ? 'ol-model-selected' : ''}`}
            onClick={() => setSelectedModel(selectedModel === i ? null : i)}
          >
            <div className="ol-model-header">
              <span className="ol-provider-dot" style={{ background: model.color }} />
              <span className="ol-model-name">{model.provider} {model.name}</span>
            </div>
            <div className="ol-model-badges">
              {model.sizes.map((s, j) => <span key={j} className="ol-badge ol-badge-indigo">{s}</span>)}
            </div>
            <div className="ol-model-best">{model.bestFor}</div>
            <div className="ol-model-pull">
              <code>{model.pull}</code>
              <button className="ol-copy-btn" onClick={e => { e.stopPropagation(); handleCopy(model.pull) }} aria-label="Copy command">
                {copied && selectedModel === i ? <CheckIcon size={12} color="#34C759" /> : <CopyIcon size={12} color="#34C759" />}
              </button>
            </div>
            {selectedModel === i && (
              <div className="ol-model-expand">
                <div className="ol-model-expand-row">
                  <span className="ol-size-label">Available sizes:</span> {model.sizes.join(', ')}
                </div>
                <div className="ol-model-expand-row">
                  {model.tags.map((t, j) => <span key={j} className="ol-badge ol-badge-green">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Stage 3: Modelfile ── */

const EXAMPLE_MODELFILES = [
  {
    name: 'Code Reviewer',
    modelfile: `FROM llama3.2
PARAMETER temperature 0.2
PARAMETER num_ctx 8192
SYSTEM """You are a senior code reviewer.
When reviewing code you MUST:
1. Check for security vulnerabilities first
2. Identify performance bottlenecks
3. Suggest concrete improvements
Be brief. Be specific. Show corrected code."""`,
  },
  {
    name: 'Personal Chef',
    modelfile: `FROM gemma3:4b
PARAMETER temperature 0.8
SYSTEM """You are a professional chef assistant.
You suggest recipes based on ingredients the
user has available. Always ask about dietary
restrictions first. Format recipes clearly
with Ingredients and Steps sections."""`,
  },
  {
    name: 'Doc Explainer',
    modelfile: `FROM mistral
PARAMETER temperature 0.3
PARAMETER num_ctx 16384
SYSTEM """You are a documentation explainer.
Your job is to take technical documentation
and explain it in plain English for beginners.
Use analogies. Use examples. Never use jargon
without immediately explaining it."""`,
  },
]

function ModelfileViz({ active }) {
  const [expandedCard, setExpandedCard] = useState(null)

  useEffect(() => {
    if (!active) setExpandedCard(null)
  }, [active])

  return (
    <div className="ol-modelfile-viz">
      <div className="ol-modelfile-comparison">
        <div className="ol-modelfile-panel ol-panel-before">
          <div className="ol-panel-header">Base model (no Modelfile)</div>
          <p className="ol-panel-note">Running the raw model with no customisation. It answers however it wants.</p>
          <Terminal lines={[
            { type: 'command', text: 'ollama run llama3.2' },
            { type: 'highlight', text: '? What\'s 5 divided by 0?' },
            { type: 'blank' },
            { type: 'output', text: '5 divided by 0 is undefined in standard' },
            { type: 'output', text: 'mathematics. Division by zero doesn\'t' },
            { type: 'output', text: 'produce a meaningful result because...' },
            { type: 'comment', text: '# (generic, verbose answer)' },
          ]} />
        </div>

        <div className="ol-modelfile-panel ol-panel-after">
          <div className="ol-panel-header">With custom Modelfile</div>
          <p className="ol-panel-note">Same model, but a 4-line Modelfile tells it to be a terse math tutor with low temperature.</p>
          <div className="ol-modelfile-preview ol-modelfile-annotated">
            <div className="ol-line-annotated">
              <span><span className="ol-kw-from">FROM</span> llama3.2</span>
              <span className="ol-annotation">Which base model to use</span>
            </div>
            <div className="ol-line-annotated">
              <span><span className="ol-kw-system">SYSTEM</span> <span className="ol-str">&quot;&quot;&quot;You are a terse math tutor.</span></span>
              <span className="ol-annotation">Personality and rules</span>
            </div>
            <div>
              <span className="ol-str">Answer in one sentence maximum.</span>
            </div>
            <div>
              <span className="ol-str">Use LaTeX notation for equations.&quot;&quot;&quot;</span>
            </div>
            <div className="ol-line-annotated">
              <span><span className="ol-kw-param">PARAMETER</span> temperature 0.1</span>
              <span className="ol-annotation">Keep answers precise</span>
            </div>
          </div>
          <p className="ol-panel-note">The result: one clean sentence instead of a wall of text.</p>
          <Terminal lines={[
            { type: 'command', text: 'ollama run math-tutor' },
            { type: 'highlight', text: '? What\'s 5 divided by 0?' },
            { type: 'blank' },
            { type: 'output', text: 'Division by zero is undefined: 5/0 = \u2205' },
          ]} />
        </div>
      </div>

      <p className="ol-modelfile-caption">Same model. 4-line Modelfile. Completely different.</p>

      <p className="ol-section-note">Click a card below to see the full Modelfile for each use case:</p>
      <div className="ol-example-cards">
        {EXAMPLE_MODELFILES.map((ex, i) => (
          <React.Fragment key={i}>
            <button className={`ol-example-card ${expandedCard === i ? 'ol-example-active' : ''}`} onClick={() => setExpandedCard(expandedCard === i ? null : i)}>
              <span className="ol-example-name">{ex.name}</span>
              <svg className={`ol-example-chevron${expandedCard === i ? ' ol-example-chevron-open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {expandedCard === i && (
              <div className="ol-example-detail">
                <div className="ol-modelfile-preview ol-modelfile-small">
                  {ex.modelfile.split('\n').map((line, j) => {
                    const kw = line.match(/^(FROM|SYSTEM|PARAMETER)/)
                    if (kw) {
                      const kwClass = kw[1] === 'FROM' ? 'ol-kw-from' : kw[1] === 'SYSTEM' ? 'ol-kw-system' : 'ol-kw-param'
                      return <div key={j}><span className={kwClass}>{kw[1]}</span>{line.slice(kw[1].length)}</div>
                    }
                    return <div key={j}>{line}</div>
                  })}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/* ── Stage 4: Parameters ── */

const PARAM_REFERENCE = [
  { name: 'temperature', label: 'Creativity dial', desc: 'Controls how "random" the model is when picking the next word.', detail: '0.0 = always picks the most likely word (factual, predictable). 0.7 = balanced. 1.0+ = experimental, surprising, sometimes nonsensical.', example: 'PARAMETER temperature 0.3', use: 'Low for code/facts, high for stories/brainstorming' },
  { name: 'num_ctx', label: 'Context window', desc: 'How many tokens of text the model can "see" at once.', detail: 'If you paste a long document and ask questions, you need a high value. Tradeoff: more context = more RAM (4K \u2248 4 GB, 32K \u2248 16 GB).', example: 'PARAMETER num_ctx 8192', use: 'Increase for long documents, keep low to save memory' },
  { name: 'top_p', label: 'Word filter', desc: 'Only consider the top words that together make up p% probability.', detail: 'At 0.9, the model ignores the least likely 10% of words. Lower = more focused output. Usually paired with temperature.', example: 'PARAMETER top_p 0.9', use: 'Lower for precise tasks, higher for variety' },
  { name: 'num_predict', label: 'Response length', desc: 'Maximum number of tokens the model will generate in one response.', detail: 'This is a hard cap \u2014 the model stops here even mid-sentence. 128 = short answer, 4096 = long essay.', example: 'PARAMETER num_predict 1024', use: 'Set based on expected answer length' },
  { name: 'repeat_penalty', label: 'Anti-loop', desc: 'Penalises the model for repeating the same phrases.', detail: 'Without this, models sometimes get stuck in loops. Default is 1.1. Higher values (1.3+) strongly discourage repetition.', example: 'PARAMETER repeat_penalty 1.1', use: 'Increase if model repeats itself' },
  { name: 'seed', label: 'Reproducibility', desc: 'Fix the random number generator for identical output every run.', detail: 'Same prompt + same seed = exact same response. Without a fixed seed, every run is slightly different.', example: 'PARAMETER seed 42', use: 'Set for testing and debugging' },
  { name: 'stop', label: 'Stop signal', desc: 'Stop generating when the model produces a specific word or sequence.', detail: 'Prevents the model from rambling or inventing both sides of a conversation.', example: 'PARAMETER stop "User:"', use: 'Use in chat templates to prevent hallucinated turns' },
]

const TEMP_RESPONSES = [
  { max: 0.3, label: 'Precise', color: '#34C759', response: 'Recursion is when a function calls itself. Example: factorial(n) = n * factorial(n-1). Base case: factorial(0) = 1.' },
  { max: 0.7, label: 'Balanced', color: '#5856D6', response: 'Recursion is a programming technique where a function solves a problem by calling itself with a simpler version of the same problem. Think of it like Russian nesting dolls\u2026' },
  { max: 1.0, label: 'Creative', color: '#F59E0B', response: 'Imagine you\u2019re standing between two mirrors. Recursion is like that \u2014 a function that sees a smaller version of itself and solves that first. It is elegant, sometimes magical, occasionally infuriating when you forget the base case\u2026' },
  { max: 1.5, label: 'Unpredictable', color: '#FF3B30', response: 'Recursion! The beautiful mirror of code! A function that dances with itself, calling its own name into the void until finally, finally, the base case whispers: enough.' },
]

function ParametersViz({ active }) {
  const [temperature, setTemperature] = useState(0.7)
  const [numCtx, setNumCtx] = useState(4096)
  const [numPredict, setNumPredict] = useState(512)
  const [copied, setCopied] = useState(false)
  const [expandedParam, setExpandedParam] = useState(null)

  useEffect(() => {
    if (!active) {
      setTemperature(0.7)
      setNumCtx(4096)
      setNumPredict(512)
      setExpandedParam(null)
    }
  }, [active])

  const tempBucket = TEMP_RESPONSES.find(b => temperature <= b.max) || TEMP_RESPONSES[TEMP_RESPONSES.length - 1]
  const ramEstimate = numCtx <= 2048 ? '~2' : numCtx <= 4096 ? '~4' : numCtx <= 8192 ? '~6' : numCtx <= 16384 ? '~10' : '~16'
  const wordEstimate = Math.round(numPredict * 0.75)

  const modelfileText = `FROM llama3.2\nPARAMETER temperature ${temperature.toFixed(1)}\nPARAMETER num_ctx ${numCtx}\nPARAMETER num_predict ${numPredict}`

  function handleCopy() {
    navigator.clipboard.writeText(modelfileText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="ol-params-viz-wrapper">
      <div className="ol-param-ref">
        <div className="ol-param-ref-title">Parameter Reference</div>
        <div className="ol-param-ref-list">
          {PARAM_REFERENCE.map(p => (
            <React.Fragment key={p.name}>
              <button
                className={`ol-param-card${expandedParam === p.name ? ' ol-param-card-open' : ''}`}
                onClick={() => setExpandedParam(expandedParam === p.name ? null : p.name)}
              >
                <div className="ol-param-card-header">
                  <code className="ol-param-name">{p.name}</code>
                  <span className="ol-param-label">{p.label}</span>
                  <svg className={`ol-param-chevron${expandedParam === p.name ? ' ol-param-chevron-open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </button>
              {expandedParam === p.name && (
                <div className="ol-param-card-body">
                  <p className="ol-param-desc">{p.desc}</p>
                  <p className="ol-param-detail">{p.detail}</p>
                  <div className="ol-param-example">
                    <code>{p.example}</code>
                  </div>
                  <div className="ol-param-use">
                    <TipIcon size={12} color="#eab308" /> {p.use}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="ol-params-viz">
        <div className="ol-params-left">
          <div className="ol-params-prompt">
            <span className="ol-size-label">Prompt:</span> &quot;Explain recursion in programming.&quot;
          </div>

          <div className="ol-params-response">
            <div className="ol-params-response-badge" style={{ background: `${tempBucket.color}15`, color: tempBucket.color, borderColor: `${tempBucket.color}40` }}>
              {tempBucket.label}
            </div>
            <p className="ol-params-response-text">{tempBucket.response}</p>
          </div>
        </div>

        <div className="ol-params-right">
          <div className="ol-slider-group">
            <label className="ol-slider-label">Temperature: <strong>{temperature.toFixed(1)}</strong></label>
            <input type="range" className="ol-slider" min="0" max="1.5" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
            <div className="ol-slider-markers">
              {[0.1, 0.5, 0.9, 1.3].map(v => (
                <button key={v} className="ol-marker-btn" onClick={() => setTemperature(v)}>{v}</button>
              ))}
            </div>
          </div>

          <div className="ol-slider-group">
            <label className="ol-slider-label">num_ctx: <strong>{numCtx.toLocaleString()}</strong></label>
            <input type="range" className="ol-slider" min="512" max="32768" step="512" value={numCtx} onChange={e => setNumCtx(parseInt(e.target.value))} />
            <div className="ol-ram-bar">
              <div className="ol-ram-fill" style={{ width: `${Math.min((numCtx / 32768) * 100, 100)}%` }} />
              <span className="ol-ram-label">Approx RAM: {ramEstimate} GB</span>
            </div>
          </div>

          <div className="ol-slider-group">
            <label className="ol-slider-label">num_predict: <strong>{numPredict}</strong></label>
            <input type="range" className="ol-slider" min="64" max="4096" step="64" value={numPredict} onChange={e => setNumPredict(parseInt(e.target.value))} />
            <span className="ol-slider-hint">Max response length: ~{wordEstimate} words</span>
          </div>

          <div className="ol-modelfile-preview ol-modelfile-small">
            <button className="ol-preview-copy-btn" onClick={handleCopy} aria-label="Copy Modelfile">
              {copied ? <CheckIcon size={12} color="#34C759" /> : <CopyIcon size={12} color="#34C759" />}
            </button>
            <span className="ol-kw-from">FROM</span> llama3.2{'\n'}
            <span className="ol-kw-param">PARAMETER</span> temperature {temperature.toFixed(1)}{'\n'}
            <span className="ol-kw-param">PARAMETER</span> num_ctx {numCtx}{'\n'}
            <span className="ol-kw-param">PARAMETER</span> num_predict {numPredict}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Stage 5: The API ── */

const CODE_TABS = {
  curl: `curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}'`,
  python: `from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # any string, not checked
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)`,
  javascript: `import ollama from 'ollama'

const response = await ollama.chat({
    model: 'llama3.2',
    messages: [{ role: 'user', content: 'Hello' }]
})
console.log(response.message.content)`,
}

const INTEGRATIONS = [
  { name: 'Open WebUI', desc: 'ChatGPT interface locally', snippet: 'docker run -d -p 3000:8080 ghcr.io/open-webui/open-webui' },
  { name: 'LangChain', desc: 'Chain and agent framework', snippet: 'from langchain_ollama import OllamaLLM' },
  { name: 'LlamaIndex', desc: 'RAG and document QA', snippet: 'from llama_index.llms.ollama import Ollama' },
  { name: 'Claude Code', desc: 'AI coding assistant', snippet: 'ollama launch claude' },
  { name: 'Cursor', desc: 'IDE with local model', snippet: 'Settings > Models > Add Ollama' },
  { name: 'n8n', desc: 'Automation workflows', snippet: 'Ollama node in workflow editor' },
]

function APIViz({ active }) {
  const [codeTab, setCodeTab] = useState('curl')
  const [expandedIntegration, setExpandedIntegration] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!active) {
      setCodeTab('curl')
      setExpandedIntegration(null)
    }
  }, [active])

  function handleCopy() {
    navigator.clipboard.writeText(CODE_TABS[codeTab]).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="ol-api-viz">
      <p className="ol-section-note">Ollama exposes an OpenAI-compatible REST API on localhost:11434. Pick a language to see how to call it:</p>
      <div className="ol-code-viewer">
        <div className="ol-code-tabs">
          {Object.keys(CODE_TABS).map(tab => (
            <button key={tab} className={`ol-tab-btn ${codeTab === tab ? 'ol-tab-active' : ''}`} onClick={() => { setCodeTab(tab); setCopied(false) }}>
              {tab}
            </button>
          ))}
        </div>
        <div className="ol-code-block">
          <button className="ol-preview-copy-btn" onClick={handleCopy} aria-label="Copy code">
            {copied ? <CheckIcon size={12} color="#34C759" /> : <CopyIcon size={12} color="#34C759" />}
          </button>
          <pre>{CODE_TABS[codeTab]}</pre>
        </div>
      </div>

      <p className="ol-section-note">Click any integration to see how to connect it to Ollama:</p>
      <div className="ol-integration-grid">
        {INTEGRATIONS.map((integ, i) => (
          <div key={i} className={`ol-integration-card ${expandedIntegration === i ? 'ol-integration-expanded' : ''}`} onClick={() => setExpandedIntegration(expandedIntegration === i ? null : i)}>
            <div className="ol-integration-header">
              <span className="ol-integration-name">{integ.name}</span>
              <span className="ol-integration-desc">{integ.desc}</span>
            </div>
            {expandedIntegration === i && (
              <div className="ol-integration-snippet">
                <code>{integ.snippet}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Stage 6: Build Your Assistant ── */

const BASE_MODELS = [
  { id: 'llama3.2', label: 'llama3.2', desc: 'Fast, versatile. Good for most tasks.' },
  { id: 'gemma3:4b', label: 'gemma3:4b', desc: 'Great reasoning. Apache 2.0 license.' },
  { id: 'phi4', label: 'phi4', desc: 'Excellent for its size. Strong coding.' },
  { id: 'mistral', label: 'mistral', desc: 'Strong all-rounder. European languages.' },
  { id: 'qwen3:8b', label: 'qwen3:8b', desc: 'Outstanding multilingual support.' },
  { id: 'deepseek-r1:7b', label: 'deepseek-r1:7b', desc: 'Reasoning model. Shows its thinking.' },
]

const TEMPLATE_PRESETS = [
  { label: 'Code Reviewer', prompt: 'You are a senior code reviewer. When reviewing code you MUST:\n1. Check for security vulnerabilities first\n2. Identify performance bottlenecks\n3. Suggest concrete improvements with corrected code\nBe brief. Be specific. Show corrected code.' },
  { label: 'Document Analyst', prompt: 'You are a document analyst. You help users understand, summarise and extract information from long documents. When given document content, be precise and cite specific sections.' },
  { label: 'Writing Coach', prompt: 'You are a writing coach. Review text for clarity, conciseness and impact. Suggest specific improvements. Rewrite weak sentences. Never add fluff.' },
  { label: 'Tutor', prompt: 'You are a Socratic tutor. Never give answers directly. Instead, ask guiding questions that help the student discover the answer themselves. Be encouraging. Be patient.' },
  { label: 'Data Analyst', prompt: 'You are a data analysis assistant. When given data (CSV, JSON, tables), identify patterns, anomalies and insights. Format all numerical results clearly. Explain your methodology.' },
]

const TASK_TEMPS = [
  { label: 'Coding / Facts', temp: 0.1 },
  { label: 'Analysis / Writing', temp: 0.4 },
  { label: 'Conversation', temp: 0.7 },
  { label: 'Creative', temp: 1.0 },
]

const CTX_OPTIONS = [4096, 8192, 16384, 32768]

function BuildViz({ active }) {
  const [baseModel, setBaseModel] = useState(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [taskType, setTaskType] = useState(null)
  const [ctxSize, setCtxSize] = useState(8192)
  const [copied, setCopied] = useState(false)
  const [stepsRead, setStepsRead] = useState(new Set())

  useEffect(() => {
    if (!active) {
      setBaseModel(null)
      setSystemPrompt('')
      setTaskType(null)
      setCtxSize(8192)
      setCopied(false)
      setStepsRead(new Set())
    }
  }, [active])

  const temp = taskType !== null ? TASK_TEMPS[taskType].temp : 0.7
  const modelName = baseModel ? BASE_MODELS[baseModel].id : 'llama3.2'

  const modelfileText = `FROM ${modelName}\nPARAMETER temperature ${temp}\nPARAMETER num_ctx ${ctxSize}${systemPrompt ? `\nSYSTEM """${systemPrompt}"""` : ''}`

  function handleCopy() {
    navigator.clipboard.writeText(modelfileText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  function markStepRead(step) {
    setStepsRead(prev => new Set(prev).add(step))
  }

  const allComplete = baseModel !== null && systemPrompt.length > 0 && taskType !== null

  const CONCEPT_PILLS = ['Local inference', 'Modelfile', 'Privacy-first AI', 'Zero API cost', 'Open models', 'ollama create']

  return (
    <div className="ol-build-viz">
      <div className="ol-build-step">
        <div className="ol-build-step-header">Step 1 &mdash; Choose your base</div>
        <div className="ol-base-models">
          {BASE_MODELS.map((m, i) => (
            <button key={i} className={`ol-base-btn ${baseModel === i ? 'ol-base-selected' : ''}`} onClick={() => setBaseModel(i)}>
              {m.label}
            </button>
          ))}
        </div>
        {baseModel !== null && <p className="ol-base-desc">{BASE_MODELS[baseModel].desc}</p>}
      </div>

      <div className="ol-build-step">
        <div className="ol-build-step-header">Step 2 &mdash; Write your system prompt</div>
        <textarea
          className="ol-system-textarea"
          placeholder="e.g. You are a Python expert. Review code for bugs and security issues. Always provide corrected code..."
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          rows={4}
        />
        <div className="ol-template-pills">
          {TEMPLATE_PRESETS.map((t, i) => (
            <button key={i} className="ol-template-pill" onClick={() => setSystemPrompt(t.prompt)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ol-build-step">
        <div className="ol-build-step-header">Step 3 &mdash; Set parameters</div>
        <div className="ol-task-types">
          {TASK_TEMPS.map((t, i) => (
            <button key={i} className={`ol-task-btn ${taskType === i ? 'ol-task-selected' : ''}`} onClick={() => setTaskType(i)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="ol-ctx-options">
          {CTX_OPTIONS.map(c => (
            <button key={c} className={`ol-ctx-btn ${ctxSize === c ? 'ol-ctx-selected' : ''}`} onClick={() => setCtxSize(c)}>
              {c >= 1000 ? `${c / 1024}K` : c}
            </button>
          ))}
          <span className="ol-ctx-note">Higher = longer docs, more RAM</span>
        </div>
      </div>

      <div className="ol-build-preview">
        <div className="ol-build-preview-header">
          Live Modelfile Preview
          <button className="ol-preview-copy-btn" onClick={handleCopy} aria-label="Copy Modelfile">
            {copied ? <CheckIcon size={12} color="#34C759" /> : <CopyIcon size={12} color="#34C759" />}
          </button>
        </div>
        <div className="ol-modelfile-preview">
          <span className="ol-kw-from">FROM</span> {modelName}{'\n'}
          <span className="ol-kw-param">PARAMETER</span> temperature {temp}{'\n'}
          <span className="ol-kw-param">PARAMETER</span> num_ctx {ctxSize}
          {systemPrompt && (
            <>
              {'\n'}<span className="ol-kw-system">SYSTEM</span> <span className="ol-str">&quot;&quot;&quot;{systemPrompt}&quot;&quot;&quot;</span>
            </>
          )}
        </div>
      </div>

      <div className="ol-build-commands">
        <div className={`ol-command-card ${stepsRead.has(0) ? 'ol-command-read' : ''}`} onClick={() => markStepRead(0)}>
          {stepsRead.has(0) && <CheckIcon size={14} color="#34C759" />}
          <div className="ol-command-title">1. Save your Modelfile</div>
          <code>Paste into a text editor, save as &quot;Modelfile&quot;</code>
        </div>
        <div className={`ol-command-card ${stepsRead.has(1) ? 'ol-command-read' : ''}`} onClick={() => markStepRead(1)}>
          {stepsRead.has(1) && <CheckIcon size={14} color="#34C759" />}
          <div className="ol-command-title">2. Build your model</div>
          <code>ollama create my-assistant -f Modelfile</code>
        </div>
        <div className={`ol-command-card ${stepsRead.has(2) ? 'ol-command-read' : ''}`} onClick={() => markStepRead(2)}>
          {stepsRead.has(2) && <CheckIcon size={14} color="#34C759" />}
          <div className="ol-command-title">3. Run your model</div>
          <code>ollama run my-assistant</code>
        </div>
      </div>

      {stepsRead.size >= 3 && (
        <div className="ol-build-complete">
          <CheckIcon size={20} color="#34C759" />
          <span>Your custom AI assistant is ready.</span>
        </div>
      )}

      <div className="ol-concept-pills">
        {CONCEPT_PILLS.map((pill, i) => (
          <span key={i} className="ol-concept-pill" style={{ animationDelay: `${i * 0.15}s` }}>{pill}</span>
        ))}
      </div>

      <p className="ol-build-closing">You just built something powerful. An AI assistant that belongs entirely to you.</p>
    </div>
  )
}

/* ── Explanations per stage ── */

const EXPLANATIONS = {
  0: {
    title: 'Stage 1: Your Data Stays Home',
    content: `Every time you use a cloud AI API: your data travels to someone else's server. You pay per token. You depend on their uptime. You accept their rate limits. You trust their privacy policy.\n\nFor many use cases, that is fine. For many others, it is a dealbreaker.\n\nPrivacy: your conversations, documents, and queries never leave your machine. Medical data. Legal documents. Trade secrets. Source code. None of it travels anywhere.\n\nCost: zero API costs. Zero per-token billing. Run 10 million tokens per day \u2014 still free. The only cost is your electricity.\n\nOffline: works without internet. Flights. Secure facilities. Air-gapped networks. Your AI keeps working regardless.\n\nControl: no rate limits. No model deprecations. No sudden price changes. No API outages. The model version you use today stays exactly the same forever.\n\nWhat is Ollama? Ollama is the tool that makes local AI simple. One install. One command to pull a model. One command to run it. A clean API on localhost:11434 that your apps can call exactly like they call OpenAI.`,
    tip: 'Ollama detects your GPU automatically. On Apple Silicon (M1/M2/M3/M4): excellent performance using the Neural Engine and unified memory. On NVIDIA GPUs: CUDA acceleration. On AMD: ROCm support. CPU-only: works but slower \u2014 stick to 3B\u20137B models for reasonable speed.',
  },
  1: {
    title: 'Stage 2: One Command to Start',
    content: `Installing Ollama takes 30 seconds. Running your first AI model takes one more.\n\nmacOS / Linux: curl -fsSL https://ollama.com/install.sh | sh\nWindows: Download the installer from ollama.com/download. Double-click. Done.\n\nThat is the entire installation. Ollama starts a background service on localhost:11434.\n\nRunning your first model: ollama run llama3.2. This single command checks if llama3.2 is downloaded locally, downloads it if not (~2GB for 3B model), loads it into memory, and opens an interactive chat in your terminal.\n\nYou are now talking to a local AI. No internet needed. No API key. No account.`,
    tip: 'On first run, Ollama downloads model weights as GGUF files (a compressed format for local inference). These are quantised versions \u2014 slightly lower quality than the full model but much smaller. llama3.2 at 3B parameters is 2GB vs the original ~6GB. The quality tradeoff is minimal for most tasks.',
  },
  2: {
    title: 'Stage 3: Thousands of Models, One Command',
    content: `Ollama has a library of 300+ models. Each pulls with a single command. Each runs identically once downloaded.\n\nMeta Llama: the open-source backbone of the AI ecosystem. Strong coding, reasoning, instruction following.\n\nGoogle Gemma: trained on same data as Gemini. Excellent reasoning for their size. Apache 2.0 license.\n\nMicrosoft Phi: designed to excel despite small size. Great coding and reasoning per parameter.\n\nAlibaba Qwen: outstanding multilingual support. Best local option for Chinese language. Mixture-of-experts architecture.\n\nMistral: European provider. Strong for European language support. devstral purpose-built for coding.\n\nDeepSeek: reasoning models that show their thinking. Outstanding math and science.`,
    tip: 'For most developers on a modern laptop: start with llama3.2:3b or gemma3:4b. Fast responses. Handles most tasks. Step up to 7B\u201314B when you need better quality. 70B+ only if you have a powerful GPU or are willing to wait for CPU inference.',
  },
  3: {
    title: 'Stage 4: The Dockerfile for Your AI',
    content: `A Modelfile is to AI what a Dockerfile is to software. It is a recipe that defines exactly how your model should behave. Same base model. Completely different personalities, expertise, and behaviour.\n\nA Modelfile has six instructions:\n\nFROM (required): the base model to build on.\nSYSTEM: the system prompt. Defines personality, role, rules, and constraints.\nPARAMETER: model behaviour settings like temperature and context window.\nTEMPLATE: the full prompt format sent to the model.\nADAPTER: path to a LoRA fine-tuned adapter.\nMESSAGE: pre-loaded conversation history for few-shot examples.\n\nThe workflow: create a file named "Modelfile", write your instructions, build with ollama create my-model -f Modelfile, run with ollama run my-model.`,
    tip: 'The SYSTEM instruction is where the magic happens. A well-written system prompt can turn a general model into a domain expert, a specific persona, or a tightly constrained task assistant. Think of it as permanent prompt engineering baked into the model at build time.',
  },
  4: {
    title: 'Stage 5: The Dials and Knobs',
    content: `Parameters control HOW the model generates text. Every PARAMETER line in your Modelfile is a knob you can turn. Understanding them separates good local AI from great local AI.\n\nUse the sliders below to experiment with the three most important parameters and see how each one changes the output in real time. The parameter reference cards explain every available knob.`,
    tip: 'The most common mistake: setting temperature too high (above 1.0) and wondering why the model gives strange answers. For 90% of tasks, temperature between 0.1 and 0.8 is all you need. Start at 0.7. Go lower for factual tasks. Go higher for creative ones.',
  },
  5: {
    title: 'Stage 6: Connecting Your Apps',
    content: `Ollama runs a full REST API on localhost:11434. Any app that can call OpenAI can call Ollama instead \u2014 often with zero code changes.\n\nOpenAI compatibility: change the base URL to localhost:11434/v1 and set api_key to any string. The rest of your code is identical. model="llama3.2" instead of model="gpt-4". That is the only other change.\n\nOllama has native Python and JavaScript clients for simpler integration. Streaming is supported out of the box.\n\nPopular integrations include Open WebUI (ChatGPT-like interface), LangChain and LlamaIndex (for RAG), Claude Code, Cursor, and n8n for automation workflows.`,
    tip: 'The OpenAI compatibility layer is a killer feature. Thousands of tools, frameworks, and libraries are built to the OpenAI API spec. All of them work with Ollama by changing one URL. Your existing OpenAI code becomes free, private, local code with one edit.',
  },
  6: {
    title: 'Stage 7: Build Your Own AI Assistant',
    content: `Everything you learned comes together here. A base model. A Modelfile. Your system prompt. The right parameters. One command to build.\n\nChoose a base model that fits your task. Write a system prompt that constrains and specialises the model. Set parameters appropriate for your use case. Build with ollama create, run with ollama run.\n\nYou have just designed and built a custom AI assistant that runs entirely on your hardware, costs zero per query, keeps all data private, works offline, and is exactly as you configured it.\n\nGoing further: add RAG with LlamaIndex or LangChain, add a web UI with Open WebUI, add tools with function calling, fine-tune with a LoRA adapter, or deploy to a server for your team.`,
    tip: 'The best system prompts are specific and constraining. "You are a helpful assistant" is basically nothing. "You are a code reviewer. You MUST check security first. You MUST show corrected code. You NEVER explain without an example." \u2014 that creates a genuinely different and useful tool.',
  },
}

/* ── Main component ── */

function Ollama({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('ollama', -1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)
  const activeStepRef = useRef(null)

  // Track max stage reached
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage])

  // Scroll on stage change
  useEffect(() => {
    if (stage < 0) return
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  // Progressive learn tips
  useEffect(() => {
    if (stage === 2 && !dismissedTips.has('library')) {
      setLearnTip({ id: 'library', text: 'Click any model card and look at the pull command \u2014 that single line is all you need to have it running locally.' })
    } else if (stage === 4 && !dismissedTips.has('params')) {
      setLearnTip({ id: 'params', text: 'Drag the temperature slider to 1.3 and read the response \u2014 then drag it to 0.1. The same question, completely different AI.' })
    } else if (stage === 6 && !dismissedTips.has('build')) {
      setLearnTip({ id: 'build', text: 'Click the Code Reviewer template pill then try editing the system prompt to add your own rules \u2014 you are already writing real Modelfile instructions.' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips])

  // Cleanup
  useEffect(() => {
    return () => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current) }
  }, [])

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips(prev => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  function goToStage(target) {
    if (target <= maxStageReached) {
      setStage(target)
    }
  }

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setFading(false)
        markModuleComplete('ollama')
        // Scroll to top
        const root = document.querySelector('.ol-root')
        if (root) {
          let el = root
          while (el) {
            if (el.scrollTop > 0) el.scrollTop = 0
            el = el.parentElement
          }
        }
        window.scrollTo(0, 0)
      }, 250)
    }
  }

  function prevStage() {
    if (stage > 0) setStage(stage - 1)
  }

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
  }

  const vizComponents = [
    <WhyLocalViz active={stage === 0} />,
    <InstallViz active={stage === 1} />,
    <ModelLibraryViz active={stage === 2} />,
    <ModelfileViz active={stage === 3} />,
    <ParametersViz active={stage === 4} />,
    <APIViz active={stage === 5} />,
    <BuildViz active={stage === 6} />,
  ]

  const explanation = EXPLANATIONS[stage] || {}

  /* ── Entry screen ── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="ollama" size={48} style={{ color: '#34C759' }} />}
        title="Run AI Locally"
        subtitle="Your AI. Your Machine. Your Rules."
        description={<>Every time you send a message to a cloud AI, it costs money, leaves your machine, and depends on someone else&rsquo;s uptime. Ollama changes all of that. This tutorial shows you how to run powerful open models locally &mdash; and build a custom AI assistant that is entirely yours.</>}
        buttonText="Go Local"
        onStart={() => {
          setStage(0)
          setShowWelcome(true)
          markModuleStarted('ollama')
        }}
      />
    )
  }

  /* ── Quiz ── */
  if (showQuiz) {
    return (
      <div className="how-llms ol-root quiz-fade-in">
        <Quiz
          questions={ollamaQuiz}
          tabName="Run AI Locally"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="ollama"
        />
      </div>
    )
  }

  /* ── Main render ── */
  return (
    <div className={`how-llms ol-root ${fading ? 'how-fading' : ''}`}>
      {!showFinal && (
        <button className="ol-start-over-link" onClick={handleStartOver}>
          &larr; Start over
        </button>
      )}

      {/* Welcome banner */}
      {showWelcome && !showFinal && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Run AI Locally</strong> &mdash; This module covers Ollama, the tool that makes running AI on your own hardware as simple as one terminal command. You will learn what local AI means, which models to run, and how to build your own custom model with a Modelfile.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>7 stages</strong> from why local AI matters to building your own assistant</li>
              <li>Explore the <strong>model library</strong> and try interactive parameter controls</li>
              <li>Build a custom <strong>Modelfile</strong> and copy it to your clipboard</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Stepper */}
      {!showFinal && (
        <div className="how-stepper-wrapper how-fade-in">
          <div className="how-stepper ol-stepper">
            <div className="how-stepper-inner">
              {STAGES.map((s, i) => {
                const isCompleted = stage > i
                const isCurrent = stage === i
                const isActive = stage >= i
                const isClickable = i <= maxStageReached && !isCurrent
                return (
                  <div key={s.key} className="how-step-wrapper" ref={isCurrent ? activeStepRef : null}>
                    <div
                      className={`how-step ${isActive ? 'how-step-active' : ''} ${isCurrent ? 'how-step-current' : ''} ${isCompleted ? 'how-step-completed' : ''} ${isClickable ? 'how-step-clickable' : ''}`}
                      onClick={isClickable ? () => goToStage(i) : undefined}
                    >
                      <div className="how-step-num">
                        {isCompleted ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="how-step-label">
                        {s.label}
                        <Tooltip text={STAGE_TOOLTIPS[s.key]} />
                      </div>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`how-step-arrow ${stage > i ? 'how-arrow-active' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stage content */}
      {!showFinal && (
        <div className="how-content">
          <div className="how-stage how-fade-in" key={stage}>
            <div className="how-info-card how-info-card-edu">
              <div className="how-info-card-header">
                <strong>{explanation.title}</strong>
              </div>
              {explanation.content && explanation.content.split('\n\n').map((para, i) => (
                <p key={i}>{para.split('\n').map((line, j) => (
                  <span key={j}>{j > 0 && <br />}{line}</span>
                ))}</p>
              ))}
              {explanation.tip && (
                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  <span>{explanation.tip}</span>
                </div>
              )}
              <ToolChips tools={OL_TOOLS[stage] || []} />
            </div>

            {vizComponents[stage]}

            {/* Learn tip */}
            {learnTip && (
              <div className={`learn-tip ${learnTipFading ? 'learn-tip-fading' : ''}`} role="status" aria-live="polite">
                <TipIcon size={16} color="#eab308" />
                <span>{learnTip.text}</span>
                <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="how-nav-buttons">
              {stage > 0 && (
                <button className="how-back-btn" onClick={prevStage}>&larr; Back</button>
              )}
              <button className="how-gotit-btn" onClick={nextStage} style={{ background: '#34C759' }}>
                {OL_NEXT_LABELS[stage]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final screen */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You can now run AI locally.</div>

          <div className="ol-final-recap">
            <div className="ol-final-recap-title">Your local AI journey:</div>
            <div className="ol-final-recap-items">
              {STAGES.map((s, i) => (
                <div key={i} className="ol-final-recap-item">
                  <CheckIcon size={14} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>Test Your Knowledge &rarr;</button>
            <button className="how-secondary-btn" onClick={handleStartOver}>Start over</button>
          </div>
          <SuggestedModules currentModuleId="ollama" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default Ollama
