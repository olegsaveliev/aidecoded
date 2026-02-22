import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { ragQuiz } from './quizData.js'
import './RAG.css'

const RAG_TOOLS = {
  0: [
    { name: 'LangChain', color: '#34C759', desc: 'Most popular framework for building RAG systems' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Data framework for document Q&A' },
    { name: 'Haystack', color: '#34C759', desc: 'End-to-end NLP and RAG pipelines' },
  ],
  1: [
    { name: 'LangChain RAG', color: '#34C759', desc: 'RetrievalQA and conversational RAG chains' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Index, retrieve, and query documents' },
    { name: 'Haystack Pipeline', color: '#34C759', desc: 'Modular pipeline components for RAG' },
  ],
  2: [
    { name: 'OpenAI Embeddings', color: '#0071E3', desc: 'text-embedding-3-small — fast and affordable' },
    { name: 'Sentence Transformers', color: '#34C759', desc: 'Free open source embedding models' },
    { name: 'Cohere Embeddings', color: '#0071E3', desc: 'Multilingual enterprise embeddings' },
  ],
  3: [
    { name: 'LangChain TextSplitter', color: '#34C759', desc: 'Recursive and semantic text splitting' },
    { name: 'LlamaIndex NodeParser', color: '#34C759', desc: 'Document node parsing with metadata' },
    { name: 'Unstructured.io', color: '#34C759', desc: 'Extract text from PDFs, docs, and HTML' },
  ],
  4: [
    { name: 'Pinecone', color: '#FF9500', desc: 'Managed vector database for production' },
    { name: 'Weaviate', color: '#FF9500', desc: 'Open source vector database' },
    { name: 'Chroma', color: '#FF9500', desc: 'Lightweight vector DB for local development' },
    { name: 'pgvector', color: '#FF9500', desc: 'PostgreSQL extension for vector search' },
    { name: 'Qdrant', color: '#FF9500', desc: 'High performance vector similarity engine' },
  ],
  5: [
    { name: 'LangChain', color: '#34C759', desc: 'Production RAG with agents and tools' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Enterprise document intelligence' },
    { name: 'Azure AI Search', color: '#0071E3', desc: 'Microsoft\'s managed search + vector service' },
  ],
  6: [
    { name: 'LangChain', color: '#34C759', desc: 'Build RAG in under 50 lines of Python' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Simple document Q&A in 5 lines' },
    { name: 'Flowise', color: '#34C759', desc: 'No-code RAG builder with visual UI' },
    { name: 'Vercel AI SDK', color: '#34C759', desc: 'Build RAG into Next.js apps' },
  ],
}

const STAGES = [
  { key: 'problem', label: 'The Problem', emoji: '🎯' },
  { key: 'pipeline', label: 'How RAG Works', emoji: '⚙️' },
  { key: 'embeddings', label: 'Vector Embeddings', emoji: '🔢' },
  { key: 'chunking', label: 'Chunking', emoji: '✂️' },
  { key: 'vector-dbs', label: 'Vector Databases', emoji: '🗄️' },
  { key: 'real-world', label: 'Real World', emoji: '🌍' },
  { key: 'build', label: 'Build It', emoji: '🛠️' },
]

const STAGE_TOOLTIPS = {
  'problem': 'Why LLMs fail on company-specific questions and how RAG fixes it.',
  'pipeline': 'The two-phase RAG pipeline: indexing and querying.',
  'embeddings': 'How vector embeddings enable semantic search for document retrieval.',
  'chunking': 'Strategies for splitting documents into effective chunks.',
  'vector-dbs': 'Specialized databases optimized for fast similarity search.',
  'real-world': 'How enterprises use RAG for knowledge bases, search, and more.',
  'build': 'Step-by-step guide to building your first RAG system.',
}

const QUICK_REFERENCE = [
  { emoji: '🎯', technique: 'Problem Fit', when: 'Company-specific AI', phrase: 'Retrieve, inject, generate' },
  { emoji: '⚙️', technique: 'RAG Pipeline', when: 'Every RAG system', phrase: 'Index once, query many' },
  { emoji: '🔢', technique: 'Embeddings', when: 'Semantic search', phrase: 'Meaning = similar vectors' },
  { emoji: '✂️', technique: 'Chunking', when: 'Document prep', phrase: '200-500 tokens with overlap' },
  { emoji: '🗄️', technique: 'Vector DB', when: 'Production RAG', phrase: 'ANN search at scale' },
  { emoji: '🌍', technique: 'Use Cases', when: 'Enterprise AI', phrase: 'Knowledge that knows you' },
  { emoji: '🛠️', technique: 'Implementation', when: 'Building RAG', phrase: 'Start simple, iterate' },
]

/* ═══════════════════════════════════
   STAGE 1 — THE PROBLEM RAG SOLVES
   ═══════════════════════════════════ */
function ProblemViz({ active }) {
  const [showRight, setShowRight] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return
    setShowRight(false)
    timerRef.current = setTimeout(() => setShowRight(true), 800)
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <div className="rag-viz">
      <div className="rag-demo-label">Without RAG vs With RAG:</div>
      <div className="rag-comparison">
        <div className="rag-comp-panel rag-comp-bad how-fade-in">
          <div className="rag-comp-label">❌ Without RAG</div>
          <div className="rag-comp-prompt">User: "What is our company refund policy?"</div>
          <div className="rag-comp-divider" />
          <div className="rag-comp-response">AI: "I don't have access to your company's specific refund policy. Please check your company documentation."</div>
          <div className="rag-comp-verdict rag-verdict-bad">AI is useless for company-specific questions</div>
        </div>
        <div className={`rag-comp-panel rag-comp-good ${showRight ? 'how-fade-in' : 'rag-comp-hidden'}`}>
          <div className="rag-comp-label">✅ With RAG</div>
          <div className="rag-comp-prompt">User: "What is our company refund policy?"</div>
          <div className="rag-comp-divider" />
          <div className="rag-comp-response">AI: "According to your policy document (Section 3.2): Customers may request refunds within 30 days of purchase for unused products. Digital products are non-refundable unless defective."</div>
          <div className="rag-comp-verdict rag-verdict-good">AI answers from YOUR actual documents</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 2 — HOW RAG WORKS (PIPELINE)
   ═══════════════════════════════════ */
function PipelineViz({ active }) {
  const [indexStep, setIndexStep] = useState(0)
  const [queryStep, setQueryStep] = useState(0)
  const timerRef = useRef(null)

  const indexSteps = [
    { icon: '📄', label: 'Documents' },
    { icon: '✂️', label: 'Chunk Documents' },
    { icon: '🔢', label: 'Create Embeddings' },
    { icon: '🗄️', label: 'Store in Vector DB' },
  ]

  const querySteps = [
    { icon: '❓', label: 'User Question' },
    { icon: '🔢', label: 'Convert to Embedding' },
    { icon: '🔍', label: 'Search Vector DB' },
    { icon: '📄', label: 'Retrieve Top Chunks' },
    { icon: '📦', label: 'Inject into Context' },
    { icon: '🤖', label: 'LLM Generates Answer' },
    { icon: '✅', label: 'Grounded Answer' },
  ]

  useEffect(() => {
    if (!active || indexStep > 0) return
    let idx = 0
    timerRef.current = setInterval(() => {
      idx++
      if (idx <= indexSteps.length) {
        setIndexStep(idx)
      } else {
        const qIdx = idx - indexSteps.length
        if (qIdx <= querySteps.length) {
          setQueryStep(qIdx)
        } else {
          clearInterval(timerRef.current)
        }
      }
    }, 400)
    return () => clearInterval(timerRef.current)
  }, [active])

  function replay() {
    clearInterval(timerRef.current)
    setIndexStep(0)
    setQueryStep(0)
    let idx = 0
    timerRef.current = setInterval(() => {
      idx++
      if (idx <= indexSteps.length) {
        setIndexStep(idx)
      } else {
        const qIdx = idx - indexSteps.length
        if (qIdx <= querySteps.length) {
          setQueryStep(qIdx)
        } else {
          clearInterval(timerRef.current)
        }
      }
    }, 400)
  }

  return (
    <div className="rag-viz">
      <div className="rag-demo-label">The RAG pipeline — two phases:</div>

      <div className="rag-phase-label rag-phase-index">INDEXING PHASE <span>(happens once)</span></div>
      <div className="rag-pipeline">
        {indexSteps.map((step, i) => {
          const connector = i > 0 ? (
            <div key={`ic${i}`} className={`rag-pipe-connector ${indexStep > i ? 'rag-pipe-connector-active' : ''}`}>
              <svg width="24" height="12" viewBox="0 0 24 12"><path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          ) : null
          return [
            connector,
            <div key={`is${i}`} className={`rag-pipe-step ${indexStep > i ? 'rag-pipe-step-active' : ''}`}>
              <span className="rag-pipe-step-icon">{step.icon}</span>
              <span className="rag-pipe-step-label">{step.label}</span>
            </div>,
          ]
        })}
      </div>

      <div className="rag-phase-divider" />

      <div className="rag-phase-label rag-phase-query">QUERY PHASE <span>(every question)</span></div>
      <div className="rag-pipeline rag-pipeline-query">
        {querySteps.map((step, i) => {
          const connector = i > 0 ? (
            <div key={`qc${i}`} className={`rag-pipe-connector ${queryStep > i ? 'rag-pipe-connector-active rag-pipe-connector-query' : ''}`}>
              <svg width="24" height="12" viewBox="0 0 24 12"><path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          ) : null
          return [
            connector,
            <div key={`qs${i}`} className={`rag-pipe-step ${queryStep > i ? 'rag-pipe-step-active rag-pipe-step-query' : ''}`}>
              <span className="rag-pipe-step-icon">{step.icon}</span>
              <span className="rag-pipe-step-label">{step.label}</span>
            </div>,
          ]
        })}
      </div>

      {queryStep >= querySteps.length && (
        <div style={{ textAlign: 'center' }}>
          <button className="rag-replay-btn" onClick={replay}>↺ Replay Animation</button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 3 — VECTOR EMBEDDINGS IN RAG
   ═══════════════════════════════════ */
function EmbeddingsViz({ active }) {
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [animDone, setAnimDone] = useState(false)

  const chunks = [
    { id: 0, label: 'Refund policy: 30-day returns for unused items', x: 70, y: 60, group: 'policy' },
    { id: 1, label: 'Shipping takes 3-5 business days domestic', x: 280, y: 180, group: 'shipping' },
    { id: 2, label: 'Money-back guarantee on defective products', x: 110, y: 120, group: 'policy' },
    { id: 3, label: 'Contact support at help@company.com', x: 320, y: 80, group: 'support' },
    { id: 4, label: 'Return procedure: fill form, ship item back', x: 140, y: 90, group: 'policy' },
  ]

  const queries = [
    { text: 'Can I get my money back?', matches: [0, 2, 4] },
    { text: 'How long until my package arrives?', matches: [1] },
    { text: 'How do I reach customer service?', matches: [3] },
  ]

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setAnimDone(true), 600)
    return () => clearTimeout(timer)
  }, [active])

  const matchedChunks = selectedQuery !== null ? queries[selectedQuery].matches : []

  return (
    <div className="rag-viz">
      <div className="rag-demo-label">Vector search matches MEANING, not just keywords:</div>

      <div className="rag-embed-demo">
        <div className="rag-embed-chunks">
          {chunks.map((chunk) => {
            const isMatched = matchedChunks.includes(chunk.id)
            return (
              <div
                key={chunk.id}
                className={`rag-embed-chunk ${animDone ? 'rag-embed-chunk-visible' : ''} ${isMatched ? 'rag-embed-chunk-matched' : ''}`}
                style={{ animationDelay: `${chunk.id * 0.1}s` }}
              >
                <span className="rag-embed-chunk-icon">📄</span>
                <span className="rag-embed-chunk-text">{chunk.label}</span>
                {isMatched && <span className="rag-embed-chunk-score">Match</span>}
              </div>
            )
          })}
        </div>

        <div className="rag-embed-queries">
          <div className="rag-embed-queries-title">Try a query — see which chunks match:</div>
          {queries.map((q, i) => (
            <button
              key={i}
              className={`rag-embed-query-btn ${selectedQuery === i ? 'rag-embed-query-active' : ''}`}
              onClick={() => setSelectedQuery(selectedQuery === i ? null : i)}
            >
              ❓ {q.text}
            </button>
          ))}
        </div>

        {selectedQuery !== null && (
          <div className="rag-embed-result how-pop-in">
            <strong>Semantic search result:</strong> Found {matchedChunks.length} relevant chunk{matchedChunks.length !== 1 ? 's' : ''} — even without exact keyword matches!
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 4 — CHUNKING STRATEGIES
   ═══════════════════════════════════ */
function ChunkingViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const timerRef = useRef(null)

  const strategies = [
    {
      name: 'Fixed Size',
      tag: 'Simple',
      icon: '📏',
      desc: 'Split every 500 tokens',
      visual: ['Chunk 1: 500 tokens', 'Chunk 2: 500 tokens', 'Chunk 3: 500 tokens'],
      pro: 'Simple to implement',
      con: 'Cuts sentences mid-way',
    },
    {
      name: 'Semantic',
      tag: 'Better',
      icon: '📝',
      desc: 'Split at paragraph/section boundaries',
      visual: ['[Introduction]', '[Section 1]', '[Section 2]'],
      pro: 'Preserves meaning',
      con: 'Uneven sizes',
    },
    {
      name: 'Hierarchical',
      tag: 'Best',
      icon: '🏗️',
      desc: 'Small chunks with parent context',
      visual: ['[Summary] → [Section] → [Paragraph]'],
      pro: 'Multi-level retrieval',
      con: 'More complex',
    },
  ]

  function startAnimation() {
    clearTimeout(timerRef.current)
    setVisibleCards(0)
    let i = 0
    function showNext() {
      i++
      setVisibleCards(i)
      if (i < strategies.length) {
        timerRef.current = setTimeout(showNext, 500)
      }
    }
    timerRef.current = setTimeout(showNext, 300)
  }

  useEffect(() => {
    if (active) startAnimation()
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <div className="rag-viz">
      <div className="rag-demo-label">Three ways to split your documents:</div>

      <div className="rag-chunking-cards">
        {strategies.map((s, i) => (
          <div key={i} className={`rag-chunking-card ${i < visibleCards ? 'rag-chunking-card-visible' : ''}`}>
            <div className="rag-chunking-card-header">
              <span className="rag-chunking-card-icon">{s.icon}</span>
              <span className="rag-chunking-card-name">{s.name}</span>
              <span className={`rag-chunking-tag rag-chunking-tag-${s.tag.toLowerCase()}`}>{s.tag}</span>
            </div>
            <div className="rag-chunking-card-desc">{s.desc}</div>
            <div className="rag-chunking-visual">
              {s.visual.map((v, j) => (
                <span key={j} className="rag-chunking-visual-block">{v}</span>
              ))}
            </div>
            <div className="rag-chunking-pros">
              <span className="rag-chunking-pro">✅ {s.pro}</span>
              <span className="rag-chunking-con">❌ {s.con}</span>
            </div>
          </div>
        ))}
      </div>

      {visibleCards === 0 && (
        <button className="pe-replay-btn" onClick={startAnimation} style={{ marginTop: 8 }}>Play demo</button>
      )}
      {visibleCards >= strategies.length && (
        <button className="pe-replay-btn" onClick={startAnimation}>Replay animation</button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 5 — VECTOR DATABASES
   ═══════════════════════════════════ */
function VectorDBViz() {
  const [searchActive, setSearchActive] = useState(false)
  const [dotStates, setDotStates] = useState([])
  const timerRef = useRef(null)

  const databases = [
    { name: 'Pinecone', bestFor: 'Production', hosted: 'Yes', free: 'Limited' },
    { name: 'Weaviate', bestFor: 'Open source', hosted: 'Both', free: 'Yes' },
    { name: 'Chroma', bestFor: 'Local dev', hosted: 'No', free: 'Yes' },
    { name: 'pgvector', bestFor: 'Postgres users', hosted: 'Both', free: 'Yes' },
    { name: 'Qdrant', bestFor: 'High performance', hosted: 'Both', free: 'Yes' },
  ]

  // Generate random dots for visualization
  const dotsInitialized = useRef(false)
  if (!dotsInitialized.current && dotStates.length === 0) {
    dotsInitialized.current = true
    const dots = []
    for (let i = 0; i < 40; i++) {
      dots.push({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        highlighted: false,
      })
    }
    setDotStates(dots)
  }

  function runSearch() {
    setSearchActive(true)
    // Highlight 5 nearest dots
    const updated = dotStates.map((d, i) => ({
      ...d,
      highlighted: i < 5,
    }))
    setDotStates(updated)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSearchActive(false)
      setDotStates((prev) => prev.map((d) => ({ ...d, highlighted: false })))
    }, 3000)
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="rag-viz">
      <div className="rag-demo-label">Vector databases find similar content at scale:</div>

      <div className="rag-vdb-visual">
        <div className="rag-vdb-canvas">
          {dotStates.map((dot, i) => (
            <div
              key={i}
              className={`rag-vdb-dot ${dot.highlighted ? 'rag-vdb-dot-highlighted' : ''}`}
              style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            />
          ))}
          {searchActive && (
            <div className="rag-vdb-query-dot" style={{ left: '50%', top: '50%' }}>
              <span>❓</span>
            </div>
          )}
        </div>
        <button className="rag-vdb-search-btn" onClick={runSearch} disabled={searchActive}>
          {searchActive ? 'Searching 1M documents... 23ms' : '🔍 Run similarity search'}
        </button>
      </div>

      <div className="rag-vdb-table-wrapper">
        <table className="rag-vdb-table">
          <thead>
            <tr>
              <th>Database</th>
              <th>Best For</th>
              <th>Hosted?</th>
              <th>Free?</th>
            </tr>
          </thead>
          <tbody>
            {databases.map((db) => (
              <tr key={db.name}>
                <td className="rag-vdb-name">{db.name}</td>
                <td>{db.bestFor}</td>
                <td>{db.hosted}</td>
                <td>{db.free}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 6 — RAG IN THE REAL WORLD
   ═══════════════════════════════════ */
function RealWorldViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const timerRef = useRef(null)

  const useCases = [
    {
      icon: '🏢',
      name: 'Enterprise Knowledge Base',
      desc: 'Company uploads HR policies, product docs, SOPs → Employees ask questions in natural language → AI answers from actual company documents',
      companies: 'Microsoft Copilot, Notion AI',
    },
    {
      icon: '🛒',
      name: 'E-commerce Product Search',
      desc: 'Product catalog converted to embeddings → Customer searches "comfortable shoes for standing" → Returns semantically relevant products',
      companies: 'Shopify, Amazon',
    },
    {
      icon: '🏥',
      name: 'Medical Knowledge',
      desc: 'Medical literature indexed as vectors → Doctor queries symptoms and patient history → AI retrieves relevant research and guidelines',
      companies: 'Research institutions',
    },
    {
      icon: '💻',
      name: 'Code Assistant',
      desc: 'Entire codebase indexed → Developer asks "how does auth work in our app?" → AI retrieves relevant code files and explains',
      companies: 'GitHub Copilot, Cursor',
    },
  ]

  function startAnimation() {
    clearTimeout(timerRef.current)
    setVisibleCards(0)
    let i = 0
    function showNext() {
      i++
      setVisibleCards(i)
      if (i < useCases.length) {
        timerRef.current = setTimeout(showNext, 400)
      }
    }
    timerRef.current = setTimeout(showNext, 300)
  }

  useEffect(() => {
    if (active) startAnimation()
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <div className="rag-viz">
      <div className="rag-demo-label">RAG powers real enterprise AI:</div>

      <div className="rag-realworld-cards">
        {useCases.map((uc, i) => (
          <div key={i} className={`rag-realworld-card ${i < visibleCards ? 'rag-realworld-card-visible' : ''}`}>
            <div className="rag-realworld-card-icon">{uc.icon}</div>
            <div className="rag-realworld-card-content">
              <div className="rag-realworld-card-name">{uc.name}</div>
              <div className="rag-realworld-card-desc">{uc.desc}</div>
              <div className="rag-realworld-card-companies">Used by: {uc.companies}</div>
            </div>
          </div>
        ))}
      </div>

      {visibleCards === 0 && (
        <button className="pe-replay-btn" onClick={startAnimation} style={{ marginTop: 8 }}>Play demo</button>
      )}
      {visibleCards >= useCases.length && (
        <button className="pe-replay-btn" onClick={startAnimation}>Replay animation</button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 7 — BUILDING YOUR FIRST RAG
   ═══════════════════════════════════ */
function BuildViz({ active }) {
  const [checkedSteps, setCheckedSteps] = useState({})
  const [visibleSteps, setVisibleSteps] = useState(0)
  const timerRef = useRef(null)

  const buildSteps = [
    { label: 'Choose your documents (PDFs, docs, websites)', code: null },
    { label: 'Choose a chunking strategy', code: `from langchain.text_splitter import RecursiveCharacterTextSplitter\n\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=500,\n    chunk_overlap=50\n)\nchunks = splitter.split_documents(documents)` },
    { label: 'Choose an embedding model', code: `from langchain.embeddings import OpenAIEmbeddings\n\nembeddings = OpenAIEmbeddings(\n    model="text-embedding-3-small"\n)` },
    { label: 'Choose a vector database', code: `from langchain.vectorstores import Chroma` },
    { label: 'Index your documents', code: `vectorstore = Chroma.from_documents(\n    chunks, embeddings\n)` },
    { label: 'Build the query pipeline', code: `retriever = vectorstore.as_retriever(\n    search_kwargs={"k": 3}\n)` },
    { label: 'Connect to your LLM', code: `from langchain.chains import RetrievalQA\n\nqa_chain = RetrievalQA.from_chain_type(\n    llm=llm,\n    retriever=retriever\n)` },
    { label: 'Test with real questions', code: `result = qa_chain.run(\n    "What is our refund policy?"\n)` },
  ]

  useEffect(() => {
    if (!active || visibleSteps > 0) return
    let step = 0
    timerRef.current = setInterval(() => {
      step++
      setVisibleSteps(step)
      if (step >= buildSteps.length) clearInterval(timerRef.current)
    }, 300)
    return () => clearInterval(timerRef.current)
  }, [active])

  function toggleStep(i) {
    setCheckedSteps((prev) => ({ ...prev, [i]: !prev[i] }))
  }

  const [copiedIdx, setCopiedIdx] = useState(null)

  function copyCode(code, idx) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    })
  }

  return (
    <div className="rag-viz">
      <div className="rag-demo-label">Build a RAG system step by step:</div>

      <div className="rag-build-steps">
        {buildSteps.map((step, i) => (
          <div key={i} className={`rag-build-step ${i < visibleSteps ? 'rag-build-step-visible' : ''}`}>
            <label className="rag-build-step-header" onClick={() => toggleStep(i)}>
              <span className={`rag-build-checkbox ${checkedSteps[i] ? 'rag-build-checkbox-checked' : ''}`}>
                {checkedSteps[i] ? '✓' : (i + 1)}
              </span>
              <span className={`rag-build-step-label ${checkedSteps[i] ? 'rag-build-step-done' : ''}`}>{step.label}</span>
            </label>
            {step.code && (
              <div className="rag-build-code-wrapper">
                <button className="rag-build-copy-btn" onClick={() => copyCode(step.code, i)}>
                  {copiedIdx === i ? 'Copied!' : 'Copy'}
                </button>
                <pre className="rag-build-code">{step.code}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
function RAG({ onSwitchTab, onGoHome }) {
  const [stage, setStage] = useState(-1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showFinal, setShowFinal] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const activeStepRef = useRef(null)

  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [stage])

  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setShowFinal(true)
      setStage(STAGES.length)
    }
  }

  function prevStage() {
    if (stage > 0) setStage(stage - 1)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
  }

  const vizComponents = {
    0: <ProblemViz active={stage === 0} />,
    1: <PipelineViz active={stage === 1} />,
    2: <EmbeddingsViz active={stage === 2} />,
    3: <ChunkingViz active={stage === 3} />,
    4: <VectorDBViz />,
    5: <RealWorldViz active={stage === 5} />,
    6: <BuildViz active={stage === 6} />,
  }

  const explanations = {
    0: {
      title: 'Stage 1: The Problem RAG Solves',
      content: "LLMs are trained on general internet data. They know nothing about:\n\n- Your company policies and procedures\n- Your product documentation\n- Your internal knowledge base\n- Recent events after their training cutoff\n\nRAG (Retrieval Augmented Generation) solves this by retrieving relevant information from YOUR documents and injecting it into the context window before the AI answers.\n\nNo retraining. No fine-tuning. Just smart context engineering.",
    },
    1: {
      title: 'Stage 2: How RAG Works',
      content: "RAG has two phases:\n\nINDEXING (setup, done once):\n1. Split your documents into chunks (~500 tokens each)\n2. Convert each chunk to an embedding vector\n3. Store vectors in a vector database\n\nQUERYING (every user question):\n1. Convert user question to embedding\n2. Find chunks with similar embeddings (semantic search)\n3. Add those chunks to the AI's context\n4. AI answers using retrieved context\n\nThe magic: similar meaning = similar vectors, so searching by meaning finds the right content even if exact words don't match.",
    },
    2: {
      title: 'Stage 3: Why Vectors Enable Smart Search',
      content: "Traditional search matches exact keywords. Vector search matches MEANING.\n\nExample:\nQuery: 'Can I get my money back?'\nMatches: 'refund policy', 'return procedure', 'money-back guarantee' — even without the word 'money back'\n\nThis is why RAG finds relevant content even when users phrase things differently than the documentation.\n\n💡 The same embeddings you saw in 'How LLMs Work' are used here to power intelligent document retrieval.",
    },
    3: {
      title: 'Stage 4: Chunking — The Art of Splitting Docs',
      content: "How you split documents dramatically affects RAG quality. Too large: irrelevant content dilutes results. Too small: missing context makes chunks useless.\n\nBest practices:\n- 200-500 tokens per chunk for most use cases\n- Always include some overlap between chunks (50-100 tokens)\n- Split at natural boundaries (paragraphs, sections)\n- Include document title/metadata in each chunk\n\n💡 Chunking strategy is often the biggest factor in RAG system quality — more than the model choice.",
    },
    4: {
      title: 'Stage 5: Vector Databases',
      content: "A vector database is optimized for one thing: finding similar vectors FAST — even with millions of documents.\n\nRegular databases ask: 'Find rows where id = 5'\nVector databases ask: 'Find the 5 most similar vectors to this query vector'\n\nThis is called Approximate Nearest Neighbor (ANN) search and it's what makes RAG fast enough for real-time use.",
    },
    5: {
      title: 'Stage 6: RAG Powers the Enterprise AI Revolution',
      content: "RAG is why AI is finally useful in business settings. Instead of generic AI that knows nothing about your company, RAG gives you AI that IS an expert on your specific domain.\n\nThe business case is clear:\n- Faster employee onboarding (AI knows your processes)\n- Better customer support (AI knows your products)\n- Smarter search (find meaning, not just keywords)\n- Compliance-friendly (AI only uses approved sources)",
    },
    6: {
      title: 'Stage 7: Build Your First RAG System',
      content: "With modern frameworks like LangChain and LlamaIndex, a basic RAG system can be built in under 50 lines of Python.\n\nThe hard parts are actually:\n- Getting high quality, clean documents\n- Choosing the right chunking strategy\n- Evaluating retrieval quality\n- Handling edge cases (no relevant docs found)\n\nStart simple, then optimize based on where it fails.",
    },
  }

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="rag" size={48} />}
        title="RAG — Retrieval Augmented Generation"
        description="Ever wonder how ChatGPT plugins work? Or how companies build AI that knows their internal docs? That's RAG — the most powerful enterprise AI technique available today. No model training required."
        buttonText="Start Learning"
        onStart={() => setStage(0)}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms rag-root quiz-fade-in">
        <Quiz
          questions={ragQuiz}
          tabName="RAG"
          onBack={() => setShowQuiz(false)}
          onGoHome={onGoHome ? () => { reset(); onGoHome() } : undefined}
        />
      </div>
    )
  }

  return (
    <div className="how-llms rag-root">
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to RAG</strong> — This is how companies like Microsoft, Google and thousands of enterprises make AI work with their own data. By the end you'll understand exactly how it works and how to implement it.
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper rag-stepper">
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
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
                          <svg width="24" height="12" viewBox="0 0 24 12">
                            <path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="how-content">
            {stage >= 0 && stage < STAGES.length && (
              <div className="how-stage how-fade-in" key={stage}>
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>{explanations[stage].title}</strong>
                  </div>
                  {explanations[stage].content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <ToolChips tools={RAG_TOOLS[stage]} />
                </div>

                {vizComponents[stage]}

                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>← Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {[
                        'Show me the pipeline →',
                        'Why vectors? →',
                        'How to chunk? →',
                        'Pick a database →',
                        'Real world examples →',
                        'Build my first RAG →',
                        'Test my knowledge →',
                      ][stage]}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">🎉 You're now a RAG Expert!</div>

          <div className="pe-final-grid">
            {QUICK_REFERENCE.map((item) => (
              <div key={item.technique} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.emoji}</div>
                <div className="pe-final-card-name">{item.technique}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">📋 Your RAG Toolkit</div>
            <table className="pe-reference">
              <thead>
                <tr>
                  <th>Technique</th>
                  <th>When to use</th>
                  <th>Key phrase</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((item) => (
                  <tr key={item.technique}>
                    <td className="pe-ref-technique">{item.technique}</td>
                    <td>{item.when}</td>
                    <td className="pe-ref-phrase">{item.phrase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            {onSwitchTab && (
              <>
                <button className="how-start-btn" onClick={() => onSwitchTab('playground')}>
                  → Practice in Playground
                </button>
                <button className="how-secondary-btn" onClick={() => onSwitchTab('context-engineering')}>
                  → Try Context Engineering next
                </button>
              </>
            )}
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RAG
