import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon, SearchIcon, LayersIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { ragUnderTheHoodQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './RAGUnderTheHood.css'

const STAGES = [
  { key: 'why-rag-fails', label: 'Why It Fails', tooltip: 'Why RAG fails in production when it worked in demos' },
  { key: 'chunking', label: 'Chunking', tooltip: 'How you split documents changes everything' },
  { key: 'metadata', label: 'Metadata', tooltip: 'The secret ingredient most teams skip' },
  { key: 'embeddings', label: 'Embeddings', tooltip: 'What actually gets stored and searched' },
  { key: 'retrieval', label: 'Retrieval', tooltip: 'Why semantic search misses things' },
  { key: 'filtering', label: 'Filtering', tooltip: 'Narrowing before you search' },
  { key: 'checklist', label: 'Checklist', tooltip: 'Putting it all together &mdash; the production RAG checklist' },
]

const PIPELINE_LAYERS = ['Chunk', 'Meta', 'Embed', 'Retrieve', 'Filter']

const TOOLKIT = [
  { layer: 'Chunking', fix: 'Paragraph splitting with overlap', why: 'Preserves meaning across boundaries' },
  { layer: 'Metadata', fix: 'Rich metadata on every chunk', why: 'Enables precise filtering and attribution' },
  { layer: 'Embeddings', fix: 'Domain-tuned embedding model', why: 'Understands your specific terminology' },
  { layer: 'Retrieval', fix: 'Hybrid search with reranker', why: 'Catches both semantic and exact matches' },
  { layer: 'Filtering', fix: 'Pre-filtering before search', why: 'Reduces noise, enforces access control' },
]

const RUH_TOOLS = {
  0: [
    { name: 'LangChain', color: '#5856D6', desc: 'Python framework for LLM applications' },
    { name: 'LlamaIndex', color: '#5856D6', desc: 'Data framework for LLM applications' },
    { name: 'Haystack', color: '#5856D6', desc: 'Open-source NLP framework' },
    { name: 'Pinecone', color: '#8E8E93', desc: 'Managed vector database' },
    { name: 'Weaviate', color: '#8E8E93', desc: 'Open-source vector database' },
    { name: 'ChromaDB', color: '#8E8E93', desc: 'Embedding database' },
  ],
  1: [
    { name: 'LangChain RecursiveTextSplitter', color: '#5856D6', desc: 'Recursive document splitting' },
    { name: 'LlamaIndex SentenceSplitter', color: '#5856D6', desc: 'Sentence-aware splitting' },
    { name: 'tiktoken', color: '#5856D6', desc: 'OpenAI tokenizer for chunk sizing' },
    { name: 'Unstructured.io', color: '#8E8E93', desc: 'Document parsing and chunking' },
    { name: 'spaCy', color: '#8E8E93', desc: 'NLP library for sentence detection' },
    { name: 'NLTK', color: '#8E8E93', desc: 'Natural language toolkit' },
    { name: 'semantic-chunker', color: '#8E8E93', desc: 'Meaning-based chunking' },
  ],
  2: [
    { name: 'LangChain Document metadata', color: '#5856D6', desc: 'Metadata attachment for documents' },
    { name: 'LlamaIndex node metadata', color: '#5856D6', desc: 'Node-level metadata management' },
    { name: 'Unstructured.io', color: '#5856D6', desc: 'Document parsing with metadata extraction' },
    { name: 'AWS Textract', color: '#8E8E93', desc: 'Document text and metadata extraction' },
    { name: 'Azure Document Intelligence', color: '#8E8E93', desc: 'AI document processing' },
    { name: 'PyMuPDF', color: '#8E8E93', desc: 'PDF parsing library' },
    { name: 'pdfplumber', color: '#8E8E93', desc: 'PDF text extraction' },
  ],
  3: [
    { name: 'OpenAI text-embedding-3', color: '#5856D6', desc: 'Latest OpenAI embedding models' },
    { name: 'Cohere embed-v3', color: '#5856D6', desc: 'Multilingual embedding model' },
    { name: 'Sentence Transformers', color: '#5856D6', desc: 'Python framework for embeddings' },
    { name: 'Voyage AI', color: '#8E8E93', desc: 'Domain-specific embeddings' },
    { name: 'Jina AI', color: '#8E8E93', desc: 'Multimodal embedding models' },
    { name: 'MTEB leaderboard', color: '#8E8E93', desc: 'Embedding model benchmark' },
    { name: 'Hugging Face', color: '#8E8E93', desc: 'Model hub and inference' },
    { name: 'Nomic embed', color: '#8E8E93', desc: 'Open-source embedding model' },
  ],
  4: [
    { name: 'Cohere Rerank', color: '#5856D6', desc: 'Neural reranking model' },
    { name: 'LangChain EnsembleRetriever', color: '#5856D6', desc: 'Hybrid retrieval combining multiple strategies' },
    { name: 'LlamaIndex hybrid', color: '#5856D6', desc: 'Combined semantic and keyword search' },
    { name: 'Pinecone hybrid', color: '#8E8E93', desc: 'Built-in hybrid search' },
    { name: 'Weaviate hybrid', color: '#8E8E93', desc: 'Combined BM25 and vector search' },
    { name: 'Elasticsearch', color: '#8E8E93', desc: 'Full-text and vector search engine' },
  ],
  5: [
    { name: 'Pinecone metadata filtering', color: '#5856D6', desc: 'Server-side metadata filters' },
    { name: 'Weaviate where filter', color: '#5856D6', desc: 'GraphQL-style filtering' },
    { name: 'ChromaDB where', color: '#5856D6', desc: 'Metadata filtering for ChromaDB' },
    { name: 'Qdrant payload filter', color: '#8E8E93', desc: 'Payload-based filtering' },
    { name: 'LangChain', color: '#8E8E93', desc: 'Self-query retriever with metadata' },
    { name: 'LlamaIndex metadata filters', color: '#8E8E93', desc: 'Auto metadata filtering' },
    { name: 'Amazon Bedrock Knowledge Bases', color: '#8E8E93', desc: 'Managed RAG with filtering' },
  ],
  6: [],
}

/* ─── Handbook sample text used across stages ─── */
const HANDBOOK_TEXT = `Section 4: Remote Work Policy

4.1 Eligibility
All full-time employees in approved roles are eligible for remote work arrangements. Eligibility is determined by department heads in consultation with HR.

4.2 Remote Work Guidelines
Remote work is permitted for roles approved by the manager on a case-by-case basis. Employees must maintain core hours (10am\u20132pm local time) and attend all mandatory meetings. Equipment allowance of $500 per year is provided for home office setup.

4.3 Performance Standards
Remote employees are held to the same performance standards as in-office staff. Quarterly reviews will assess productivity, communication, and collaboration metrics.`

const HANDBOOK_CHUNKS_FIXED = [
  { text: 'Section 4: Remote Work Policy\n\n4.1 Eligibility\nAll full-time employees in approved roles are eligible for remote work arrangements. Eligibility is determined by', split: true },
  { text: 'department heads in consultation with HR.\n\n4.2 Remote Work Guidelines\nRemote work is permitted for roles approved by the manager on a case-by-case', split: true },
  { text: 'basis. Employees must maintain core hours (10am\u20132pm local time) and attend all mandatory meetings. Equipment allowance of $500 per year is provided for', split: true },
  { text: 'home office setup.\n\n4.3 Performance Standards\nRemote employees are held to the same performance standards as in-office staff.', split: false },
]

const HANDBOOK_CHUNKS_PARAGRAPH = [
  { text: 'Section 4: Remote Work Policy', section: true },
  { text: '4.1 Eligibility\nAll full-time employees in approved roles are eligible for remote work arrangements. Eligibility is determined by department heads in consultation with HR.', section: false },
  { text: '4.2 Remote Work Guidelines\nRemote work is permitted for roles approved by the manager on a case-by-case basis. Employees must maintain core hours (10am\u20132pm local time) and attend all mandatory meetings. Equipment allowance of $500 per year is provided for home office setup.', section: false },
  { text: '4.3 Performance Standards\nRemote employees are held to the same performance standards as in-office staff. Quarterly reviews will assess productivity, communication, and collaboration metrics.', section: false },
]

const HANDBOOK_CHUNKS_OVERLAP = [
  { text: '4.1 Eligibility\nAll full-time employees in approved roles are eligible for remote work arrangements. Eligibility is determined by department heads in consultation with HR.', overlap: null },
  { text: 'Eligibility is determined by department heads in consultation with HR.\n\n4.2 Remote Work Guidelines\nRemote work is permitted for roles approved by the manager on a case-by-case basis.', overlap: 'start' },
  { text: 'approved by the manager on a case-by-case basis. Employees must maintain core hours (10am\u20132pm local time) and attend all mandatory meetings. Equipment allowance of $500 per year is provided for home office setup.', overlap: 'start' },
  { text: 'Equipment allowance of $500 per year is provided for home office setup.\n\n4.3 Performance Standards\nRemote employees are held to the same performance standards as in-office staff.', overlap: 'start' },
]

const METADATA_FIELDS = [
  { id: 'source', label: 'source', example: 'employee-handbook-2024.pdf' },
  { id: 'section', label: 'section', example: 'Remote Work Policy' },
  { id: 'page', label: 'page', example: '14' },
  { id: 'department', label: 'department', example: 'HR' },
  { id: 'effective_date', label: 'effective_date', example: '2024-01-01' },
  { id: 'version', label: 'version', example: '3.2' },
  { id: 'status', label: 'status', example: 'approved' },
  { id: 'language', label: 'language', example: 'en' },
  { id: 'last_updated', label: 'last_updated', example: '2024-03-15' },
  { id: 'content_type', label: 'content_type', example: 'policy' },
  { id: 'audience', label: 'audience', example: 'all-employees' },
  { id: 'confidentiality', label: 'confidentiality', example: 'internal' },
]

const EMBEDDING_CLUSTERS = [
  { id: 'remote', label: 'Remote work', color: '#0071E3', dots: [
    { x: 85, y: 35, label: 'Remote work permitted', lx: 14, ly: 4 },
    { x: 115, y: 65, label: 'Working from home guidelines', lx: 14, ly: 4 },
    { x: 75, y: 95, label: 'WFH policy v2.3', lx: 14, ly: 4 },
    { x: 130, y: 125, label: 'Telecommuting arrangements', lx: 14, ly: 4 },
  ]},
  { id: 'leave', label: 'Leave policy', color: '#34C759', dots: [
    { x: 370, y: 35, label: 'Annual leave entitlement', lx: 14, ly: 4 },
    { x: 400, y: 65, label: 'Sick leave policy', lx: 14, ly: 4 },
    { x: 355, y: 95, label: 'PTO guidelines', lx: 14, ly: 4 },
    { x: 385, y: 125, label: 'Holiday calendar', lx: 14, ly: 4 },
  ]},
  { id: 'benefits', label: 'Benefits', color: '#FF9500', dots: [
    { x: 85, y: 230, label: 'Health insurance plan', lx: 14, ly: 4 },
    { x: 115, y: 260, label: '401k matching', lx: 14, ly: 4 },
    { x: 75, y: 290, label: 'Dental coverage', lx: 14, ly: 4 },
    { x: 130, y: 320, label: 'Employee wellness', lx: 14, ly: 4 },
  ]},
  { id: 'conduct', label: 'Code of conduct', color: '#5856D6', dots: [
    { x: 370, y: 230, label: 'Workplace behavior', lx: 14, ly: 4 },
    { x: 400, y: 260, label: 'Ethics guidelines', lx: 14, ly: 4 },
    { x: 355, y: 290, label: 'Harassment policy', lx: 14, ly: 4 },
    { x: 385, y: 320, label: 'Conflict resolution', lx: 14, ly: 4 },
  ]},
]

const FILTER_DOCS = (() => {
  const categories = [
    { dept: 'HR', color: '#0071E3', count: 12 },
    { dept: 'IT', color: '#34C759', count: 10 },
    { dept: 'Finance', color: '#FF9500', count: 8 },
    { dept: 'Legal', color: '#5856D6', count: 8 },
    { dept: 'Draft', color: '#8E8E93', count: 6 },
    { dept: 'Archive', color: '#A8A29E', count: 6 },
  ]
  const docs = []
  categories.forEach(cat => {
    for (let i = 0; i < cat.count; i++) {
      docs.push({
        id: `${cat.dept.toLowerCase()}-${i}`,
        dept: cat.dept,
        color: cat.color,
        approved: cat.dept !== 'Draft' && cat.dept !== 'Archive',
        current: cat.dept !== 'Archive',
      })
    }
  })
  return docs
})()

const CHECKLIST_SECTIONS = [
  {
    title: 'Chunking',
    items: [
      'Using paragraph or semantic splitting',
      '10\u201315% overlap applied',
      'Chunk size tested empirically',
    ],
  },
  {
    title: 'Metadata',
    items: [
      'Source, date, section fields attached',
      'Department and status fields attached',
      'Metadata quality reviewed at ingestion',
    ],
  },
  {
    title: 'Embeddings',
    items: [
      'Model evaluated on domain queries',
      '15+ of 20 test queries return correct chunk',
      'Dimension size matched to scale',
    ],
  },
  {
    title: 'Retrieval',
    items: [
      'Baseline measured with semantic only',
      'Keyword search added for exact terms',
      'Reranker added for precision improvement',
    ],
  },
  {
    title: 'Filtering',
    items: [
      'Metadata schema designed for filterability',
      'Pre-filtering applied before vector search',
      'Access control requirements implemented',
    ],
  },
]

/* ─── Pipeline Progress Bar ─── */
function PipelineProgress({ stage }) {
  const fixedCount = Math.max(0, Math.min(stage, 5))
  return (
    <div className="ruh-pipeline-bar">
      {PIPELINE_LAYERS.map((label, i) => {
        const fixed = i < fixedCount
        return (
          <div key={label} className="ruh-pipeline-item">
            {i > 0 && <div className={`ruh-pipeline-line ${fixed ? 'ruh-pipeline-line-fixed' : ''}`} />}
            <div className={`ruh-pipeline-dot ${fixed ? 'ruh-pipeline-dot-fixed' : 'ruh-pipeline-dot-broken'}`}>
              {fixed
                ? <CheckIcon size={14} color="#34C759" />
                : <CrossIcon size={14} color="#FF3B30" />
              }
            </div>
            <span className={`ruh-pipeline-label ${fixed ? 'ruh-pipeline-label-fixed' : ''}`}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Stage 1: Why RAG Fails ─── */
function WhyRAGFailsViz({ active }) {
  const [animStep, setAnimStep] = useState(0)
  const timersRef = useRef([])
  const pipelineStages = ['Document', 'Chunks', 'Metadata', 'Embeddings', 'Retrieval', 'Answer']

  useEffect(() => {
    if (!active) { setAnimStep(0); return }
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setAnimStep(0)
    pipelineStages.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setAnimStep(i + 1), 600 * (i + 1)))
    })
    return () => timersRef.current.forEach(clearTimeout)
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ruh-pipeline-viz">
      <div className="ruh-pipeline-stages">
        {pipelineStages.map((label, i) => (
          <div key={label} className="ruh-pipeline-stage-item">
            {i > 0 && <div className="ruh-pipeline-arrow">&rarr;</div>}
            <div className={`ruh-pipeline-stage-box ${animStep > i ? 'ruh-pipeline-stage-broken' : ''}`}>
              {label}
            </div>
          </div>
        ))}
      </div>
      {animStep >= pipelineStages.length && (
        <div className="ruh-pipeline-result ruh-pipeline-result-bad">
          <CrossIcon size={16} color="#FF3B30" />
          <span>Outdated policy returned. Manager approval requirement missing.</span>
        </div>
      )}
      <p className="ruh-pipeline-hint">Watch each layer turn green as we fix it.</p>
    </div>
  )
}

/* ─── Stage 2: Chunking Strategy ─── */
function ChunkingViz({ active }) {
  const [activeTab, setActiveTab] = useState('fixed')
  const [chunkSize, setChunkSize] = useState(400)
  const [revealedChunks, setRevealedChunks] = useState([])
  const timersRef = useRef([])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setRevealedChunks([])
    const chunks = activeTab === 'fixed' ? HANDBOOK_CHUNKS_FIXED
      : activeTab === 'paragraph' ? HANDBOOK_CHUNKS_PARAGRAPH
      : HANDBOOK_CHUNKS_OVERLAP
    chunks.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => {
        setRevealedChunks(prev => [...prev, i])
      }, 200 * (i + 1)))
    })
    return () => timersRef.current.forEach(clearTimeout)
  }, [activeTab])

  const precisionPct = chunkSize <= 200 ? 85 : chunkSize <= 400 ? 95 : chunkSize <= 600 ? 80 : 60
  const completenessPct = chunkSize <= 200 ? 40 : chunkSize <= 400 ? 75 : chunkSize <= 600 ? 90 : 98

  return (
    <div className="ruh-chunking-viz">
      <div className="ruh-tab-bar">
        {[
          { id: 'fixed', label: 'Fixed Size' },
          { id: 'paragraph', label: 'Paragraph' },
          { id: 'overlap', label: 'Sliding Window' },
        ].map(tab => (
          <button key={tab.id} className={`ruh-tab-btn ${activeTab === tab.id ? 'ruh-tab-btn-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ruh-chunks-display">
        {activeTab === 'fixed' && HANDBOOK_CHUNKS_FIXED.map((chunk, i) => (
          <div key={i} className={`ruh-chunk ${revealedChunks.includes(i) ? 'ruh-chunk-revealed' : ''} ${chunk.split ? 'ruh-chunk-split' : ''}`}>
            <span className="ruh-chunk-label">Chunk {i + 1}</span>
            <p className="ruh-chunk-text">{chunk.text}</p>
            {chunk.split && <div className="ruh-chunk-split-line" />}
          </div>
        ))}
        {activeTab === 'paragraph' && HANDBOOK_CHUNKS_PARAGRAPH.map((chunk, i) => (
          <div key={i} className={`ruh-chunk ${revealedChunks.includes(i) ? 'ruh-chunk-revealed' : ''} ruh-chunk-good`}>
            <span className="ruh-chunk-label">{chunk.section ? 'Header' : `Chunk ${i}`}</span>
            <p className="ruh-chunk-text">{chunk.text}</p>
          </div>
        ))}
        {activeTab === 'overlap' && HANDBOOK_CHUNKS_OVERLAP.map((chunk, i) => (
          <div key={i} className={`ruh-chunk ${revealedChunks.includes(i) ? 'ruh-chunk-revealed' : ''} ruh-chunk-good`}>
            <span className="ruh-chunk-label">Chunk {i + 1}</span>
            <p className="ruh-chunk-text">{chunk.text}</p>
            {chunk.overlap === 'start' && <div className="ruh-chunk-overlap-badge">Overlap region</div>}
          </div>
        ))}
      </div>

      <div className="ruh-chunking-result">
        {activeTab === 'fixed' && (
          <div className="ruh-result-bad">
            <CrossIcon size={16} color="#FF3B30" />
            <span>Key information split across chunks &mdash; manager approval requirement lost</span>
          </div>
        )}
        {activeTab === 'paragraph' && (
          <div className="ruh-result-good">
            <CheckIcon size={16} color="#34C759" />
            <span>Full context retrieved &mdash; complete policy in one chunk</span>
          </div>
        )}
        {activeTab === 'overlap' && (
          <div className="ruh-result-good">
            <CheckIcon size={16} color="#34C759" />
            <span>No information lost at boundaries &mdash; overlap preserves context</span>
          </div>
        )}
      </div>

      <div className="ruh-chunk-slider">
        <label className="ruh-slider-label">Chunk size: <strong>{chunkSize} tokens</strong></label>
        <input type="range" min={50} max={1000} step={50} value={chunkSize} onChange={e => setChunkSize(+e.target.value)} className="ruh-slider" />
        <div className="ruh-slider-meters">
          <div className="ruh-meter">
            <span className="ruh-meter-label">Retrieval precision</span>
            <div className="ruh-meter-bar">
              <div className="ruh-meter-fill" style={{ width: `${precisionPct}%`, background: precisionPct >= 80 ? '#34C759' : precisionPct >= 60 ? '#FF9500' : '#FF3B30' }} />
            </div>
            <span className="ruh-meter-value">{precisionPct}%</span>
          </div>
          <div className="ruh-meter">
            <span className="ruh-meter-label">Context completeness</span>
            <div className="ruh-meter-bar">
              <div className="ruh-meter-fill" style={{ width: `${completenessPct}%`, background: completenessPct >= 80 ? '#34C759' : completenessPct >= 60 ? '#FF9500' : '#FF3B30' }} />
            </div>
            <span className="ruh-meter-value">{completenessPct}%</span>
          </div>
        </div>
        {chunkSize >= 300 && chunkSize <= 500 && (
          <div className="ruh-sweet-spot">
            <CheckIcon size={14} color="#34C759" /> Sweet spot for most document types
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Stage 3: Metadata Design ─── */
function MetadataViz({ active }) {
  const [addedFields, setAddedFields] = useState([])

  function toggleField(id) {
    setAddedFields(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const qualityLevel = addedFields.length <= 3 ? 'minimal' : addedFields.length <= 6 ? 'adequate' : 'strong'
  const qualityPct = Math.min(100, Math.round((addedFields.length / 12) * 100))

  useEffect(() => {
    if (!active) setAddedFields([])
  }, [active])

  return (
    <div className="ruh-metadata-viz">
      <div className="ruh-metadata-panels">
        <div className="ruh-metadata-panel ruh-metadata-panel-bad">
          <h4 className="ruh-panel-title">Without Metadata</h4>
          <p className="ruh-query-text">Query: &ldquo;What is the current remote work policy?&rdquo;</p>
          <div className="ruh-retrieval-results">
            <div className="ruh-result-item ruh-result-item-wrong">
              <span className="ruh-result-rank">#1</span>
              <span>Remote work policy 2019 (outdated)</span>
              <span className="ruh-result-score">0.92</span>
            </div>
            <div className="ruh-result-item ruh-result-item-right">
              <span className="ruh-result-rank">#2</span>
              <span>Remote work policy 2024 (correct)</span>
              <span className="ruh-result-score">0.89</span>
            </div>
            <div className="ruh-result-item ruh-result-item-wrong">
              <span className="ruh-result-rank">#3</span>
              <span>Remote work draft March 2024 (not approved)</span>
              <span className="ruh-result-score">0.87</span>
            </div>
          </div>
          <div className="ruh-result-bad">
            <CrossIcon size={16} color="#FF3B30" />
            <span>Model used result #1 &mdash; old policy cited</span>
          </div>
        </div>

        <div className="ruh-metadata-panel ruh-metadata-panel-good">
          <h4 className="ruh-panel-title">With Metadata + Filter</h4>
          <p className="ruh-query-text">Same query + filter: effective_date &gt;= 2024-01-01 AND status = approved</p>
          <div className="ruh-retrieval-results">
            <div className="ruh-result-item ruh-result-item-right">
              <span className="ruh-result-rank">#1</span>
              <span>Remote work policy 2024 (correct, approved)</span>
              <span className="ruh-result-score">0.89</span>
            </div>
          </div>
          <div className="ruh-result-good">
            <CheckIcon size={16} color="#34C759" />
            <span>Only result returned &mdash; current policy cited correctly</span>
          </div>
        </div>
      </div>

      <div className="ruh-metadata-builder">
        <h4 className="ruh-builder-title">Add metadata fields to your chunk</h4>
        <div className="ruh-field-pills">
          {METADATA_FIELDS.map(field => (
            <button
              key={field.id}
              className={`ruh-field-pill ${addedFields.includes(field.id) ? 'ruh-field-pill-active' : ''}`}
              onClick={() => toggleField(field.id)}
            >
              <LayersIcon size={12} color={addedFields.includes(field.id) ? '#5856D6' : '#8E8E93'} />
              {field.label}
            </button>
          ))}
        </div>
        <div className="ruh-metadata-preview">
          <div className="ruh-json">
            {'{\n'}
            {'  "content": "Remote work is permitted...",\n'}
            {'  "embedding": [0.23, -0.41, 0.87, ...]'}
            {addedFields.map(id => {
              const field = METADATA_FIELDS.find(f => f.id === id)
              return `,\n  "${field.label}": "${field.example}"`
            })}
            {'\n}'}
          </div>
        </div>
        <div className="ruh-quality-meter">
          <div className="ruh-quality-bar">
            <div className={`ruh-quality-fill ruh-quality-${qualityLevel}`} style={{ width: `${qualityPct}%` }} />
          </div>
          <span className={`ruh-quality-label ruh-quality-label-${qualityLevel}`}>
            {qualityLevel === 'minimal' && 'Minimal \u2014 will fail in production'}
            {qualityLevel === 'adequate' && 'Adequate \u2014 basic filtering works'}
            {qualityLevel === 'strong' && 'Strong \u2014 production ready'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Stage 4: Embeddings Quality ─── */
function EmbeddingsViz({ active }) {
  const [modelTab, setModelTab] = useState('general')
  const [dimensions, setDimensions] = useState(1536)
  const svgW = 560
  const svgH = 360

  const wfhOffset = modelTab === 'domain' ? { x: 0, y: 0 } : { x: 145, y: 55 }

  return (
    <div className="ruh-embeddings-viz">
      <div className="ruh-tab-bar">
        <button className={`ruh-tab-btn ${modelTab === 'general' ? 'ruh-tab-btn-active' : ''}`} onClick={() => setModelTab('general')}>
          General Model
        </button>
        <button className={`ruh-tab-btn ${modelTab === 'domain' ? 'ruh-tab-btn-active' : ''}`} onClick={() => setModelTab('domain')}>
          Domain Model
        </button>
      </div>

      <div className="ruh-embedding-space">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="ruh-embedding-svg">
          {EMBEDDING_CLUSTERS.map(cluster => (
            <g key={cluster.id}>
              {cluster.dots.map((dot, i) => {
                const isWfh = dot.label === 'WFH policy v2.3'
                const cx = isWfh ? dot.x + wfhOffset.x : dot.x
                const cy = isWfh ? dot.y + wfhOffset.y : dot.y
                return (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r={6} fill={cluster.color} opacity={0.7} className="ruh-dot" />
                    <text x={cx + dot.lx} y={cy + dot.ly} className="ruh-dot-label" fill="var(--text-secondary)">{dot.label}</text>
                  </g>
                )
              })}
            </g>
          ))}
          {/* Query dot */}
          <circle cx={100} cy={165} r={8} fill="#FF3B30" opacity={0.9} className="ruh-query-dot" />
          <text x={116} y={169} className="ruh-dot-label ruh-query-label" fill="#FF3B30">Query: &ldquo;remote work policy&rdquo;</text>
          {/* Similarity radius */}
          <circle cx={100} cy={165} r={80} fill="none" stroke="#FF3B30" strokeWidth={1} strokeDasharray="4 4" opacity={0.3} />
        </svg>
      </div>

      <div className="ruh-embedding-result">
        {modelTab === 'general' ? (
          <div className="ruh-result-warn">
            <WarningIcon size={16} color="#FF9500" />
            <span>Some relevant chunks missed &mdash; &ldquo;WFH&rdquo; abbreviation not well understood</span>
          </div>
        ) : (
          <div className="ruh-result-good">
            <CheckIcon size={16} color="#34C759" />
            <span>All relevant chunks retrieved &mdash; domain terms correctly clustered</span>
          </div>
        )}
      </div>

      <div className="ruh-dimension-slider">
        <label className="ruh-slider-label">Embedding dimensions: <strong>{dimensions}</strong></label>
        <input type="range" min={128} max={3072} step={128} value={dimensions} onChange={e => setDimensions(+e.target.value)} className="ruh-slider" />
        <div className="ruh-slider-meters">
          <div className="ruh-meter">
            <span className="ruh-meter-label">Precision</span>
            <div className="ruh-meter-bar">
              <div className="ruh-meter-fill" style={{ width: `${Math.min(100, 40 + dimensions / 50)}%`, background: '#5856D6' }} />
            </div>
          </div>
          <div className="ruh-meter">
            <span className="ruh-meter-label">Cost per query</span>
            <div className="ruh-meter-bar">
              <div className="ruh-meter-fill" style={{ width: `${Math.min(100, 10 + dimensions / 40)}%`, background: '#FF9500' }} />
            </div>
          </div>
        </div>
        {dimensions >= 1024 && dimensions <= 2048 && (
          <div className="ruh-sweet-spot">
            <CheckIcon size={14} color="#34C759" /> 1536 dims &mdash; good balance for most use cases
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Stage 5: Retrieval Quality ─── */
function RetrievalViz({ active }) {
  const [activeTab, setActiveTab] = useState('semantic')
  const [reranking, setReranking] = useState(false)
  const timersRef = useRef([])

  const semanticResults = [
    { text: 'Remote work permitted for approved roles', score: 0.91, relevant: true },
    { text: 'Working from home guidelines', score: 0.87, relevant: true },
    { text: 'Flexible working arrangements', score: 0.81, relevant: true },
    { text: 'Office attendance requirements', score: 0.74, relevant: false },
    { text: 'WFH policy v2.3 \u2014 see flex doc', score: 0.71, relevant: true },
  ]
  const keywordResults = [
    { text: 'WFH policy v2.3', score: 12.4, relevant: true },
    { text: 'Remote work permitted for approved roles', score: 9.8, relevant: true },
    { text: 'Remote access security requirements', score: 7.2, relevant: false },
    { text: 'Remote desktop configuration guide', score: 6.1, relevant: false },
    { text: 'Remote team management tips', score: 5.3, relevant: false },
  ]
  const hybridResults = [
    { text: 'Remote work permitted for approved roles', score: 0.97, relevant: true },
    { text: 'WFH policy v2.3', score: 0.94, relevant: true },
    { text: 'Working from home guidelines', score: 0.89, relevant: true },
  ]

  useEffect(() => {
    if (activeTab === 'hybrid') {
      setReranking(true)
      timersRef.current.forEach(clearTimeout)
      timersRef.current = [setTimeout(() => setReranking(false), 1200)]
    } else {
      setReranking(false)
    }
    return () => timersRef.current.forEach(clearTimeout)
  }, [activeTab])

  const results = activeTab === 'semantic' ? semanticResults : activeTab === 'keyword' ? keywordResults : hybridResults

  return (
    <div className="ruh-retrieval-viz">
      <div className="ruh-tab-bar">
        {[
          { id: 'semantic', label: 'Semantic Only' },
          { id: 'keyword', label: 'Keyword Only' },
          { id: 'hybrid', label: 'Hybrid + Rerank' },
        ].map(tab => (
          <button key={tab.id} className={`ruh-tab-btn ${activeTab === tab.id ? 'ruh-tab-btn-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`ruh-retrieval-results-list ${reranking ? 'ruh-reranking' : ''}`}>
        {results.map((result, i) => (
          <div key={i} className={`ruh-retrieval-item ${result.relevant ? 'ruh-retrieval-item-relevant' : 'ruh-retrieval-item-noise'}`}>
            <span className="ruh-retrieval-rank">#{i + 1}</span>
            <span className="ruh-retrieval-text">{result.text}</span>
            <span className="ruh-retrieval-score">{result.score.toFixed(2)}</span>
            {result.relevant
              ? <CheckIcon size={14} color="#34C759" />
              : <CrossIcon size={14} color="#FF3B30" />
            }
          </div>
        ))}
      </div>

      <div className="ruh-retrieval-summary">
        {activeTab === 'semantic' && (
          <div className="ruh-result-warn">
            <WarningIcon size={16} color="#FF9500" />
            <span>Good results but misses versioned WFH policy (ranked 5th due to abbreviation)</span>
          </div>
        )}
        {activeTab === 'keyword' && (
          <div className="ruh-result-warn">
            <WarningIcon size={16} color="#FF9500" />
            <span>Finds exact WFH match but retrieves noisy results (3 of 5 irrelevant)</span>
          </div>
        )}
        {activeTab === 'hybrid' && (
          <div className="ruh-result-good">
            <CheckIcon size={16} color="#34C759" />
            <span>Complete and accurate retrieval &mdash; all 3 results relevant, no noise</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Stage 6: Metadata Filtering ─── */
function FilteringViz({ active }) {
  const [filters, setFilters] = useState({ department: false, status: false, date: false })
  const activeFilters = Object.values(filters).filter(Boolean).length

  useEffect(() => {
    if (!active) setFilters({ department: false, status: false, date: false })
  }, [active])

  function isVisible(doc) {
    if (filters.department && doc.dept !== 'HR') return false
    if (filters.status && !doc.approved) return false
    if (filters.date && !doc.current) return false
    return true
  }

  const visibleCount = FILTER_DOCS.filter(isVisible).length
  const relevantCount = FILTER_DOCS.filter(d => isVisible(d) && d.dept === 'HR' && d.approved && d.current).length

  return (
    <div className="ruh-filtering-viz">
      <div className="ruh-filter-query">
        <SearchIcon size={16} color="#5856D6" />
        <span className="ruh-query-text">&ldquo;What is the remote work policy?&rdquo;</span>
      </div>

      <div className="ruh-filter-layout">
        <div className="ruh-filter-docs-grid">
          {FILTER_DOCS.map(doc => (
            <div
              key={doc.id}
              className={`ruh-filter-doc ${isVisible(doc) ? '' : 'ruh-filter-doc-dimmed'}`}
              style={{ '--doc-color': doc.color }}
            >
              <div className="ruh-filter-doc-dot" />
            </div>
          ))}
        </div>

        <div className="ruh-filter-controls">
          <h4 className="ruh-filter-title">Apply filters</h4>
          <label className="ruh-filter-toggle">
            <input type="checkbox" checked={filters.department} onChange={() => setFilters(prev => ({ ...prev, department: !prev.department }))} />
            <span>department = HR</span>
          </label>
          <label className="ruh-filter-toggle">
            <input type="checkbox" checked={filters.status} onChange={() => setFilters(prev => ({ ...prev, status: !prev.status }))} />
            <span>status = approved</span>
          </label>
          <label className="ruh-filter-toggle">
            <input type="checkbox" checked={filters.date} onChange={() => setFilters(prev => ({ ...prev, date: !prev.date }))} />
            <span>effective_date &gt;= 2024-01-01</span>
          </label>
        </div>
      </div>

      <div className="ruh-filter-stats">
        <div className="ruh-filter-stat">
          <span className="ruh-stat-label">Search space</span>
          <span className="ruh-stat-value">{visibleCount} documents</span>
        </div>
        <div className="ruh-filter-stat">
          <span className="ruh-stat-label">Relevant results</span>
          <span className="ruh-stat-value">{activeFilters === 0 ? '2 of 5 retrieved' : `${relevantCount} of ${Math.min(visibleCount, 3)} retrieved`}</span>
        </div>
      </div>

      <div className="ruh-filter-result">
        {activeFilters === 0 ? (
          <div className="ruh-result-bad">
            <CrossIcon size={16} color="#FF3B30" />
            <span>{FILTER_DOCS.length} results: mix of relevant and noise</span>
          </div>
        ) : activeFilters < 3 ? (
          <div className="ruh-result-warn">
            <WarningIcon size={16} color="#FF9500" />
            <span>{visibleCount} results: improving but still some noise</span>
          </div>
        ) : (
          <div className="ruh-result-good">
            <CheckIcon size={16} color="#34C759" />
            <span>{visibleCount} results: all relevant, zero noise</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Stage 7: Production Checklist ─── */
function ChecklistViz({ active }) {
  const [checked, setChecked] = useState(new Set())
  const [showAfter, setShowAfter] = useState(false)
  const [flipStep, setFlipStep] = useState(0)
  const timersRef = useRef([])

  const totalItems = CHECKLIST_SECTIONS.reduce((sum, s) => sum + s.items.length, 0)
  const checkedPct = Math.round((checked.size / totalItems) * 100)

  function toggleItem(key) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function playCompare() {
    setShowAfter(true)
    setFlipStep(0)
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    for (let i = 0; i < 5; i++) {
      timersRef.current.push(setTimeout(() => setFlipStep(i + 1), 300 * (i + 1)))
    }
  }

  useEffect(() => {
    if (!active) {
      setChecked(new Set())
      setShowAfter(false)
      setFlipStep(0)
    }
    return () => timersRef.current.forEach(clearTimeout)
  }, [active])

  return (
    <div className="ruh-checklist-viz">
      <div className="ruh-comparison">
        <div className="ruh-comparison-panel ruh-comparison-before">
          <h4 className="ruh-comparison-title">
            <CrossIcon size={16} color="#FF3B30" /> Before (Demo RAG)
          </h4>
          <div className="ruh-comparison-pipeline">
            {['Fixed chunks', 'No metadata', 'General embeddings', 'Semantic only', 'No filtering'].map((label, i) => (
              <span key={label} className={`ruh-comparison-stage ${showAfter && flipStep > i ? 'ruh-comparison-stage-flipping' : ''}`}>
                {showAfter && flipStep > i
                  ? ['Paragraph + overlap', 'Rich metadata', 'Domain embeddings', 'Hybrid + rerank', 'Pre-filtered'][i]
                  : label}
              </span>
            ))}
          </div>
          <div className={`ruh-comparison-answer ${showAfter ? 'ruh-comparison-answer-hidden' : ''}`}>
            <CrossIcon size={14} color="#FF3B30" />
            <span>2019 policy. Incomplete. No source.</span>
          </div>
        </div>

        {showAfter && (
          <div className="ruh-comparison-panel ruh-comparison-after">
            <h4 className="ruh-comparison-title">
              <CheckIcon size={16} color="#34C759" /> After (Production RAG)
            </h4>
            <div className="ruh-comparison-pipeline">
              {['Paragraph + overlap', 'Rich metadata', 'Domain embeddings', 'Hybrid + rerank', 'Pre-filtered'].map(label => (
                <span key={label} className="ruh-comparison-stage ruh-comparison-stage-good">{label}</span>
              ))}
            </div>
            <div className="ruh-comparison-answer ruh-comparison-answer-good">
              <CheckIcon size={14} color="#34C759" />
              <span>v3.2 (Jan 2024). Complete. Source: Handbook Section 4.2</span>
            </div>
          </div>
        )}

        {!showAfter && (
          <button className="ruh-compare-btn" onClick={playCompare}>
            Compare &rarr;
          </button>
        )}
      </div>

      <div className="ruh-checklist-sections">
        <h4 className="ruh-checklist-title">Production RAG Checklist</h4>
        {CHECKLIST_SECTIONS.map((section, si) => (
          <div key={section.title} className="ruh-checklist-section">
            <h5 className="ruh-checklist-section-title">{section.title}</h5>
            {section.items.map((item, ii) => {
              const key = `${si}-${ii}`
              return (
                <label key={key} className="ruh-checklist-item">
                  <input type="checkbox" checked={checked.has(key)} onChange={() => toggleItem(key)} />
                  <span>{item}</span>
                </label>
              )
            })}
          </div>
        ))}
        <div className="ruh-checklist-progress">
          <div className="ruh-checklist-bar">
            <div className="ruh-checklist-fill" style={{ width: `${checkedPct}%` }} />
          </div>
          <span className="ruh-checklist-pct">{checked.size}/{totalItems} complete</span>
        </div>
        {checked.size === totalItems && (
          <div className="ruh-checklist-complete">
            <CheckIcon size={20} color="#34C759" />
            <strong>Production RAG checklist complete. Your pipeline is ready.</strong>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Stage content data ─── */
const STAGE_CONTENT = [
  {
    title: 'Stage 1: The Gap Between Demo and Production',
    content: (
      <>
        <p>You build a RAG system. You test it. It works beautifully. You ask it questions about your documents. It gets them right.</p>
        <p>You ship it. Users start asking real questions. And slowly, quietly, it starts failing.</p>
        <p>Not dramatically. Subtly. Wrong answers stated confidently. Right documents not retrieved. Outdated information served as current. The same question getting different answers depending on how it is phrased.</p>
        <p>This is production RAG reality.</p>
        <p>The demo worked because you asked perfect questions about perfectly formatted documents. Production fails because users ask messy questions about imperfect documents and expect consistent, correct answers.</p>
        <h4 className="ruh-section-heading">The Five Layers Where RAG Breaks</h4>
        <div className="ruh-layers-list">
          <div className="ruh-layer-item">
            <strong>Layer 1 &mdash; Chunking:</strong> Documents split wrong. Context lost at boundaries. Answer is split across two chunks. Neither chunk retrieved contains the full answer.
          </div>
          <div className="ruh-layer-item">
            <strong>Layer 2 &mdash; Metadata:</strong> No tags on chunks. Cannot filter by date or source. Outdated policy retrieved alongside current one.
          </div>
          <div className="ruh-layer-item">
            <strong>Layer 3 &mdash; Embeddings:</strong> Wrong embedding model for your domain. Technical terms not understood semantically.
          </div>
          <div className="ruh-layer-item">
            <strong>Layer 4 &mdash; Retrieval:</strong> Semantic search alone misses exact terms. Query phrased differently from document language.
          </div>
          <div className="ruh-layer-item">
            <strong>Layer 5 &mdash; Filtering:</strong> No pre-filtering. Retrieving across 100,000 chunks when you only need 200 from one department. Noise overwhelms signal.
          </div>
        </div>
        <p>Each stage of this tutorial fixes one layer. By Stage 7 you have a production-ready pipeline.</p>
      </>
    ),
    tip: 'Most RAG tutorials show you how to build the happy path. This tutorial shows you how to debug the unhappy path \u2014 which is where you will spend 80% of your actual RAG engineering time.',
    stat: 'Real-world finding: most RAG failures are not model failures. They are pipeline failures in chunking and metadata \u2014 the two layers before the LLM ever sees the content.',
  },
  {
    title: 'Stage 2: How You Split Changes Everything',
    content: (
      <>
        <p>Before any document can be retrieved, it must be split into chunks. A chunk is the unit of text that gets embedded, stored, and retrieved.</p>
        <p>The size and strategy of the split determines what can ever be found. If the answer to a question spans two chunks and only one is retrieved, the answer will always be incomplete.</p>
        <h4 className="ruh-section-heading">Chunking Strategies</h4>
        <div className="ruh-strategy-card ruh-strategy-bad">
          <strong>Fixed Size (the bad default)</strong>
          <p>Split every N characters regardless of content. Fast. Simple. Usually wrong. Splits mid-sentence, mid-paragraph, mid-table. Context destroyed at every boundary.</p>
        </div>
        <div className="ruh-strategy-card ruh-strategy-better">
          <strong>Paragraph / Section Chunking (better)</strong>
          <p>Split at natural content boundaries. Paragraphs. Section headings. List items. Each chunk can answer a question on its own. Context is preserved within each unit.</p>
        </div>
        <div className="ruh-strategy-card ruh-strategy-best">
          <strong>Sliding Window with Overlap (best practice)</strong>
          <p>Chunks overlap by 10&ndash;20% with their neighbors. Content at boundaries appears in both chunks. No information is ever lost at a split point.</p>
        </div>
        <h4 className="ruh-section-heading">Chunk Size Trade-offs</h4>
        <p><strong>Too small (50 tokens):</strong> More precise retrieval target. But loses surrounding context. Single sentences retrieved. Answer incomplete.</p>
        <p><strong>Too large (2000 tokens):</strong> Full context preserved. But retrieval is imprecise &mdash; irrelevant content fills the context window. LLM confused by noise.</p>
        <p><strong>Sweet spot: 300&ndash;500 tokens</strong> with 10% overlap for most document types.</p>
      </>
    ),
    tip: 'The right chunk size depends on your document type. Dense technical documentation: 200\u2013300 tokens. Narrative content: 400\u2013600 tokens. Always measure retrieval quality at multiple sizes before committing to a strategy.',
  },
  {
    title: 'Stage 3: The Secret Ingredient Most Teams Skip',
    content: (
      <>
        <p>Here is what most RAG tutorials produce:</p>
        <div className="ruh-json ruh-json-minimal">
          {'{\n  "content": "Remote work is permitted...",\n  "embedding": [0.23, -0.41, 0.87, ...]\n}'}
        </div>
        <p>Content and embedding. Nothing else. Fine for demos. Breaks in production.</p>
        <p>Why? Because in production you need to answer: &ldquo;What is the <em>current</em> remote work policy?&rdquo; Not the 2019 version. Not the March draft. The approved, current one.</p>
        <p>Without metadata you cannot distinguish them. All versions look identical to vector search. The model retrieves whichever is most semantically similar &mdash; which might be the outdated version.</p>
        <h4 className="ruh-section-heading">Metadata Is the Solution</h4>
        <div className="ruh-json ruh-json-rich">
          {'{\n  "content": "Remote work is permitted...",\n  "embedding": [0.23, -0.41, 0.87, ...],\n  "source": "employee-handbook-2024.pdf",\n  "section": "Remote Work Policy",\n  "page": 14,\n  "department": "HR",\n  "effective_date": "2024-01-01",\n  "version": "3.2",\n  "status": "approved"\n}'}
        </div>
        <p>Now you can filter by date. Restrict by department. Cite sources precisely. Serve only approved documents.</p>
        <h4 className="ruh-section-heading">What Metadata Enables</h4>
        <p><strong>Filtering:</strong> only search approved policy docs, not meeting notes, drafts, or old versions.</p>
        <p><strong>Recency:</strong> always retrieve the latest version.</p>
        <p><strong>Source citation:</strong> &ldquo;Per Section 4.2 of the Employee Handbook (v3.2, effective Jan 2024)&rdquo;</p>
        <p><strong>Access control:</strong> only retrieve docs the user is authorised to see.</p>
        <p><strong>Debugging:</strong> trace exactly which chunk produced which answer and why.</p>
        <p>Most metadata already exists in your documents. File names. Folder structure. Creation dates. Headers and section titles. You just need to extract and preserve it during ingestion &mdash; not create it from scratch.</p>
      </>
    ),
    tip: 'Think of metadata as the card catalog of a library. The content is the books. Metadata tells you which shelf, which author, which year, which subject. Without it you search every book every time. With it you go straight to the right section.',
  },
  {
    title: 'Stage 4: What Gets Stored and Searched',
    content: (
      <>
        <p>When a chunk is stored in a vector database it is not stored as text. It is stored as a vector &mdash; hundreds of numbers representing its meaning in high-dimensional space.</p>
        <p>When you search, your query is also converted to a vector. The database finds chunks whose vectors are closest to the query vector.</p>
        <p>This is why RAG finds relevant content even when exact words differ. &ldquo;Remote work&rdquo; and &ldquo;working from home&rdquo; have similar vectors because they have similar meaning.</p>
        <p>But quality depends entirely on your embedding model.</p>
        <h4 className="ruh-section-heading">General vs Domain Models</h4>
        <p><strong>General models</strong> (e.g. text-embedding-ada-002): Trained on broad internet text. Good for general knowledge queries. Struggles with domain-specific terminology.</p>
        <p><strong>Domain-specific models:</strong> Fine-tuned on legal, medical, or code text. Understands technical jargon correctly. &ldquo;P1 incident&rdquo; correctly near &ldquo;critical outage&rdquo;. &ldquo;SLA&rdquo; correctly near &ldquo;service level agreement&rdquo;.</p>
        <h4 className="ruh-section-heading">The Dimension Question</h4>
        <p>Larger dimensions = more nuanced meaning. text-embedding-3-large: 3072 dimensions. text-embedding-3-small: 1536 dimensions. Larger: better quality, higher cost, slower search.</p>
        <h4 className="ruh-section-heading">What Breaks with the Wrong Model</h4>
        <p>Query: &ldquo;What is our SLA for P1 incidents?&rdquo; A general model may not understand that &ldquo;SLA&rdquo; and &ldquo;P1&rdquo; are technical terms with specific meanings in your domain. Correct chunks ranked low. Wrong chunks ranked high. Answer fails.</p>
      </>
    ),
    tip: 'Always evaluate embedding quality on your actual domain before committing. Create 20 test queries with known correct chunk answers. If fewer than 15 of 20 return the right chunk as the top result, your embedding model is wrong for your domain.',
  },
  {
    title: 'Stage 5: Why Semantic Search Misses Things',
    content: (
      <>
        <p>Vector similarity search is powerful. It is not sufficient on its own.</p>
        <h4 className="ruh-section-heading">The Vocabulary Mismatch Problem</h4>
        <p>Your document says: &ldquo;Associates may engage in remote arrangements&rdquo;</p>
        <p>Your query asks: &ldquo;Can employees work from home?&rdquo;</p>
        <p>Good embedding model: handles this fine. &ldquo;Associates&rdquo; and &ldquo;employees&rdquo; are similar. But what about: &ldquo;WFH permitted per flex policy v2.3&rdquo;?</p>
        <p>&ldquo;WFH&rdquo; is an abbreviation. Even strong embedding models may not connect it reliably to &ldquo;remote work&rdquo;. &ldquo;v2.3&rdquo; is a version reference. Semantic search has no concept of version numbers.</p>
        <h4 className="ruh-section-heading">Hybrid Search Fixes This</h4>
        <p>Combine semantic (vector) with keyword (BM25). Semantic search finds meaning and synonyms. Keyword search finds exact terms, abbreviations, product names, version numbers, codes, IDs. Run both. Merge results. Re-rank. Best of both worlds.</p>
        <h4 className="ruh-section-heading">Reranking</h4>
        <p>Initial retrieval is fast but approximate. Top 20 candidates retrieved quickly. A reranker then scores each candidate more carefully against the query. Slower but much more precise. Final top 3&ndash;5 results are highly relevant.</p>
        <p>Adding a reranker alone improves answer quality by 20&ndash;30% on real-world queries. Highest ROI single improvement in most production RAG systems.</p>
        <h4 className="ruh-section-heading">The Full Retrieval Pipeline</h4>
        <p>Query &rarr; Semantic search top 20 + Keyword search top 20 &rarr; Merge and deduplicate &rarr; Reranker scores all candidates &rarr; Top 5 sent to LLM &rarr; Accurate answer</p>
      </>
    ),
    tip: 'Start with semantic-only retrieval to establish a baseline. Add keyword search when you notice exact terms and abbreviations being missed. Add a reranker when you want to push quality further. Each addition has diminishing returns so measure impact before adding complexity.',
  },
  {
    title: 'Stage 6: Narrow Before You Search',
    content: (
      <>
        <p>Vector search across thousands of chunks is fast. Across millions it is slow and noisy.</p>
        <p>As your knowledge base grows, semantic search compares your query against every single chunk. More chunks = more noise = worse results.</p>
        <h4 className="ruh-section-heading">Filter First. Search Second.</h4>
        <p><strong>Without filtering:</strong> Query: &ldquo;What is the remote work policy?&rdquo; Searches all 500,000 chunks in database. Returns HR policy + IT security guide + old 2019 policy + unapproved March draft + Slack message about working from home. Noise overwhelms signal.</p>
        <p><strong>With filtering:</strong> Filter applied first: department = HR, content_type = policy, status = approved, effective_date &gt;= 2024-01-01. Remaining search space: 847 chunks. Semantic search across only those 847. Returns exactly the right policy. Signal is clear.</p>
        <h4 className="ruh-section-heading">Dynamic Filtering</h4>
        <p>Advanced systems extract filter parameters automatically from natural language. User asks: &ldquo;What was the remote work policy in 2022?&rdquo; System extracts: topic: remote work, time_period: 2022, content_type: policy. Applies filters automatically. User never specifies metadata manually.</p>
        <h4 className="ruh-section-heading">Access Control as Filtering</h4>
        <p>Metadata filtering also enforces security. Finance user query: filter audience IN (finance, all-employees). Engineering user query: filter audience IN (engineering, all-employees). Same RAG system. Different users. Correct documents served to each. Confidential docs never cross department lines.</p>
      </>
    ),
    warning: 'Filtering only works if metadata is correct and consistent. A policy tagged with the wrong department or an incorrect effective date will be filtered out (missing answer) or incorrectly included (wrong answer). Metadata quality is as important as document content quality.',
  },
  {
    title: 'Stage 7: Your Production-Ready RAG Stack',
    content: (
      <>
        <p>Every layer is fixed. Let us run the full pipeline one more time and see the difference.</p>
        <h4 className="ruh-section-heading">The Before (Demo RAG)</h4>
        <p>Fixed-size chunking, no metadata, general embeddings, semantic-only retrieval, no filtering.</p>
        <p>Query: &ldquo;What is the remote work policy?&rdquo; Result: 2019 policy returned confidently. Manager approval requirement missing. Wrong version. No source citation possible.</p>
        <h4 className="ruh-section-heading">The After (Production RAG)</h4>
        <p>Paragraph chunking with overlap, rich metadata, domain-tuned embeddings, hybrid retrieval with reranker, metadata pre-filtering.</p>
        <p>Query: &ldquo;What is the remote work policy?&rdquo; Result: Section 4.2 of Employee Handbook v3.2 (effective January 2024, HR department, approved). Complete policy. Manager approval included. Source cited precisely. Correct version.</p>
        <h4 className="ruh-section-heading">The Five Decisions</h4>
        <div className="ruh-decisions-list">
          <div className="ruh-decision-item">
            <strong>Decision 1 &mdash; Chunking:</strong> Use paragraph or semantic chunking. Add 10&ndash;15% overlap between chunks. Target 300&ndash;500 tokens per chunk. Test retrieval quality at your chosen size.
          </div>
          <div className="ruh-decision-item">
            <strong>Decision 2 &mdash; Metadata:</strong> Extract all available metadata at ingestion. Minimum: source, date, section, department, status. Treat metadata quality as seriously as content. Version all documents. Track effective dates.
          </div>
          <div className="ruh-decision-item">
            <strong>Decision 3 &mdash; Embeddings:</strong> Evaluate domain-specific models first. Test with 20 real queries before committing. Match dimension size to scale and budget. Re-embed if model improves significantly.
          </div>
          <div className="ruh-decision-item">
            <strong>Decision 4 &mdash; Retrieval:</strong> Start with semantic only and measure baseline. Add keyword (BM25) when exact terms are missed. Add reranker when you need higher precision. Measure improvement at each step.
          </div>
          <div className="ruh-decision-item">
            <strong>Decision 5 &mdash; Filtering:</strong> Design metadata schema with filtering in mind. Apply filters before semantic search always. Consider access control requirements early. Implement dynamic filter extraction for UX.
          </div>
        </div>
      </>
    ),
    tip: 'Fix layers in order: chunking first, then metadata, then retrieval, then filtering. Chunking and metadata give the biggest gains for least effort. Retrieval improvements matter more at scale. Filter optimisation is the last mile for production hardening.',
  },
]

const VISUALIZATIONS = [WhyRAGFailsViz, ChunkingViz, MetadataViz, EmbeddingsViz, RetrievalViz, FilteringViz, ChecklistViz]

/* ─── Main Component ─── */
export default function RAGUnderTheHood({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('rag-under-the-hood', -1)
  const [maxStageReached, setMaxStageReached] = useState(() => Math.max(-1, stage))
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)

  /* learn tips */
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)

  const activeStepRef = useRef(null)

  function dismissLearnTip() {
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 300)
  }

  /* track max stage */
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  /* scroll on stage change */
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  /* milestone-based learn tips */
  useEffect(() => {
    if (stage === 1 && !dismissedTips.has('stage1')) {
      setLearnTip({ key: 'stage1', text: 'Try the fixed-size tab first \u2014 then switch to paragraph to see the difference immediately.' })
    } else if (stage === 3 && !dismissedTips.has('stage3')) {
      setLearnTip({ key: 'stage3', text: 'Click between General Model and Domain Model tabs to see exactly which chunks move clusters.' })
    } else if (stage === 5 && !dismissedTips.has('stage5')) {
      setLearnTip({ key: 'stage5', text: 'Toggle the filters one at a time to watch the search space shrink with each addition.' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  /* cleanup */
  useEffect(() => {
    return () => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current) }
  }, [])

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setFading(true)
      setLearnTip(null)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('rag-under-the-hood')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.ruh-root')
          while (el) {
            if (el.scrollTop > 0) el.scrollTop = 0
            el = el.parentElement
          }
          window.scrollTo(0, 0)
        })
      }, 250)
    }
  }

  function prevStage() {
    if (stage > 0) setStage(stage - 1)
  }

  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setFading(false)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
  }

  /* ─── Quiz Screen ─── */
  if (showQuiz) {
    return (
      <div className="how-llms ruh-root quiz-fade-in">
        <Quiz
          questions={ragUnderTheHoodQuiz}
          tabName="Why RAG Fails"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => reset()}
          onSwitchTab={onSwitchTab}
          currentModuleId="rag-under-the-hood"
        />
      </div>
    )
  }

  /* ─── Entry Screen ─── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="rag-under-the-hood" size={48} style={{ color: '#5856D6' }} />}
        title="Why RAG Fails"
        subtitle="(and How to Fix It)"
        description="The basic RAG tutorial shows you the happy path. This one shows you everything that breaks it &mdash; and exactly how to fix each layer. Chunking. Metadata. Retrieval quality. Filtering. The full picture."
        buttonText="Go Deeper"
        onStart={() => { setStage(0); markModuleStarted('rag-under-the-hood') }}
      />
    )
  }

  const StageViz = VISUALIZATIONS[stage] || VISUALIZATIONS[0]
  const content = STAGE_CONTENT[stage] || STAGE_CONTENT[0]
  const tools = RUH_TOOLS[stage] || []

  return (
    <div className={`how-llms ruh-root ${fading ? 'how-fading' : ''}`}>

      {/* Welcome banner */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Why RAG Fails</strong> &mdash; You already know what RAG is. This module teaches why most RAG implementations fail quietly in production &mdash; and the specific techniques that separate demo-quality from production-quality retrieval. Each stage fixes one broken layer.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>7 stages</strong> &mdash; each one fixes a different layer of the RAG pipeline</li>
              <li>Use the <strong>interactive visualisations</strong> &mdash; toggle tabs, drag fields, flip filters</li>
              <li>At the end, complete the <strong>production checklist</strong> to verify your pipeline is ready</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Learn tip */}
      {learnTip && !showFinal && (
        <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
          <TipIcon size={16} color="#eab308" />
          <span className="learn-tip-text">{learnTip.text}</span>
          <button className="learn-tip-dismiss" onClick={() => { setDismissedTips(prev => new Set(prev).add(learnTip.key)); dismissLearnTip() }} aria-label="Dismiss tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Stepper + stages */}
      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper ruh-stepper">
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
                          <Tooltip text={s.tooltip} />
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
              <div className={`how-stage how-fade-in ${fading ? 'how-fading' : ''}`} key={stage}>
                {/* Pipeline progress */}
                <PipelineProgress stage={stage} />

                {/* Info card */}
                <div className="how-info-card how-info-card-edu ruh-info-card">
                  <div className="how-info-card-header">
                    <strong>{content.title}</strong>
                  </div>
                  <div className="ruh-info-content">{content.content}</div>

                  {content.tip && (
                    <div className="how-info-tip">
                      <TipIcon size={16} color="#eab308" />
                      {content.tip}
                    </div>
                  )}

                  {content.warning && (
                    <div className="ruh-warning">
                      <WarningIcon size={16} color="#FF9500" />
                      {content.warning}
                    </div>
                  )}

                  {content.stat && (
                    <div className="ruh-stat-card">
                      {content.stat}
                    </div>
                  )}

                  {tools.length > 0 && (
                    <ToolChips tools={tools} />
                  )}
                </div>

                {/* Visualization */}
                <StageViz active={true} />

                {/* Navigation */}
                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>
                        &larr; Back
                      </button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage} style={{ background: '#5856D6' }}>
                      {stage < STAGES.length - 1
                        ? (stage === 0 ? 'Chunking strategy \u2192' : stage === 1 ? 'Metadata design \u2192' : stage === 2 ? 'Embeddings quality \u2192' : stage === 3 ? 'Retrieval quality \u2192' : stage === 4 ? 'Metadata filtering \u2192' : 'The complete checklist \u2192')
                        : 'Test my knowledge \u2192'
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Final screen */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now understand why RAG fails &mdash; and how to fix it!</div>

          <div className="ruh-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.layer} className="ruh-final-card">
                <div className="ruh-final-card-layer">{item.layer}</div>
                <div className="ruh-final-card-fix">{item.fix}</div>
              </div>
            ))}
          </div>

          <div className="ruh-reference-wrapper">
            <div className="ruh-reference-title">Your RAG Pipeline Toolkit</div>
            <table className="ruh-reference">
              <thead>
                <tr>
                  <th scope="col">Layer</th>
                  <th scope="col">Fix</th>
                  <th scope="col">Why it matters</th>
                </tr>
              </thead>
              <tbody>
                {TOOLKIT.map((item) => (
                  <tr key={item.layer}>
                    <td className="ruh-ref-layer">{item.layer}</td>
                    <td>{item.fix}</td>
                    <td>{item.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="rag-under-the-hood" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
