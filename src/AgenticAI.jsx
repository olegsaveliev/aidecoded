import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { TipIcon, SearchIcon, CodeIcon, MailIcon, FileIcon, GlobeIcon, EyeIcon, ZapIcon, RobotIcon, WrenchIcon, CpuIcon, LinkIcon, LayersIcon, RepeatIcon, ShieldIcon, PlayIcon, BookIcon, BarChartIcon, LaptopIcon, RocketIcon, CheckIcon, HospitalIcon, BriefcaseIcon, RefreshIcon, UserIcon, ConstructionIcon, CompassIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { agenticAIQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './AgenticAI.css'

/* ── Stages ── */

const STAGES = [
  { key: 'what-are-agents', label: 'What Are Agents?' },
  { key: 'agent-loop', label: 'Agent Loop' },
  { key: 'tools', label: 'Tools' },
  { key: 'memory', label: 'Memory' },
  { key: 'multi-agent', label: 'Multi-Agent' },
  { key: 'build-agent', label: 'Build an Agent' },
  { key: 'real-agents', label: 'Real Agents' },
  { key: 'frontier', label: 'The Frontier' },
]

const STAGE_TOOLTIPS = {
  'what-are-agents': 'What agents are and how they differ from chatbots',
  'agent-loop': 'The core agent loop — plan, act, observe, repeat',
  'tools': 'Tools — how agents interact with the world',
  'memory': 'Memory — how agents remember across tasks',
  'multi-agent': 'Multi-agent systems — agents working together',
  'build-agent': 'Build your first agent step by step',
  'real-agents': 'Real agents in production today',
  'frontier': 'The frontier — what comes next',
}

const NEXT_LABELS = [
  'Next: The Agent Loop \u2192',
  'Next: Tools \u2192',
  'Next: Memory \u2192',
  'Next: Multi-Agent \u2192',
  'Next: Build an Agent \u2192',
  'Next: Real Agents \u2192',
  'Next: The Frontier \u2192',
  'See Your Toolkit \u2192',
]

const EXPLANATIONS = [
  {
    title: 'Stage 1: From Answering to Acting',
    content: "You ask ChatGPT to book a flight. It tells you how to book a flight.\n\nYou ask an AI agent to book a flight. It books the flight.\n\nThat is the difference. A chatbot receives a message, generates a reply, and is done. One action. One response. No memory of last time.\n\nAn agent receives a goal, plans steps, takes action, observes the result, adjusts the plan, takes the next action, and repeats until the goal is achieved.\n\nWhat makes something an agent: it is goal-directed (working toward an objective), uses tools (can interact with external systems), is multi-step (takes many actions in sequence), is adaptive (adjusts based on what happens), and is autonomous (operates with minimal human input).\n\nThe spectrum of autonomy ranges from chatbots at 0% (human drives everything), to copilots at 20% (AI suggests, human decides), to semi-autonomous at 60% (AI acts, human approves), to autonomous agents at 90% (AI acts, human monitors), to full autonomy at 100% (theoretical, not yet safe).",
  },
  {
    title: 'Stage 2: Think. Act. Observe. Repeat.',
    content: "Every agent \u2014 no matter how complex \u2014 runs the same fundamental loop.\n\nStep 1: PERCEIVE. Receive the goal and current state. What has happened so far? What tools are available? What is the current context?\n\nStep 2: THINK (Reason). The LLM is the brain. It reads the situation and decides: What is the next best action? Which tool should I use? What information do I need?\n\nStep 3: ACT. Execute the chosen action. Call an API. Search the web. Write a file. Send an email. Run code. Click a button.\n\nStep 4: OBSERVE. Receive the result of the action. Did it work? What happened? What new information do I now have?\n\nStep 5: REPEAT. Go back to step 1 with updated context. Keep looping until the goal is achieved or the agent decides it cannot proceed.\n\nThe ReAct framework is the most popular approach: Reason, Act, Observe, Reason, Act... Each thought visible, each action traceable.",
  },
  {
    title: 'Stage 3: How Agents Touch the World',
    content: "An LLM alone is trapped in a box. It cannot browse the web. Cannot send emails. Cannot run code. Cannot remember yesterday. Tools break the box open.\n\nA tool is a function the agent can call. The LLM decides WHEN and HOW to use it. The tool executes. The result returns to the LLM.\n\nSearch tools let agents retrieve real-time information through web search, document search, and database queries. Computation tools give agents the ability to write and run code, use calculators, and perform data analysis. Communication tools enable agents to send email, Slack messages, calendar invites, and notifications. File tools let agents read, write, create, and organize documents and data. API tools connect agents to any external service \u2014 GitHub, Jira, Salesforce, Stripe, anything with an API. Browser tools let agents navigate websites, click buttons, and fill forms autonomously.\n\nThe magic: one LLM plus the right tools equals an agent that can do almost anything a human with a computer can do.",
  },
  {
    title: 'Stage 4: How Agents Remember',
    content: "By default, every conversation starts fresh. The agent remembers nothing from yesterday. Memory changes that.\n\nIn-context memory (working memory) is everything in the current context window. What happened this session. Lost when the session ends. Limited by context window size.\n\nExternal memory (long-term memory) uses a vector database storing past interactions. The agent embeds memories, stores them, and retrieves relevant ones when needed. Survives across sessions. Works exactly like RAG.\n\nProcedural memory (how to do things) is the agent's system prompt and instructions. Learned workflows and standard procedures. Usually fixed, set by the developer.\n\nEpisodic memory (what happened before) consists of summaries of past conversations and tasks. \"Last time we worked on this project...\" Gives agents continuity across time.\n\nWithout memory, an agent starts from zero every time. With memory, an agent learns your preferences, remembers past decisions, builds on previous work, and feels like a persistent assistant rather than a stateless tool.",
  },
  {
    title: 'Stage 5: Agents Working Together',
    content: "One agent is powerful. Multiple agents working together are extraordinary. Just as human teams outperform individuals on complex tasks, agent teams outperform single agents.\n\nThe Orchestrator is the manager. It receives the high-level goal, breaks it into subtasks, assigns subtasks to specialist agents, and collects and combines results.\n\nSpecialist Agents are the workers. Each agent has a specific skill or tool set. A research agent searches and summarizes. A code agent writes and runs code. A writer agent drafts and edits content. A QA agent reviews and critiques.\n\nThe Critic Agent handles quality control. It reviews other agents' outputs, flags errors, inconsistencies, and improvements, and prevents bad outputs from reaching the user.\n\nAgents communicate by passing messages to each other, sharing context, results, and instructions. They can run in parallel or sequentially.\n\nReal example \u2014 Goal: \"Write a market research report.\" The orchestrator splits this into tasks for a research agent (gathers data), analysis agent (finds patterns), writer agent (drafts report), critic agent (reviews and improves), and formatter agent (final polish). All working simultaneously.",
  },
  {
    title: "Stage 6: Let's Build One Together",
    content: "Enough theory. Let us build an agent. Step by step. Right now.\n\nWe are building a Research Agent. Goal: research any topic and write a summary. Tools: web search and text summarizer. Memory: in-context only (simple first agent).\n\nThe agent will: receive a research topic from you, break it into search queries, search for information, read and summarize results, combine everything into a coherent summary, and present it to you with sources.\n\nWalk through the interactive builder below to assemble each component of your agent and see how they connect together.",
  },
  {
    title: 'Stage 7: Agents Already in Your World',
    content: "Agents are not future technology. They are running in production right now, handling real tasks for millions of people.\n\nFrom writing code to handling customer support tickets, from deep research to controlling browsers autonomously \u2014 agents are transforming every industry. Explore the cards below to see real agents in production today.",
  },
  {
    title: 'Stage 8: Where Agents Are Taking Us',
    content: "We are in the earliest days of agentic AI. Current agents are impressive but limited.\n\nCurrent limitations: reliability (agents still fail unpredictably), cost (many agent loops means many API calls means expensive), speed (sequential reasoning is slow), trust (hard to know when to trust agent decisions), and alignment (agents optimize for proxy goals, not always the true human intent).\n\nWhat is being solved right now: long-horizon tasks (agents that work for hours or days on complex projects), self-improving agents (agents that write and improve their own tools and prompts), embodied agents (robots controlled by LLM agents), and world models (agents that understand physics).\n\nThe really big question: if agents can do most knowledge work, what does that mean for how we work? Most thoughtful perspectives say agents handle routine cognitive work, while humans focus on judgment, creativity, relationships, values, and asking the right questions. The humans who thrive will be those who know how to direct, evaluate, and collaborate with agents.",
  },
]

const AAI_TOOLS = {
  0: [
    { name: 'LangChain', color: '#5856D6', desc: 'Framework for building LLM-powered applications and agents' },
    { name: 'AutoGPT', color: '#5856D6', desc: 'Autonomous agent that chains GPT-4 calls to achieve goals' },
    { name: 'CrewAI', color: '#5856D6', desc: 'Framework for orchestrating multi-agent teams' },
    { name: 'LlamaIndex', color: '#5856D6', desc: 'Data framework for building context-augmented agents' },
    { name: 'Microsoft AutoGen', color: '#0071E3', desc: 'Framework for building multi-agent conversations' },
    { name: 'OpenAI Assistants', color: '#0071E3', desc: 'API for building tool-using AI assistants' },
  ],
  1: [
    { name: 'LangChain', color: '#5856D6', desc: 'Framework with built-in ReAct agent implementation' },
    { name: 'LlamaIndex', color: '#5856D6', desc: 'Agent framework with step-wise execution' },
    { name: 'OpenAI Assistants API', color: '#0071E3', desc: 'Managed agent loop with tool calling' },
    { name: 'Claude Tool Use', color: '#5856D6', desc: 'Claude tool use for agent-style interactions' },
    { name: 'Microsoft Semantic Kernel', color: '#0071E3', desc: 'SDK for AI agent orchestration' },
    { name: 'Haystack', color: '#34C759', desc: 'Open-source framework for building AI pipelines' },
  ],
  2: [
    { name: 'LangChain Tools', color: '#5856D6', desc: 'Pre-built tool integrations for agents' },
    { name: 'OpenAI Function Calling', color: '#0071E3', desc: 'Structured tool calling via function schemas' },
    { name: 'Claude Tool Use', color: '#5856D6', desc: 'Claude structured tool use API' },
    { name: 'Zapier AI Actions', color: '#FF9500', desc: 'Connect agents to 5000+ apps' },
    { name: 'Browser Use', color: '#34C759', desc: 'Open-source browser automation for agents' },
    { name: 'E2B Code Interpreter', color: '#34C759', desc: 'Sandboxed code execution for AI agents' },
  ],
  3: [
    { name: 'Pinecone', color: '#5856D6', desc: 'Vector database for long-term agent memory' },
    { name: 'Weaviate', color: '#5856D6', desc: 'Open-source vector database for semantic search' },
    { name: 'ChromaDB', color: '#34C759', desc: 'Lightweight vector database for AI applications' },
    { name: 'Mem0', color: '#0071E3', desc: 'Memory layer for personalized AI agents' },
    { name: 'Zep', color: '#34C759', desc: 'Long-term memory for AI assistants' },
    { name: 'LangChain Memory', color: '#5856D6', desc: 'Built-in memory modules for conversation agents' },
  ],
  4: [
    { name: 'CrewAI', color: '#5856D6', desc: 'Framework for role-based multi-agent collaboration' },
    { name: 'Microsoft AutoGen', color: '#0071E3', desc: 'Conversational multi-agent framework' },
    { name: 'LangGraph', color: '#5856D6', desc: 'Stateful multi-agent workflows as graphs' },
    { name: 'OpenAI Swarm', color: '#0071E3', desc: 'Lightweight multi-agent orchestration' },
    { name: 'MetaGPT', color: '#34C759', desc: 'Multi-agent framework mimicking software teams' },
    { name: 'LlamaIndex Workflows', color: '#5856D6', desc: 'Event-driven multi-step agent workflows' },
  ],
  5: [
    { name: 'LangChain', color: '#5856D6', desc: 'Most popular agent building framework' },
    { name: 'OpenAI Assistants', color: '#0071E3', desc: 'Quickest way to build a hosted agent' },
    { name: 'Claude', color: '#5856D6', desc: 'Tool use and agentic capabilities built in' },
    { name: 'LlamaIndex', color: '#5856D6', desc: 'Data-aware agent framework' },
    { name: 'Flowise', color: '#34C759', desc: 'Visual drag-and-drop agent builder' },
    { name: 'n8n', color: '#FF9500', desc: 'Workflow automation with AI agent nodes' },
  ],
  6: [
    { name: 'LangChain', color: '#5856D6', desc: 'Production agent framework used by thousands' },
    { name: 'CrewAI', color: '#5856D6', desc: 'Multi-agent teams for enterprise tasks' },
    { name: 'Devin', color: '#0071E3', desc: 'Autonomous software engineering agent' },
    { name: 'Operator', color: '#0071E3', desc: 'OpenAI browser-controlling agent' },
    { name: 'Claude', color: '#5856D6', desc: 'Anthropic agent with computer use capabilities' },
    { name: 'Dify', color: '#34C759', desc: 'Open-source LLM app and agent platform' },
  ],
  7: [
    { name: 'LangChain', color: '#5856D6', desc: 'Continually evolving agent framework' },
    { name: 'CrewAI', color: '#5856D6', desc: 'Growing multi-agent ecosystem' },
    { name: 'AutoGen', color: '#0071E3', desc: 'Microsoft research multi-agent platform' },
    { name: 'LlamaIndex', color: '#5856D6', desc: 'Data agent framework expanding capabilities' },
    { name: 'OpenAI Assistants', color: '#0071E3', desc: 'Managed agent infrastructure' },
    { name: 'Claude Tool Use', color: '#5856D6', desc: 'Advancing agentic capabilities' },
  ],
}

/* ── Tip Content ── */

const TIP_CONTENT = {
  0: 'Most production agents today sit at 60\u201380% autonomy. Full autonomy is possible technically but safety and reliability concerns mean humans stay in the loop for consequential decisions.',
  1: 'The agent loop is why token context matters so much for agents. Each loop iteration adds more content \u2014 the goal, previous thoughts, actions, and observations all accumulate. Long agent runs can exhaust context.',
  2: 'Tool design is as important as the LLM itself. Well-designed tools with clear names and descriptions help the agent pick the right tool at the right time. Poor tool design leads to confused, ineffective agents.',
  3: 'Memory management is one of the hardest unsolved problems in agent design. Too much context slows the agent and costs more. Too little and it forgets important information. Getting the balance right is part engineering, part art.',
  4: 'Multi-agent systems are powerful but complex. More agents means more potential for errors to compound. Start with a single well-designed agent before adding complexity.',
  7: 'The best way to understand agents is to build one. LangChain, CrewAI, and OpenAI Assistants all have free tiers. Start with a simple single-tool agent. The concepts click immediately when you see it run.',
}

/* ── Stage 1 Viz: Chatbot vs Agent comparison ── */

function ChatbotVsAgentViz({ active }) {
  const [showAgent, setShowAgent] = useState(false)
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setShowAgent(true), 600)
      return () => clearTimeout(t)
    }
  }, [active])

  const AUTONOMY = [
    { label: 'Chatbot', pct: 0 },
    { label: 'Copilot', pct: 20 },
    { label: 'Semi-auto', pct: 60 },
    { label: 'Autonomous', pct: 90 },
    { label: 'Full', pct: 100 },
  ]

  return (
    <div className="aai-viz aai-comparison-viz">
      <div className="aai-compare-panels">
        <div className="aai-compare-panel aai-compare-chatbot">
          <div className="aai-compare-panel-title">Chatbot</div>
          <div className="aai-flow-linear">
            <div className="aai-flow-node"><ChatIcon size={16} color="#FF9500" /> User</div>
            <div className="aai-flow-arrow">&rarr;</div>
            <div className="aai-flow-node"><RobotIcon size={16} color="#FF9500" /> LLM</div>
            <div className="aai-flow-arrow">&rarr;</div>
            <div className="aai-flow-node"><FileIcon size={16} color="#FF9500" /> Response</div>
          </div>
          <div className="aai-flow-label">One turn. Done.</div>
        </div>
        <div className={`aai-compare-panel aai-compare-agent${showAgent ? ' aai-compare-agent-visible' : ''}`}>
          <div className="aai-compare-panel-title">Agent</div>
          <div className="aai-flow-loop">
            <div className="aai-loop-step"><TargetIconSmall /> Goal</div>
            <div className="aai-loop-arrow">&rarr;</div>
            <div className="aai-loop-step"><CpuIcon size={16} color="#5856D6" /> Plan</div>
            <div className="aai-loop-arrow">&rarr;</div>
            <div className="aai-loop-step"><WrenchIcon size={16} color="#5856D6" /> Tool</div>
            <div className="aai-loop-arrow">&rarr;</div>
            <div className="aai-loop-step"><EyeIcon size={16} color="#5856D6" /> Observe</div>
          </div>
          <div className="aai-flow-repeat">
            <RepeatIcon size={14} color="#5856D6" />
            <span>Repeat until done</span>
          </div>
        </div>
      </div>
      <div className="aai-autonomy">
        <div className="aai-autonomy-label">Autonomy Spectrum</div>
        <div className="aai-autonomy-track">
          <div className="aai-autonomy-fill" />
          <div className="aai-autonomy-marker" style={{ left: '70%' }}>
            <div className="aai-autonomy-marker-dot" />
            <div className="aai-autonomy-marker-label">Today's agents: 60&ndash;80%</div>
          </div>
        </div>
        <div className="aai-autonomy-labels">
          {AUTONOMY.map((a) => (
            <span key={a.label} className="aai-autonomy-point">
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function TargetIconSmall() {
  return (
    <svg className="content-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function ChatIcon({ size = 16, color = '#8E8E93' }) {
  return (
    <svg className="content-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

/* ── Stage 2 Viz: Agent Loop ── */

function AgentLoopViz({ active }) {
  const [running, setRunning] = useState(false)
  const [loopCount, setLoopCount] = useState(0)
  const [activeNode, setActiveNode] = useState(-1)
  const [traceLines, setTraceLines] = useState([])
  const timersRef = useRef([])

  const LOOP_NODES = ['Perceive', 'Think', 'Act', 'Observe', 'Repeat']
  const TRACE = [
    { type: 'thought', text: 'I need to find the weather in Paris' },
    { type: 'action', text: 'search_web("Paris weather today")' },
    { type: 'observation', text: 'Paris: 18\u00B0C, partly cloudy' },
    { type: 'thought', text: 'Now I have the weather, I can answer' },
    { type: 'action', text: 'respond("Paris is 18\u00B0C and partly cloudy today")' },
    { type: 'done', text: 'Goal achieved.' },
  ]

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runLoop() {
    if (running) return
    clearTimers()
    setRunning(true)
    setLoopCount(0)
    setActiveNode(-1)
    setTraceLines([])

    const delay = 400
    const totalSteps = LOOP_NODES.length * 3

    // Phase 1: Loop animation
    for (let step = 0; step < totalSteps; step++) {
      const nodeIdx = step % LOOP_NODES.length
      const loop = Math.floor(step / LOOP_NODES.length) + 1
      timersRef.current.push(setTimeout(() => {
        setActiveNode(nodeIdx)
        setLoopCount(loop)
      }, delay * (step + 1)))
    }

    // Phase 2: Trace lines
    const traceStart = delay * (totalSteps + 1)
    timersRef.current.push(setTimeout(() => setActiveNode(-1), traceStart))
    TRACE.forEach((line, i) => {
      timersRef.current.push(setTimeout(() => {
        setTraceLines((prev) => [...prev, line])
        if (i === TRACE.length - 1) {
          setRunning(false)
        }
      }, traceStart + delay * (i + 1)))
    })
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  return (
    <div className="aai-viz aai-loop-viz">
      <div className="aai-loop-ring">
        {LOOP_NODES.map((node, i) => (
          <div key={node} className={`aai-loop-node${activeNode === i ? ' aai-loop-node-active' : ''}`}>
            <div className="aai-loop-node-circle">{i + 1}</div>
            <div className="aai-loop-node-label">{node}</div>
          </div>
        ))}
        {loopCount > 0 && (
          <div className="aai-loop-counter">Loop {loopCount} of 3{loopCount >= 3 ? ' \u2014 Done!' : '...'}</div>
        )}
      </div>
      <button className="aai-run-btn" onClick={runLoop} disabled={running}>
        <PlayIcon size={14} color="#fff" /> {running ? 'Running...' : 'Run Agent'}
      </button>
      {traceLines.length > 0 && (
        <div className="aai-trace">
          <div className="aai-trace-title">ReAct Trace</div>
          {traceLines.map((line, i) => (
            <div key={i} className={`aai-trace-line aai-trace-${line.type}`}>
              <span className="aai-trace-label">
                {line.type === 'thought' ? 'Thought' : line.type === 'action' ? 'Action' : line.type === 'observation' ? 'Observation' : 'Status'}:
              </span>{' '}
              {line.type === 'done' ? <strong>{line.text}</strong> : line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Stage 3 Viz: Tool Explorer ── */

const TOOL_CATEGORIES = [
  { id: 'search', label: 'Search', icon: SearchIcon, example: { tool_name: 'web_search', input: 'current Bitcoin price', output: '$67,432 USD as of 2 minutes ago' }, tools: ['Google Search API', 'Tavily', 'Bing Search'] },
  { id: 'compute', label: 'Compute', icon: CodeIcon, example: { tool_name: 'code_exec', input: 'import pandas as pd; df.describe()', output: 'count: 1000, mean: 42.3, std: 12.1...' }, tools: ['E2B', 'Code Interpreter', 'Jupyter'] },
  { id: 'comms', label: 'Comms', icon: MailIcon, example: { tool_name: 'send_email', input: 'to: team@co, subject: Q3 Report', output: 'Email sent successfully' }, tools: ['Gmail API', 'Slack SDK', 'Twilio'] },
  { id: 'files', label: 'Files', icon: FileIcon, example: { tool_name: 'write_file', input: 'report.md, # Q3 Summary...', output: 'File saved: report.md (2.4KB)' }, tools: ['Local FS', 'Google Drive', 'Dropbox'] },
  { id: 'apis', label: 'APIs', icon: LinkIcon, example: { tool_name: 'github_api', input: 'POST /repos/issues', output: 'Issue #42 created successfully' }, tools: ['GitHub', 'Jira', 'Stripe'] },
  { id: 'browser', label: 'Browser', icon: GlobeIcon, example: { tool_name: 'browser_nav', input: 'go to flights.google.com, search LAX→JFK', output: 'Found 12 flights, cheapest: $234' }, tools: ['Playwright', 'Browser Use', 'Browserbase'] },
]

function ToolExplorerViz({ active }) {
  const [selectedTool, setSelectedTool] = useState(null)
  const [exploredCount, setExploredCount] = useState(0)
  const explored = useRef(new Set())

  function handleSelect(id) {
    if (selectedTool === id) {
      setSelectedTool(null)
      return
    }
    setSelectedTool(id)
    if (!explored.current.has(id)) {
      explored.current.add(id)
      setExploredCount(explored.current.size)
    }
  }

  const sel = TOOL_CATEGORIES.find((t) => t.id === selectedTool)

  return (
    <div className="aai-viz aai-tools-viz">
      <div className="aai-tools-ring">
        <div className="aai-tools-center">
          <RobotIcon size={20} color="#5856D6" />
          <span>Agent</span>
        </div>
        <div className="aai-tools-nodes">
          {TOOL_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedTool === cat.id
            return (
              <button
                key={cat.id}
                className={`aai-tool-node${isSelected ? ' aai-tool-node-active' : ''}`}
                onClick={() => handleSelect(cat.id)}
              >
                <Icon size={16} color="#5856D6" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      {sel && (
        <div className="aai-tool-detail">
          <div className="aai-tool-call">
            <div className="aai-tool-call-row"><span className="aai-tool-call-key">tool_name:</span> <span className="aai-tool-call-val">&quot;{sel.example.tool_name}&quot;</span></div>
            <div className="aai-tool-call-row"><span className="aai-tool-call-key">input:</span> <span className="aai-tool-call-val">&quot;{sel.example.input}&quot;</span></div>
            <div className="aai-tool-call-row"><span className="aai-tool-call-key">output:</span> <span className="aai-tool-call-val">&quot;{sel.example.output}&quot;</span></div>
          </div>
          <div className="aai-tool-real">Real tools: {sel.tools.join(', ')}</div>
        </div>
      )}
      {exploredCount >= TOOL_CATEGORIES.length && (
        <div className="aai-tools-complete">All {TOOL_CATEGORIES.length} tool categories explored!</div>
      )}
    </div>
  )
}

/* ── Stage 4 Viz: Memory Types ── */

const MEMORY_TYPES = [
  { id: 'in-context', label: 'In-Context', desc: 'Working memory \u2014 everything in the current context window. Lost when session ends.', detail: 'Messages, observations, thoughts', capacity: '128K tokens' },
  { id: 'external', label: 'External', desc: 'Long-term memory via vector database. Survives across sessions. Works like RAG.', detail: 'Powered by: Pinecone, Weaviate, ChromaDB', capacity: 'Unlimited' },
  { id: 'procedural', label: 'Procedural', desc: 'How to do things \u2014 system prompt and fixed instructions the agent always follows.', detail: 'Fixed instructions, workflows', capacity: 'Set by developer' },
  { id: 'episodic', label: 'Episodic', desc: 'What happened before \u2014 summaries of past sessions giving agents continuity.', detail: 'Session 1: Marketing report\nSession 2: Q3 data review\nSession 3: You are here', capacity: 'Growing over time' },
]

function MemoryViz({ active }) {
  return (
    <div className="aai-viz aai-memory-viz">
      <div className="aai-memory-grid">
        {MEMORY_TYPES.map((mem) => (
          <div key={mem.id} className="aai-memory-card">
            <div className="aai-memory-card-title">{mem.label}</div>
            <div className="aai-memory-card-desc">{mem.desc}</div>
            <div className="aai-memory-card-detail">{mem.detail}</div>
            <div className="aai-memory-card-capacity">Capacity: {mem.capacity}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Stage 5 Viz: Multi-Agent Network ── */

const AGENT_ROLES = [
  { id: 'researcher', label: 'Researcher', desc: 'Searches web, summarizes findings' },
  { id: 'writer', label: 'Writer', desc: 'Drafts content from research' },
  { id: 'coder', label: 'Coder', desc: 'Writes and runs code' },
  { id: 'critic', label: 'Critic', desc: 'Reviews quality, suggests improvements' },
  { id: 'formatter', label: 'Formatter', desc: 'Final polish and formatting' },
]

function MultiAgentViz({ active }) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState(-1) // -1=idle, 0=fan-out, 1=working, 2=collect, 3=done
  const [activeAgents, setActiveAgents] = useState([])
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runTeam() {
    if (running) return
    clearTimers()
    setRunning(true)
    setPhase(0)
    setActiveAgents([])

    const delay = 500
    // Phase 0: Activate each agent one by one
    AGENT_ROLES.forEach((agent, i) => {
      timersRef.current.push(setTimeout(() => {
        setActiveAgents((prev) => [...prev, agent.id])
      }, delay * (i + 1)))
    })

    const afterFanOut = delay * (AGENT_ROLES.length + 1)
    // Phase 1: Working
    timersRef.current.push(setTimeout(() => setPhase(1), afterFanOut))
    // Phase 2: Collecting
    timersRef.current.push(setTimeout(() => setPhase(2), afterFanOut + delay * 3))
    // Phase 3: Done
    timersRef.current.push(setTimeout(() => {
      setPhase(3)
      setRunning(false)
    }, afterFanOut + delay * 5))
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  return (
    <div className="aai-viz aai-multi-viz">
      <div className="aai-multi-network">
        <div className="aai-multi-orchestrator">
          <div className="aai-multi-orch-circle">
            <CpuIcon size={20} color="#5856D6" />
          </div>
          <div className="aai-multi-orch-label">Orchestrator</div>
        </div>
        <div className="aai-multi-agents">
          {AGENT_ROLES.map((agent) => {
            const isActive = activeAgents.includes(agent.id)
            return (
              <div key={agent.id} className={`aai-multi-agent${isActive ? ' aai-multi-agent-active' : ''}`}>
                <div className="aai-multi-agent-circle">
                  {isActive && phase === 1 && <span className="aai-multi-spinner" />}
                </div>
                <div className="aai-multi-agent-label">{agent.label}</div>
                <div className="aai-multi-agent-desc">{agent.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
      <button className="aai-run-btn" onClick={runTeam} disabled={running}>
        <PlayIcon size={14} color="#fff" /> {running ? 'Running...' : 'Run Team'}
      </button>
      {phase >= 0 && (
        <div className="aai-multi-status">
          {phase === 0 && 'Assigning tasks to specialists...'}
          {phase === 1 && 'Specialists working in parallel...'}
          {phase === 2 && 'Collecting and combining results...'}
          {phase === 3 && <span className="aai-multi-done"><CheckIcon size={14} color="#34C759" /> Report complete!</span>}
        </div>
      )}
    </div>
  )
}

/* ── Stage 6 Viz: Build an Agent ── */

const BUILD_STEPS = [
  { label: 'Define Goal', desc: 'What should your agent research?' },
  { label: 'Add LLM', desc: 'Choose the brain for your agent' },
  { label: 'Add Tools', desc: 'Give your agent abilities' },
  { label: 'Add Memory', desc: 'How should the agent remember?' },
  { label: 'System Prompt', desc: 'Define the agent\'s instructions' },
  { label: 'Run It', desc: 'Test your agent' },
]

const BUILD_TRACE = [
  { type: 'thought', text: 'I need to research AI developments' },
  { type: 'action', text: 'web_search("latest AI developments 2025")' },
  { type: 'observation', text: '[3 articles found about AI agents, reasoning models, open-source progress]' },
  { type: 'thought', text: 'Good results. Let me summarize the key findings.' },
  { type: 'action', text: 'summarize([articles])' },
  { type: 'done', text: 'Your agent just worked!' },
]

function BuildAgentViz({ active }) {
  const [buildStep, setBuildStep] = useState(0)
  const [goal, setGoal] = useState('')
  const [llm, setLlm] = useState('GPT-4')
  const [tools, setTools] = useState({ search: true, summarize: true, email: false })
  const [memory, setMemory] = useState('in-context')
  const [prompt, setPrompt] = useState('You are a research assistant. When given a topic, search for recent information, summarize the key findings, and present them clearly with sources.')
  const [traceLines, setTraceLines] = useState([])
  const [traceRunning, setTraceRunning] = useState(false)
  const timersRef = useRef([])

  const PRESETS = ['Latest AI developments', 'Climate change solutions', 'Space exploration news']

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runTrace() {
    if (traceRunning) return
    clearTimers()
    setTraceRunning(true)
    setTraceLines([])

    const delay = 600
    BUILD_TRACE.forEach((line, i) => {
      timersRef.current.push(setTimeout(() => {
        setTraceLines((prev) => [...prev, line])
        if (i === BUILD_TRACE.length - 1) {
          setTraceRunning(false)
        }
      }, delay * (i + 1)))
    })
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  return (
    <div className="aai-viz aai-build-viz">
      <div className="aai-build-steps">
        {BUILD_STEPS.map((s, i) => (
          <div key={i} className={`aai-build-step${buildStep === i ? ' aai-build-step-current' : ''}${buildStep > i ? ' aai-build-step-done' : ''}`}>
            <div className="aai-build-step-num">{buildStep > i ? <CheckIcon size={12} color="#34C759" /> : i + 1}</div>
            <div className="aai-build-step-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="aai-build-content">
        {buildStep === 0 && (
          <div className="aai-build-pane">
            <div className="aai-build-pane-title">{BUILD_STEPS[0].desc}</div>
            <input
              className="aai-build-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Type a research topic..."
            />
            <div className="aai-build-presets">
              {PRESETS.map((p) => (
                <button key={p} className="aai-build-preset" onClick={() => setGoal(p)}>{p}</button>
              ))}
            </div>
            <button className="aai-build-next" onClick={() => setBuildStep(1)} disabled={!goal.trim()}>Add Component &rarr;</button>
          </div>
        )}
        {buildStep === 1 && (
          <div className="aai-build-pane">
            <div className="aai-build-pane-title">{BUILD_STEPS[1].desc}</div>
            <div className="aai-build-options">
              {['GPT-4', 'Claude', 'Gemini', 'Llama'].map((m) => (
                <button key={m} className={`aai-build-option${llm === m ? ' aai-build-option-active' : ''}`} onClick={() => setLlm(m)}>{m}</button>
              ))}
            </div>
            <button className="aai-build-next" onClick={() => setBuildStep(2)}>Add Component &rarr;</button>
          </div>
        )}
        {buildStep === 2 && (
          <div className="aai-build-pane">
            <div className="aai-build-pane-title">{BUILD_STEPS[2].desc}</div>
            <div className="aai-build-toggles">
              {Object.entries(tools).map(([key, val]) => (
                <label key={key} className="aai-build-toggle">
                  <input type="checkbox" checked={val} onChange={() => setTools((prev) => ({ ...prev, [key]: !prev[key] }))} />
                  <span className="aai-build-toggle-label">
                    {key === 'search' ? 'Web Search' : key === 'summarize' ? 'Text Summarizer' : 'Email (not needed)'}
                  </span>
                </label>
              ))}
            </div>
            <button className="aai-build-next" onClick={() => setBuildStep(3)}>Add Component &rarr;</button>
          </div>
        )}
        {buildStep === 3 && (
          <div className="aai-build-pane">
            <div className="aai-build-pane-title">{BUILD_STEPS[3].desc}</div>
            <div className="aai-build-options">
              <button className={`aai-build-option${memory === 'in-context' ? ' aai-build-option-active' : ''}`} onClick={() => setMemory('in-context')}>In-Context (simple)</button>
              <button className={`aai-build-option${memory === 'vector' ? ' aai-build-option-active' : ''}`} onClick={() => setMemory('vector')}>Vector Database (advanced)</button>
            </div>
            <button className="aai-build-next" onClick={() => setBuildStep(4)}>Add Component &rarr;</button>
          </div>
        )}
        {buildStep === 4 && (
          <div className="aai-build-pane">
            <div className="aai-build-pane-title">{BUILD_STEPS[4].desc}</div>
            <textarea className="aai-build-textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
            <button className="aai-build-next" onClick={() => setBuildStep(5)}>Add Component &rarr;</button>
          </div>
        )}
        {buildStep === 5 && (
          <div className="aai-build-pane">
            <div className="aai-build-pane-title">Your agent is ready!</div>
            <div className="aai-build-summary">
              <div className="aai-build-summary-row"><strong>Goal:</strong> {goal || 'Latest AI developments'}</div>
              <div className="aai-build-summary-row"><strong>LLM:</strong> {llm}</div>
              <div className="aai-build-summary-row"><strong>Tools:</strong> {Object.entries(tools).filter(([, v]) => v).map(([k]) => k === 'search' ? 'Web Search' : k === 'summarize' ? 'Text Summarizer' : 'Email').join(', ')}</div>
              <div className="aai-build-summary-row"><strong>Memory:</strong> {memory === 'in-context' ? 'In-Context' : 'Vector Database'}</div>
            </div>
            <button className="aai-run-btn" onClick={runTrace} disabled={traceRunning}>
              <PlayIcon size={14} color="#fff" /> {traceRunning ? 'Running...' : 'Test Your Agent'}
            </button>
            {traceLines.length > 0 && (
              <div className="aai-trace">
                {traceLines.map((line, i) => (
                  <div key={i} className={`aai-trace-line aai-trace-${line.type}`}>
                    <span className="aai-trace-label">
                      {line.type === 'thought' ? 'Thought' : line.type === 'action' ? 'Action' : line.type === 'observation' ? 'Observation' : 'Status'}:
                    </span>{' '}
                    {line.type === 'done' ? <strong>{line.text}</strong> : line.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Stage 7 Viz: Real Agents ── */

const REAL_AGENTS = [
  { title: 'Software Development', agents: 'Devin, GitHub Copilot Workspace, Cursor', desc: 'Reads requirements, writes code, runs tests, fixes bugs, opens pull requests \u2014 autonomously', stat: 'Devin solved 13.86% of real GitHub issues', icon: CodeIcon },
  { title: 'Customer Support', agents: 'Intercom Fin, Salesforce Einstein, Zendesk AI', desc: 'Handles tickets end-to-end: reads issue, checks order history, issues refunds, follows up', stat: 'Handles 60\u201380% of tickets without humans', icon: MailIcon },
  { title: 'Deep Research', agents: 'Perplexity, OpenAI Deep Research, Gemini', desc: 'Searches dozens of sources, synthesizes findings, writes comprehensive research reports in minutes', stat: 'Reports that took analysts days now take minutes', icon: SearchIcon },
  { title: 'Personal Productivity', agents: 'Claude, ChatGPT, Gemini with tools', desc: 'Manages calendar, drafts emails, books meetings, summarizes documents, tracks tasks', stat: null, icon: BriefcaseIcon },
  { title: 'Business Intelligence', agents: 'Julius AI, Code Interpreter, Pandas AI', desc: 'Uploads data, writes analysis code, generates charts, finds patterns, explains findings', stat: null, icon: BarChartIcon },
  { title: 'Browser & Computer Control', agents: 'Claude Computer Use, Operator, Browser Use', desc: 'Controls a real browser, fills forms, navigates websites, completes multi-step web tasks', stat: null, icon: GlobeIcon },
  { title: 'Document Review', agents: 'Harvey AI, CoCounsel, Ironclad AI', desc: 'Reviews contracts, flags risks, ensures compliance, summarizes legal documents', stat: null, icon: FileIcon },
  { title: 'Clinical Support', agents: 'Nabla, Abridge, Nuance DAX', desc: 'Listens to patient consultations, generates clinical notes, suggests follow-ups', stat: null, icon: HospitalIcon },
]

function RealAgentsViz({ active }) {
  const [visibleCount, setVisibleCount] = useState(0)

  function showNext() {
    if (visibleCount < REAL_AGENTS.length) {
      setVisibleCount((c) => c + 1)
    }
  }

  return (
    <div className="aai-viz aai-real-viz">
      <div className="aai-real-grid">
        {REAL_AGENTS.slice(0, visibleCount).map((agent, i) => {
          const Icon = agent.icon
          return (
            <div key={i} className="aai-real-card">
              <div className="aai-real-card-header">
                <Icon size={16} color="#5856D6" />
                <span className="aai-real-card-title">{agent.title}</span>
              </div>
              <div className="aai-real-card-agents">{agent.agents}</div>
              <div className="aai-real-card-desc">{agent.desc}</div>
              {agent.stat && <div className="aai-real-card-stat">{agent.stat}</div>}
            </div>
          )
        })}
      </div>
      {visibleCount < REAL_AGENTS.length && (
        <button className="aai-show-next-btn" onClick={showNext}>
          Show next ({visibleCount}/{REAL_AGENTS.length})
        </button>
      )}
      {visibleCount >= REAL_AGENTS.length && (
        <div className="aai-real-complete">All {REAL_AGENTS.length} agent categories revealed!</div>
      )}
    </div>
  )
}

/* ── Stage 8 Viz: Frontier ── */

const TIMELINE = [
  { year: '2024', label: 'Single-tool agents mainstream', detail: 'ChatGPT plugins, simple tool-calling agents become widely adopted. One agent, one tool, one task.' },
  { year: '2025', label: 'Reliable multi-agent teams', detail: 'Frameworks like CrewAI and AutoGen make multi-agent orchestration production-ready.' },
  { year: '2026', label: 'Long-horizon autonomous work', detail: 'Agents that work for hours or days on complex multi-step projects without human intervention.' },
  { year: '2027', label: 'Self-improving agent systems', detail: 'Agents that write and improve their own tools, prompts, and workflows autonomously.' },
]

const STARTER_PROJECTS = [
  { title: 'Research Agent', desc: 'Build an agent that researches any topic and writes a structured report', tools: 'LangChain + Tavily Search + GPT-4', difficulty: 'Beginner' },
  { title: 'Personal Assistant', desc: 'Build an agent that manages your calendar and drafts emails from voice notes', tools: 'CrewAI + Gmail API + Calendar API', difficulty: 'Intermediate' },
  { title: 'Multi-Agent Team', desc: 'Build a 3-agent content team: researcher, writer, and editor working together', tools: 'CrewAI or AutoGen + GPT-4', difficulty: 'Advanced' },
]

function FrontierViz({ active }) {
  const [expandedYear, setExpandedYear] = useState(null)

  return (
    <div className="aai-viz aai-frontier-viz">
      <div className="aai-timeline">
        <div className="aai-timeline-title">Current Frontier</div>
        <div className="aai-timeline-track">
          {TIMELINE.map((item) => (
            <button
              key={item.year}
              className={`aai-timeline-node${expandedYear === item.year ? ' aai-timeline-node-active' : ''}`}
              onClick={() => setExpandedYear(expandedYear === item.year ? null : item.year)}
            >
              <div className="aai-timeline-year">{item.year}</div>
              <div className="aai-timeline-label">{item.label}</div>
            </button>
          ))}
        </div>
        {expandedYear && (
          <div className="aai-timeline-detail">
            {TIMELINE.find((t) => t.year === expandedYear)?.detail}
          </div>
        )}
      </div>
      <div className="aai-starters">
        <div className="aai-starters-title">Build Something Now</div>
        <div className="aai-starters-grid">
          {STARTER_PROJECTS.map((proj) => (
            <div key={proj.title} className="aai-starter-card">
              <div className="aai-starter-title">{proj.title}</div>
              <div className="aai-starter-desc">{proj.desc}</div>
              <div className="aai-starter-tools">Tools: {proj.tools}</div>
              <div className="aai-starter-diff">Difficulty: {proj.difficulty}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Final Screen Toolkit ── */

const TOOLKIT = [
  { concept: 'Agents vs Chatbots', when: 'Task needs multiple steps or real-world actions', takeaway: 'Agents act toward goals; chatbots just respond', icon: <RobotIcon size={24} color="#5856D6" /> },
  { concept: 'Agent Loop', when: 'You need iterative reasoning with feedback', takeaway: 'Perceive → Think → Act → Observe → Repeat', icon: <RefreshIcon size={24} color="#5856D6" /> },
  { concept: 'Tools', when: 'Agent must search, compute, or call APIs', takeaway: 'Functions that let agents interact with the world', icon: <WrenchIcon size={24} color="#5856D6" /> },
  { concept: 'Memory', when: 'Context exceeds a single conversation', takeaway: 'In-context, external, procedural, episodic', icon: <FileIcon size={24} color="#5856D6" /> },
  { concept: 'Multi-Agent', when: 'Problem decomposes into specialist roles', takeaway: 'Orchestrator + specialists + critic', icon: <UserIcon size={24} color="#5856D6" /> },
  { concept: 'Building', when: 'Starting a new agent from scratch', takeaway: 'Goal + LLM + Tools + Memory + Prompt', icon: <ConstructionIcon size={24} color="#5856D6" /> },
  { concept: 'Production', when: 'Deploying agents for real users', takeaway: 'Coding, support, research, browser agents', icon: <RocketIcon size={24} color="#5856D6" /> },
  { concept: 'Frontier', when: 'Planning for next-gen agent capabilities', takeaway: 'Long-horizon, self-improving, embodied', icon: <CompassIcon size={24} color="#5856D6" /> },
]

/* ── Main Component ── */

function AgenticAI({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('agentic-ai', -1)
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
  }, [stage, maxStageReached])

  // Scroll stepper into view
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  // Progressive learn tips
  useEffect(() => {
    if (stage === 0 && !dismissedTips.has('agents-intro') && !learnTip) {
      setLearnTip({ id: 'agents-intro', text: 'Look at the two panels above \u2014 same request, completely different behavior. A chatbot replies once; an agent keeps going until the job is done.' })
    } else if (stage === 1 && !dismissedTips.has('agent-loop') && !learnTip) {
      setLearnTip({ id: 'agent-loop', text: 'Click "Run Agent" to watch the loop in action. Each cycle adds more context \u2014 this is why agents need large context windows.' })
    } else if (stage === 3 && !dismissedTips.has('memory') && !learnTip) {
      setLearnTip({ id: 'memory', text: 'Remember RAG from earlier? External memory for agents works exactly the same way \u2014 embed, store, retrieve. Everything you learned connects here.' })
    } else if (stage === 5 && !dismissedTips.has('build') && !learnTip) {
      setLearnTip({ id: 'build', text: 'Walk through all 6 steps to build your agent. Each component you add makes the agent more capable \u2014 this is exactly how real agents are designed.' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips])

  // Cleanup
  useEffect(() => {
    return () => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current) }
  }, [])

  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('agentic-ai')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.aai-root')
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

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
  }

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    reset()
    setShowWelcome(true)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
  }

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips((prev) => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  const vizComponents = {
    0: <ChatbotVsAgentViz active={stage === 0} />,
    1: <AgentLoopViz active={stage === 1} />,
    2: <ToolExplorerViz active={stage === 2} />,
    3: <MemoryViz active={stage === 3} />,
    4: <MultiAgentViz active={stage === 4} />,
    5: <BuildAgentViz active={stage === 5} />,
    6: <RealAgentsViz active={stage === 6} />,
    7: <FrontierViz active={stage === 7} />,
  }

  // Entry screen
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="agentic-ai" size={48} style={{ color: '#5856D6' }} />}
        title="Agentic AI"
        subtitle="AI That Does, Not Just Says"
        description="ChatGPT answers questions. Agents book flights, write code, browse the web, and manage your calendar &mdash; autonomously. This is the frontier of AI. And it is already here."
        buttonText="Meet the Agents"
        onStart={() => {
          setStage(0)
          markModuleStarted('agentic-ai')
        }}
      />
    )
  }

  // Quiz
  if (showQuiz) {
    return (
      <div className="how-llms aai-root quiz-fade-in">
        <Quiz
          questions={agenticAIQuiz}
          tabName="Agentic AI"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="agentic-ai"
        />
      </div>
    )
  }

  return (
    <div className={`how-llms aai-root${fading ? ' how-fading' : ''}`}>
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>

      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Agentic AI</strong> &mdash; everything you have learned so far &mdash; LLMs, RAG, prompt engineering, fine-tuning &mdash; it all comes together here. Agents are AI that acts. This is the cutting edge.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>8 stages</strong> from chatbot basics to the frontier of autonomous AI</li>
              <li>Build an agent step by step and watch it run in the interactive builder</li>
              <li>See real agents in production today and where this is all heading</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper aai-stepper">
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
                    <strong>{EXPLANATIONS[stage].title}</strong>
                  </div>
                  {EXPLANATIONS[stage].content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {TIP_CONTENT[stage] && (
                    <div className="how-info-tip">
                      <TipIcon size={16} color="#eab308" />
                      {TIP_CONTENT[stage]}
                    </div>
                  )}
                  <ToolChips tools={AAI_TOOLS[stage]} />
                </div>

                {vizComponents[stage]}

                {learnTip && (
                  <div className={`learn-tip ${learnTipFading ? 'learn-tip-fading' : ''}`} role="status" aria-live="polite">
                    <span className="learn-tip-text">{learnTip.text}</span>
                    <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>&larr; Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {NEXT_LABELS[stage]}
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
          <div className="how-final-celebration">You Now Understand Agentic AI</div>

          <div className="pe-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Agentic AI Toolkit</div>
            <table className="pe-reference">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>When to use</th>
                  <th>Key phrase</th>
                </tr>
              </thead>
              <tbody>
                {TOOLKIT.map((item) => (
                  <tr key={item.concept}>
                    <td className="pe-ref-technique">{item.concept}</td>
                    <td>{item.when}</td>
                    <td className="pe-ref-phrase">{item.takeaway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={handleStartOver}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="agentic-ai" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default AgenticAI
