import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { TipIcon, CheckIcon, FileIcon, SearchIcon, ShieldIcon, TargetIcon, LayersIcon, EyeIcon, BookIcon, TrendingUpIcon, CodeIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { aiPMWorkflowsQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './AIPMWorkflows.css'

/* ── Stages ── */

const STAGES = [
  { key: 'ai-pm-week', label: 'Your Week' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'planning', label: 'Planning' },
  { key: 'communication', label: 'Communication' },
  { key: 'playbook', label: 'Playbook' },
]

const STAGE_TOOLTIPS = {
  'ai-pm-week': 'Where AI fits in your week',
  'discovery': 'Discovery and synthesis',
  'planning': 'Planning and prioritisation',
  'communication': 'Communication and execution',
  'playbook': 'Your PM prompt playbook',
}

const NEXT_LABELS = [
  'Discovery and synthesis →',
  'Planning and prioritisation →',
  'Communication and execution →',
  'Your prompt playbook →',
  'See what you learned →',
]

/* ── PM Week View Data ── */

const WEEK_DAYS = [
  { label: 'MON', nodes: [
    { id: 'standup', label: 'Standup', tool: 'Notion AI' },
    { id: 'triage', label: 'Triage', tool: '' },
  ]},
  { label: 'TUE', nodes: [
    { id: 'discovery', label: 'Discovery', tool: 'Claude' },
    { id: 'synthesis', label: 'Synthesis', tool: 'Notion AI' },
    { id: 'feedback', label: 'Feedback', tool: 'Linear AI' },
  ]},
  { label: 'WED', nodes: [
    { id: 'roadmap', label: 'Roadmap', tool: 'Claude' },
    { id: 'prioritise', label: 'Prioritise', tool: 'Linear' },
  ]},
  { label: 'THU', nodes: [
    { id: 'stakeholder', label: 'Stakeholder', tool: 'Claude' },
    { id: 'deck', label: 'Deck', tool: 'ChatGPT' },
  ]},
  { label: 'FRI', nodes: [
    { id: 'retro', label: 'Retro', tool: 'Claude' },
    { id: 'sprint', label: 'Plan', tool: 'Linear AI' },
  ]},
]

function getActiveNodes(stage) {
  if (stage === 1) return ['discovery', 'synthesis', 'feedback']
  if (stage === 2) return ['roadmap', 'prioritise']
  if (stage === 3) return ['standup', 'triage', 'stakeholder', 'deck', 'retro', 'sprint']
  if (stage === 4) return WEEK_DAYS.flatMap(d => d.nodes.map(n => n.id))
  return []
}

/* ── Stage Info Content ── */

const EXPLANATIONS = [
  {
    title: 'Stage 1: Your Week, Reimagined',
    content: 'A typical PM spends 60% of their time on synthesis and communication that AI can dramatically accelerate. This stage maps where AI fits across your weekly PM rhythm.\n\nFour motions where AI helps most: synthesis, drafting, thinking partner, and memory and retrieval. Ten hours back every week — not by replacing your judgment, but by removing the work around it.',
  },
  {
    title: 'Stage 2: From Raw Data to Sharp Insight',
    content: 'Discovery is where PMs learn what is true. It is also where AI saves the most time — because synthesis is exactly what AI is built for.\n\nFour discovery motions: interview synthesis, feedback clustering, competitive intelligence, and the underused superpower — AI as a thinking partner. Each comes with a copy-ready prompt.',
  },
  {
    title: 'Stage 3: From Insight to Decision',
    content: 'Prioritisation is the hardest PM motion to get right. AI does not make the decision for you — it cannot know your engineering capacity, company politics, or strategic context.\n\nWhat it does: removes the tedious setup work and asks the questions you forgot to ask. RICE scoring, roadmap narratives, and assumption mapping — with prompts for each.',
  },
  {
    title: 'Stage 4: From Decision to Delivery',
    content: 'Communication is where PM time leaks most. Every standup, stakeholder update, retro, and sprint handoff produces documents that take longer than they should.\n\nAI makes every output faster and often makes it better. Stakeholder updates, sprint retros, kickoff briefs, and navigating difficult conversations — all covered.',
  },
  {
    title: 'Stage 5: Your 12-Prompt PM Playbook',
    content: 'These 12 prompts cover the core PM situations. Each one is copy-ready. Each has placeholders in amber for context you supply. Each notes the best tool for the job.\n\nBelow the playbook: the Context Document template — the single most valuable PM AI habit. Write it once, paste it at the start of every AI session.',
  },
]

const TIP_CONTENT = {
  0: 'The PMs who get the most from AI are not the ones who know the most prompts. They are the ones who have defined their context once: product, users, tech stack, team constraints. Write that context document. Paste it at the top of every AI session. Everything else follows.',
  1: 'The most important thing you can do before any AI synthesis session: remove PII. Replace all customer names with User A, User B. Replace company names with Company A. This takes 3 minutes and means you can use consumer Claude safely.',
  2: 'The assumption mapping prompt is the highest-leverage thing in this tutorial. Run it on your current roadmap commitment right now. The questions it surfaces are exactly the questions engineering and leadership will ask.',
  3: 'For the stakeholder update, invest the 5 minutes on the structured template every Friday. The template is what makes the AI draft good. Without structured input, you get structured fluff.',
  4: 'Most PMs use prompts as one-off shortcuts. The PMs who compound the most value use AI as a system: context document means every session starts informed, the playbook means consistent prompts, the retro reviews the prompts themselves. That is the loop worth building.',
}

/* ── Tool Chips per Stage ── */

const STAGE_TOOLS = [
  [
    { name: 'Claude', color: '#0EA5E9', desc: 'Thinking partner, synthesis, complex drafting, long context' },
    { name: 'ChatGPT', color: '#0EA5E9', desc: 'Quick drafts, brainstorm, image-to-deck, wide integrations' },
    { name: 'Notion AI', color: '#0EA5E9', desc: 'In-page synthesis, summaries, template generation' },
    { name: 'Linear AI', color: '#0EA5E9', desc: 'Auto-triage, ticket summaries, timeline prediction' },
    { name: 'GitHub Copilot', color: '#0EA5E9', desc: 'PR review summaries, technical feasibility' },
    { name: 'SuperWhisper', color: '#0EA5E9', desc: 'Voice to text, instant note capture in any app' },
    { name: 'Loom', color: '#0EA5E9', desc: 'Async video updates with AI transcription and summaries' },
  ],
  [
    { name: 'Claude', color: '#0EA5E9', desc: '200K token context window fits all transcripts at once' },
    { name: 'Claude Projects', color: '#0EA5E9', desc: 'Persistent context for ongoing PM research work' },
    { name: 'Notion AI', color: '#0EA5E9', desc: 'Store and evolve synthesis docs over time' },
    { name: 'Dovetail', color: '#0EA5E9', desc: 'User research repository with AI-powered tagging and clustering' },
    { name: 'Grain', color: '#0EA5E9', desc: 'AI call recording with auto-highlights and transcript search' },
    { name: 'Productboard', color: '#0EA5E9', desc: 'Customer feedback aggregation and prioritisation' },
    { name: 'Linear AI', color: '#0EA5E9', desc: 'Pre-organises backlog before synthesis' },
  ],
  [
    { name: 'Claude', color: '#0EA5E9', desc: 'Complex reasoning for prioritisation and roadmap narrative' },
    { name: 'Linear AI', color: '#0EA5E9', desc: 'Timeline prediction and sprint velocity analysis' },
    { name: 'Jira', color: '#0EA5E9', desc: 'Issue tracking with AI-powered sprint planning' },
    { name: 'Productboard', color: '#0EA5E9', desc: 'Feature scoring and roadmap alignment' },
    { name: 'GitHub Copilot', color: '#0EA5E9', desc: 'PR summaries, technical feasibility questions' },
    { name: 'Coda AI', color: '#0EA5E9', desc: 'AI-powered docs for planning tables and prioritisation' },
    { name: 'Miro AI', color: '#0EA5E9', desc: 'Visual brainstorming and collaborative mapping' },
  ],
  [
    { name: 'Claude', color: '#0EA5E9', desc: 'Stakeholder messages, difficult conversations, retro synthesis' },
    { name: 'Notion AI', color: '#0EA5E9', desc: 'In-page summaries and template-to-prose conversion' },
    { name: 'Linear AI', color: '#0EA5E9', desc: 'Sprint ticket summaries and team velocity' },
    { name: 'Loom', color: '#0EA5E9', desc: 'Async video updates that replace status meetings' },
    { name: 'Slack', color: '#0EA5E9', desc: 'Team communication with AI-powered summaries and threads' },
    { name: 'Gamma', color: '#0EA5E9', desc: 'AI-generated presentations from structured briefs' },
  ],
  [
    { name: 'Claude', color: '#0EA5E9', desc: 'Best for complex synthesis and thinking partner' },
    { name: 'Claude Projects', color: '#0EA5E9', desc: 'Persistent context for every PM session' },
    { name: 'Notion AI', color: '#0EA5E9', desc: 'Best for in-workspace summaries and templates' },
    { name: 'Linear AI', color: '#0EA5E9', desc: 'Best for engineering-context sprint work' },
    { name: 'ChatGPT', color: '#0EA5E9', desc: 'Quick iteration, GPT-4o vision for mockup review' },
    { name: 'Raycast AI', color: '#0EA5E9', desc: 'Quick prompt access from anywhere on your Mac' },
  ],
]

/* ── Shared Prompt Card ── */

function PromptCard({ text }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  function handleCopy() {
    const plain = text.replace(/\[([^\]]+)\]/g, '[$1]')
    navigator.clipboard.writeText(plain).catch(() => {})
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const parts = text.split(/(\[[^\]]+\])/g)

  return (
    <div className="aipw-prompt-card">
      <button className="aipw-copy-btn" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
      {parts.map((part, i) =>
        part.startsWith('[') && part.endsWith(']')
          ? <span key={i} className="aipw-placeholder">{part}</span>
          : <span key={i}>{part}</span>
      )}
    </div>
  )
}

/* ── PM Week View ── */

function PMWeekView({ stage }) {
  const activeNodes = getActiveNodes(stage)
  const [pulseIndex, setPulseIndex] = useState(-1)
  const timersRef = useRef([])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setPulseIndex(-1)

    if (stage !== 0) return

    const allNodes = WEEK_DAYS.flatMap(d => d.nodes.map(n => n.id))
    let idx = 0
    function cycle() {
      if (idx >= allNodes.length * 2) {
        setPulseIndex(-1)
        return
      }
      setPulseIndex(idx % allNodes.length)
      idx++
      timersRef.current.push(setTimeout(cycle, 400))
    }
    timersRef.current.push(setTimeout(cycle, 600))

    return () => timersRef.current.forEach(clearTimeout)
  }, [stage])

  const allNodeIds = WEEK_DAYS.flatMap(d => d.nodes.map(n => n.id))

  function isNodeActive(nodeId) {
    if (stage === 0) return pulseIndex >= 0 && allNodeIds[pulseIndex] === nodeId
    return activeNodes.includes(nodeId)
  }

  return (
    <div className="aipw-week-view">
      <div className="aipw-week-grid">
        {WEEK_DAYS.map(day => (
          <div key={day.label} className="aipw-day">
            <div className="aipw-day-label">{day.label}</div>
            <div className="aipw-day-nodes">
              {day.nodes.map(node => {
                const active = isNodeActive(node.id)
                return (
                  <div key={node.id} className={`aipw-node-wrap${active ? ' aipw-node-wrap--active' : ''}`}>
                    <div className={`aipw-node${active ? ' aipw-node--active' : ''}`}>
                      {node.label}
                    </div>
                    <div className="aipw-tool-badge">{node.tool}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Stage 0: The AI-Native PM Week ── */

function Stage0Content({ onSwitchTab }) {
  return (
    <div className="aipw-info-content">
      <div className="aipw-relation-note">
        <span>This tutorial focuses on operational workflows — how AI runs your daily PM rhythm. For PRDs, feature specs, and product thinking, see </span>
        <button className="aipw-relation-link" onClick={() => onSwitchTab('ai-native-pm')}>AI-Native PM</button>
      </div>

      <h3 className="aipw-section-heading">The Before and After</h3>
      <div className="aipw-comparison">
        <div className="aipw-comp-panel">
          <div className="aipw-comp-badge aipw-badge-without">Before AI</div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Monday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '70%' }} /></div><span className="aipw-timeline-dur">Triage + standup</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Tuesday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '85%' }} /></div><span className="aipw-timeline-dur">3 interviews</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Wednesday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '90%' }} /></div><span className="aipw-timeline-dur">Manual synthesis</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Thursday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '75%' }} /></div><span className="aipw-timeline-dur">Deck + update</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Friday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '65%' }} /></div><span className="aipw-timeline-dur">Retro + write-up</span></div>
          <div className="aipw-comp-total">~14 hours on synthesis and communication</div>
        </div>
        <div className="aipw-comp-panel">
          <div className="aipw-comp-badge aipw-badge-with">With AI</div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Monday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '30%' }} /></div><span className="aipw-timeline-dur">Auto-briefing</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Tuesday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '50%' }} /></div><span className="aipw-timeline-dur">Interviews + AI synth</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Wednesday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '35%' }} /></div><span className="aipw-timeline-dur">AI-scored roadmap</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Thursday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '25%' }} /></div><span className="aipw-timeline-dur">8-min draft</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Friday</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '30%' }} /></div><span className="aipw-timeline-dur">Pre-surfaced themes</span></div>
          <div className="aipw-comp-total">~4 hours — 10 hours back</div>
        </div>
      </div>

      <div className="aipw-takeaway">
        <p>The 10 hours you get back go to: more user conversations, deeper strategic thinking, better engineering relationships, and actual lunch breaks.</p>
        <p><strong>This is not about replacing PM judgment.</strong> It is about removing the work around your judgment so more of your time goes to the decisions only you can make.</p>
      </div>

      <div className="aipw-section-divider" />
      <h3 className="aipw-section-heading">The Four PM Motions Where AI Helps Most</h3>
      <div className="aipw-motions-grid">
        {[
          { num: 1, name: 'Synthesis', desc: 'Turning raw inputs (interviews, feedback, tickets, data) into organised insight. AI is extremely good at pattern recognition across large volumes of text.', judgment: 'You decide which insights are strategically important.' },
          { num: 2, name: 'Drafting', desc: 'Producing first versions of docs, updates, briefs, and messages. AI generates structured drafts fast.', judgment: 'You decide what the document needs to accomplish.' },
          { num: 3, name: 'Thinking Partner', desc: 'Stress-testing ideas, playing devil\'s advocate, exploring second-order consequences. AI asks questions your colleagues are too polite to ask.', judgment: 'You still own the decision and its consequences.' },
          { num: 4, name: 'Memory and Retrieval', desc: 'Surfacing relevant context from past decisions, tickets, and discussions. Claude Projects, Notion AI, Linear AI all do this differently.', judgment: 'You decide what context is actually relevant.' },
        ].map(m => (
          <div key={m.num} className="aipw-motion-card">
            <div className="aipw-motion-num">{m.num}</div>
            <div className="aipw-motion-name">{m.name}</div>
            <div className="aipw-motion-desc">{m.desc}</div>
            <div className="aipw-motion-judgment">{m.judgment}</div>
          </div>
        ))}
      </div>

      <div className="aipw-section-divider" />
      <h3 className="aipw-section-heading">The Tools in This Tutorial</h3>
      <div className="aipw-tool-stack">
        <div className="aipw-tool-row"><span className="aipw-tool-cat">General AI</span><div className="aipw-tool-pills"><span className="aipw-tool-pill">Claude</span><span className="aipw-tool-pill">ChatGPT</span></div></div>
        <div className="aipw-tool-row"><span className="aipw-tool-cat">Workspace AI</span><div className="aipw-tool-pills"><span className="aipw-tool-pill">Notion AI</span><span className="aipw-tool-pill">Confluence AI</span></div></div>
        <div className="aipw-tool-row"><span className="aipw-tool-cat">Engineering</span><div className="aipw-tool-pills"><span className="aipw-tool-pill">Linear AI</span><span className="aipw-tool-pill">GitHub Copilot</span></div></div>
        <div className="aipw-tool-row"><span className="aipw-tool-cat">Voice</span><div className="aipw-tool-pills"><span className="aipw-tool-pill">SuperWhisper</span></div></div>
      </div>

      <div className="aipw-privacy-box">
        <strong>A note on data privacy:</strong> Never paste customer PII, unreleased roadmap details, or NDA-covered content into consumer AI tools. Use enterprise versions (Claude Team/Enterprise, ChatGPT Enterprise) for sensitive work, or keep sensitive synthesis in tools that stay on your infrastructure.
      </div>
    </div>
  )
}

/* ── Stage 1: Discovery and Synthesis ── */

const DISCOVERY_PROMPTS = [
  {
    title: 'User Interview Synthesis',
    text: `You are analysing user interview transcripts for [product name], a [brief description]. The interviews were about [topic/question].

Here are [N] transcripts: [paste]

Please:
1. Identify the top 5 jobs-to-be-done (JTBD) mentioned across all interviews
2. For each JTBD, list the pain points and workarounds users described
3. Note any surprising quotes that deserve further investigation
4. Flag assumptions we should validate
5. Suggest 3 follow-up questions for the next round of interviews

Format: one section per JTBD.`,
  },
  {
    title: 'Feedback Clustering',
    text: `Here are [N] pieces of customer feedback for [product name] from the past [period].

Feedback: [paste]

Please:
1. Cluster by theme (max 8 themes)
2. For each theme, count frequency and rate urgency (Critical/High/Medium/Low)
3. Surface the 3 most actionable insights
4. Identify any feedback that signals users are about to churn
5. Note anything that contradicts our current product assumptions

Format: theme table, then detailed breakdown, then top 3 insights.`,
  },
  {
    title: 'Competitive Intelligence',
    text: `I am a PM at [your company]. We make [brief description]. Our target users are [description].

I need a competitive analysis of [competitor A], [competitor B], [competitor C] focused on:
- How they handle [specific feature area]
- Their pricing model and what it signals
- What their recent product updates suggest about their strategic direction
- Where users complain about each of them (this is our opportunity)

Based on publicly available information. Flag anything you are uncertain about.`,
  },
  {
    title: 'Thinking Partner',
    text: `I want to think through [problem]. Here is the context: [2-3 paragraphs about the product, users, and the specific decision I face].

Please do not give me an answer. Instead, ask me the 5 questions a sharp senior PM would ask me to pressure-test my thinking.`,
  },
]

function Stage1Content() {
  return (
    <div className="aipw-info-content">
      {DISCOVERY_PROMPTS.map((p, i) => (
        <div key={i} className="aipw-motion">
          <div className="aipw-motion-title">Motion {i + 1} &mdash; {p.title}</div>
          <PromptCard text={p.text} />
        </div>
      ))}

      <h3 className="aipw-section-heading">Discovery Without AI vs With AI</h3>
      <div className="aipw-comparison">
        <div className="aipw-comp-panel">
          <div className="aipw-comp-badge aipw-badge-without">Without AI</div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 1</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '60%' }} /></div><span className="aipw-timeline-dur">Interviews</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 2</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '90%' }} /></div><span className="aipw-timeline-dur">Manual coding</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 3</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '85%' }} /></div><span className="aipw-timeline-dur">Clustering</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 4</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '75%' }} /></div><span className="aipw-timeline-dur">Writing up</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 5</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-amber" style={{ width: '50%' }} /></div><span className="aipw-timeline-dur">Presenting</span></div>
          <div className="aipw-comp-total">Total: 5 days</div>
        </div>
        <div className="aipw-comp-panel">
          <div className="aipw-comp-badge aipw-badge-with">With AI</div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 1</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '60%' }} /></div><span className="aipw-timeline-dur">Interviews</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 1 PM</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '30%' }} /></div><span className="aipw-timeline-dur">Paste + prompt</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 2</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '40%' }} /></div><span className="aipw-timeline-dur">Review + validate</span></div>
          <div className="aipw-timeline-row"><span className="aipw-timeline-day">Day 2 PM</span><div className="aipw-bar-track"><div className="aipw-bar-fill aipw-bar-green" style={{ width: '20%' }} /></div><span className="aipw-timeline-dur">Insights ready</span></div>
          <div className="aipw-comp-total">Total: 1.5 days</div>
        </div>
      </div>
    </div>
  )
}

/* ── Stage 2: Planning and Prioritisation ── */

const PLANNING_PROMPTS = [
  {
    title: 'RICE Scoring with Context',
    text: `Score these [N] features using RICE.

Our definitions:
- Reach: number of users affected per month (1=<100, 2=100-1K, 3=1K-10K, 4=10K+)
- Impact: 0.25=minimal, 0.5=low, 1=medium, 2=high, 3=massive
- Confidence: % confidence in estimates
- Effort: person-weeks for full build

Features:
1. [Feature name]: [1-2 sentence description, include what we know about user demand and engineering complexity]
...[N]. [same format]

For each feature:
1. Suggest RICE component values with your reasoning
2. Flag where my assumptions might be wrong
3. Identify which features are most sensitive to estimation error
4. Group by strategic theme

Final output: scored table + strategic groupings + top 3 recommendations.`,
  },
  {
    title: 'Roadmap Narrative',
    text: `Here is our roadmap for Q[N]:
[list of features with one-line descriptions]

Our strategic goal for the quarter: [one paragraph]
Our primary users are: [one paragraph]
Our biggest competitor moves this year: [brief summary]

Please write a roadmap narrative that:
1. Opens with the strategic problem we are solving
2. Groups features into 2-3 themes
3. Explains why THIS order makes sense
4. Acknowledges what we are NOT doing and why
5. Closes with what success looks like

Audience: Engineering leads and a sceptical VP of Sales.
Tone: Direct. No filler. Confident. Length: 4 paragraphs max.`,
  },
  {
    title: 'Assumption Mapping',
    text: `Here is the bet we are making:
[describe the product decision or roadmap commitment in 2-3 paragraphs]

Act as a sceptical but constructive senior PM. Your job is to:
1. List the 8 assumptions we are making (order by: if this is wrong, we fail)
2. For the top 3 riskiest assumptions, suggest a low-cost way to test each
3. Identify what evidence would make you INCREASE confidence in this bet
4. Ask the one question we have not asked that we should`,
  },
]

function RoadmapScorer() {
  return (
    <div className="aipw-scorer">
      <div className="aipw-scorer-disclaimer">Example output — real scores require your actual context</div>
      <table className="aipw-scorer-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Reach</th>
            <th>Impact</th>
            <th>Confidence</th>
            <th>Effort</th>
            <th>RICE</th>
            <th>Uncertainty</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Bulk CSV import</td>
            <td>3</td>
            <td>2</td>
            <td>70%</td>
            <td>4w</td>
            <td>105</td>
            <td><span className="aipw-uncertainty aipw-uncertainty-high">High confidence</span></td>
          </tr>
          <tr>
            <td>Dark mode</td>
            <td>4</td>
            <td>0.5</td>
            <td>85%</td>
            <td>2w</td>
            <td>85</td>
            <td><span className="aipw-uncertainty aipw-uncertainty-high">Low effort risk</span></td>
          </tr>
          <tr>
            <td>Slack notifications</td>
            <td>3</td>
            <td>1</td>
            <td>65%</td>
            <td>3w</td>
            <td>65</td>
            <td><span className="aipw-uncertainty aipw-uncertainty-uncertain">Demand uncertain</span></td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
        RICE scores are a starting point for conversation, not a final answer. The real value: they force you to articulate your assumptions clearly.
      </p>
    </div>
  )
}

function Stage2Content() {
  return (
    <div className="aipw-info-content">
      {PLANNING_PROMPTS.map((p, i) => (
        <div key={i} className="aipw-motion">
          <div className="aipw-motion-title">Motion {i + 1} &mdash; {p.title}</div>
          <PromptCard text={p.text} />
        </div>
      ))}

      <div className="aipw-motion">
        <div className="aipw-motion-title">Linear AI &mdash; What It Actually Does</div>
        <p>Linear is the engineering project tracker most modern product teams use. Its AI features are genuinely useful:</p>
        <div className="aipw-feature-list">
          {[
            { name: 'Auto-triage', desc: 'New tickets automatically labelled and assigned based on content' },
            { name: 'Timeline prediction', desc: 'Analyses past sprint velocity to predict realistic completion dates' },
            { name: 'Ticket summaries', desc: 'Generates readable summaries of what the team shipped' },
            { name: 'Issue clustering', desc: 'Surfaces tickets with similar themes' },
          ].map(f => (
            <div key={f.name} className="aipw-feature-item">
              <div className="aipw-feature-name">{f.name}</div>
              <div className="aipw-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
        <div className="aipw-takeaway" style={{ marginTop: 16 }}>
          <p>Linear AI knows YOUR data. Claude knows the world. Use both. Ask Linear for context. Ask Claude for judgment about what to do with it.</p>
        </div>
      </div>

      <h3>Example RICE Output</h3>
      <RoadmapScorer />
    </div>
  )
}

/* ── Stage 3: Communication and Execution ── */

const COMMUNICATION_PROMPTS = [
  {
    title: 'Weekly Stakeholder Update',
    text: `Here is my product update data for the week of [date]:

[paste your Notion template content]

Please write a stakeholder update email that:
1. Opens with the most important thing that happened (not a list — one sentence)
2. Summarises shipped work in 3 bullet points max. Numbers where possible.
3. States blockers clearly with what decision is needed and from whom
4. Closes with a clear "next week" statement

Audience: VP Product, CPO, and Eng Lead. They are busy and slightly skeptical.
Tone: Confident, not defensive. Direct.
No PM jargon (no "learnings", "unblocking", "alignment", "synergies").
Length: under 200 words.`,
  },
  {
    title: 'Pre-Retro Synthesis',
    text: `Here are the sprint retro inputs from a team of [N] engineers and designers:

[paste raw inputs]

Please:
1. Group by theme (max 5 themes)
2. Count how many people mentioned each theme
3. Identify the single most important pattern across all inputs
4. Surface any input that appears to be about a systemic issue (not just this sprint)
5. Suggest 3 specific, actionable retro discussion questions`,
  },
  {
    title: 'Sprint Kickoff Brief',
    text: `Here are the tickets in Sprint [N]:
[paste Linear ticket titles and descriptions]

Our goal for this sprint: [one sentence]

Please write a sprint kickoff brief (for engineers, not stakeholders) that:
1. States the sprint goal in plain language
2. Groups tickets into 2-3 logical work streams
3. For each work stream, explains the user problem it solves (not the feature)
4. Flags any ticket that lacks enough context to build correctly
5. Lists questions engineering should answer in the first 2 days before assumptions get baked into code

Format: 1 page. Engineers will read this in the standup on Monday morning.`,
  },
  {
    title: 'Difficult Conversations',
    text: `I need to decline a feature request from our [role]. Context:

The request: [describe the feature]
Why they want it: [their stated reason]
The real reason I am declining: [be honest — capacity? strategy? both?]
The risk of declining badly: [relationship? deal pipeline? team morale?]

Help me think through:
1. What question should I ask to understand their underlying need?
2. What could I offer instead?
3. How do I frame this as a strategic choice rather than a resource constraint?
4. What is the best case for BUILDING it that I should seriously consider before deciding?

Do not write the email yet. Help me think first.`,
  },
]

function NotionAIPanel() {
  const useCases = [
    { label: 'Summarise long meeting notes', example: 'Summarise this page in 5 bullets' },
    { label: 'Turn bullet points into prose', example: 'Turn these notes into a readable update' },
    { label: 'Generate first draft from template', example: 'Write a PRD for this feature: [bullets]' },
    { label: 'Q&A across your workspace', example: 'What did we decide about X last quarter?' },
    { label: 'Auto-fill database properties', example: 'Tagging, categorising, filling fields' },
  ]

  return (
    <div className="aipw-notion-panel">
      <div className="aipw-notion-title">Notion AI &mdash; What it does for PMs</div>
      {useCases.map((uc, i) => (
        <div key={i} className="aipw-notion-row">
          <CheckIcon size={14} color="#34C759" />
          <div>
            <strong>{uc.label}</strong>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{uc.example}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Stage3Content() {
  return (
    <div className="aipw-info-content">
      {COMMUNICATION_PROMPTS.map((p, i) => (
        <div key={i} className="aipw-motion">
          <div className="aipw-motion-title">Motion {i + 1} &mdash; {p.title}</div>
          {i === 3 && <p>One of the most useful and least discussed uses of AI for PMs. Not drafting the message — thinking through the situation first.</p>}
          <PromptCard text={p.text} />
        </div>
      ))}

      <NotionAIPanel />
    </div>
  )
}

/* ── Stage 4: The PM Prompt Playbook ── */

const PLAYBOOK = {
  Discovery: [
    {
      name: 'Interview Synthesis',
      tool: 'Claude',
      situation: 'You have 3+ interview transcripts and need structured insights fast.',
      prompt: `You are analysing [N] user interview transcripts for [product name]. Users are [target user description]. We interviewed about [topic].

Transcripts: [paste]

Extract:
1. Top 5 jobs-to-be-done with supporting quotes
2. Top 3 pain points per JTBD
3. Surprising moments worth investigating
4. Assumptions to validate next

Format: one section per JTBD.`,
      tip: 'Anonymise transcripts before pasting. Replace names with User A, User B.',
    },
    {
      name: 'Feedback Clustering',
      tool: 'Claude or Notion AI',
      situation: 'You have 20+ pieces of unstructured customer feedback.',
      prompt: `Here are [N] pieces of customer feedback for [product] from [time period].

Feedback: [paste]

1. Cluster by theme (max 8 themes)
2. Rate each theme: Critical/High/Medium/Low
3. Surface top 3 actionable insights
4. Flag anything suggesting churn risk
5. Identify what this feedback contradicts in our current thinking`,
      tip: '20 items minimum for reliable clustering. Below that, read it yourself.',
    },
    {
      name: "Devil's Advocate",
      tool: 'Claude',
      situation: 'You are about to commit to a product direction and want to stress-test it.',
      prompt: `Here is the bet we are making:
[2-3 paragraph description of the product decision or roadmap commitment]

Act as a sceptical senior PM.
1. List the 8 assumptions embedded in this bet, ordered by risk
2. Suggest a low-cost test for each of the top 3 riskiest assumptions
3. Ask the one question we have not asked that we should`,
      tip: 'Run this the day before a roadmap review. Be ready for every question.',
    },
  ],
  Planning: [
    {
      name: 'RICE Scoring',
      tool: 'Claude',
      situation: 'You have 5-10 features to prioritise and need a structured starting point.',
      prompt: `Score these [N] features using RICE.

Definitions:
Reach: [your scale]
Impact: [your scale]
Confidence: % confidence in estimates
Effort: person-weeks

Features:
1. [Name]: [description + demand signal + rough engineering complexity]
...[N]. [same format]

For each:
- Suggest RICE components with reasoning
- Flag where assumptions might be wrong
- Identify estimation-sensitive items

Output: scored table + top 3 strategic groupings.`,
      tip: 'RICE scores are a conversation starter. Use them to surface disagreements, not settle them.',
    },
    {
      name: 'Roadmap Narrative',
      tool: 'Claude',
      situation: 'You have a feature list but need to turn it into a story stakeholders believe.',
      prompt: `Q[N] roadmap: [feature list with one-line descriptions]

Strategic goal for the quarter: [paragraph]
Primary users: [paragraph]
Biggest competitor move this year: [brief summary]

Write a roadmap narrative:
1. Open with the strategic problem
2. Group features into 2-3 themes
3. Explain the ordering rationale
4. Address what we are NOT doing
5. State what success looks like

Audience: Engineering leads and sceptical VP Sales. Tone: Direct. No filler. 4 paragraphs max.`,
      tip: 'The "not doing" paragraph is what stakeholders actually want to see.',
    },
    {
      name: 'OKR Drafting',
      tool: 'Claude',
      situation: 'Quarterly planning is coming and you need a structured first draft.',
      prompt: `Our product area: [description]
Company goal for this quarter: [goal]
Our biggest problems to solve: [list]
What we shipped last quarter: [list]
What did not work last quarter: [brief]

Draft 1 Objective and 3 Key Results.

Each KR must:
- Be measurable (number and date)
- Be achievable but ambitious
- Represent a leading indicator where possible (not just shipped/not shipped)

Then: list 3 questions I should answer before finalising these OKRs.`,
      tip: 'The 3 questions are usually more valuable than the OKR draft itself.',
    },
  ],
  Communication: [
    {
      name: 'Stakeholder Update',
      tool: 'Notion AI or Claude',
      situation: 'Every Friday, or after a significant product event.',
      prompt: `Weekly product update data:
Shipped: [bullets with numbers]
In progress: [bullets with % complete]
Blocked: [what is blocked and what decision is needed and from whom]
Metrics: [key numbers this week vs last]
Next week: [planned work]

Write a stakeholder update email.
Open with the most important thing.
3 bullets max on shipped work.
State blockers with owner and ask.
Close with next week in one sentence.

Audience: VP Product + CPO + Eng Lead.
Under 200 words. No jargon.
Ban: "learnings", "unblocking", "alignment", "synergies", "bandwidth".`,
      tip: '5 minutes on the data bullets is what makes this output useful.',
    },
    {
      name: 'Retro Synthesis',
      tool: 'Claude',
      situation: 'You have raw retro inputs and want to walk into the meeting with themes visible.',
      prompt: `Sprint retro raw inputs from [N] team members:

What went well: [paste]
What slowed us down: [paste]
What to try next: [paste]

1. Group by theme (max 5)
2. Count mentions per theme
3. Identify any systemic issue (not just this sprint)
4. Suggest 3 retro discussion questions`,
      tip: 'Share themes at the START of retro, not the end. It changes the conversation.',
    },
    {
      name: 'Difficult Message',
      tool: 'Claude',
      situation: 'Declining a request, delivering bad news, or navigating a stakeholder conflict.',
      prompt: `I need to [decline a request / deliver bad news / push back] to [role].

Context:
What they want: [description]
Why they want it: [their view]
My position: [what I need to communicate]
The relationship risk: [describe]

Help me think through this BEFORE I write:
1. What question surfaces their real need?
2. What could I offer instead?
3. How do I frame this as strategy, not constraint?
4. What is the strongest case FOR doing it that I should consider?`,
      tip: 'Think first, draft later. This prompt helps you think.',
    },
  ],
  Technical: [
    {
      name: 'Sprint Kickoff Brief',
      tool: 'Claude or Notion AI',
      situation: 'Start of every sprint. Stops misaligned building before it starts.',
      prompt: `Sprint [N] tickets:
[paste Linear ticket titles + descriptions]

Sprint goal: [one sentence]

Write a sprint kickoff brief for engineers:
1. State the goal in plain language
2. Group tickets into 2-3 work streams
3. For each: explain the user problem, not the feature
4. Flag any ticket without enough context to build correctly
5. List 3 questions engineering should answer in the first 2 days

Format: 1 page. Read aloud in standup.`,
      tip: 'Flagged tickets are gold. Every flag is a costly misunderstanding avoided.',
    },
    {
      name: 'Technical Feasibility',
      tool: 'GitHub Copilot or Claude Code',
      situation: 'You have a feature idea and want to ask engineering an informed question.',
      prompt: `[Only for PMs with codebase access]

I want to understand the complexity of adding [feature description].

Looking at [relevant files or modules]:
1. Where would this feature touch the existing code?
2. What patterns already exist that we could extend vs build from scratch?
3. What are the likely technical risks?
4. What would a simple prototype require vs a production version?

I will use this to ask better questions in my engineering conversation, not to replace that conversation.`,
      tip: 'The goal is a better question, not an answer.',
    },
    {
      name: 'Prototype Brief',
      tool: 'Claude Code or Cursor',
      situation: 'You want a working prototype to test user reactions to behaviour.',
      prompt: `I am a PM, not an engineer. I need a prototype to test [hypothesis].

Feature description: [what you want to test, in user terms]
Success for this prototype: [what user behaviour you want to observe]
Tech constraints (if any): [or "none"]

Please:
1. Build the simplest version that tests the hypothesis
2. Do not add features I did not ask for
3. Note what you are NOT building and why
4. Tell me what to watch for in testing`,
      tip: 'A prototype that takes 2 hours and is shown to 3 users beats a 2-week build shown to no one.',
    },
  ],
}

const CONTEXT_TEMPLATE = `# My PM Context

## Product
[Product name] is [one sentence description].
We are a [stage: seed/growth/scale] company.
Primary users: [description]
Secondary users: [if any]
Business model: [one sentence]

## Strategy
Current quarter goal: [OKR or goal]
Biggest bets for the year: [list]
What we are NOT doing: [list]

## Team
Engineering: [team size + any constraints]
Design: [team size]
My stakeholders: [key people + their interests and concerns]

## Technical context
Tech stack: [brief]
Known constraints: [e.g., mobile-first, GDPR, legacy auth system]
Current technical debt: [brief]

## What good looks like
Our users succeed when: [description]
We know we are winning when: [metric]`

function PlaybookTabs() {
  const tabs = Object.keys(PLAYBOOK)
  const [activeTab, setActiveTab] = useState(tabs[0])
  const prompts = PLAYBOOK[activeTab]

  return (
    <div>
      <div className="aipw-playbook-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`aipw-pb-tab${activeTab === tab ? ' aipw-pb-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {prompts.map((p, i) => (
        <div key={`${activeTab}-${i}`} className="aipw-playbook-card">
          <div className="aipw-pb-header">
            <span className="aipw-pb-name">{p.name}</span>
            <span className="aipw-pb-tool">{p.tool}</span>
          </div>
          <div className="aipw-pb-situation">Use when: {p.situation}</div>
          <PromptCard text={p.prompt} />
          <div className="aipw-pb-tip">
            <TipIcon size={14} color="#eab308" />
            <span>{p.tip}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ContextTemplateCard() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  function handleCopy() {
    navigator.clipboard.writeText(CONTEXT_TEMPLATE).catch(() => {})
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const parts = CONTEXT_TEMPLATE.split(/(\[[^\]]+\])/g)

  return (
    <div style={{ position: 'relative' }}>
      <h3>The Context Document Template</h3>
      <p>The single most valuable PM AI habit. Create once, use everywhere. Paste at the start of any AI session.</p>
      <div className="aipw-context-template">
        <button className="aipw-copy-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {parts.map((part, i) =>
          part.startsWith('[') && part.endsWith(']')
            ? <span key={i} className="aipw-placeholder">{part}</span>
            : part.startsWith('#')
              ? <span key={i} className="aipw-ctx-heading">{part}</span>
              : <span key={i}>{part}</span>
        )}
      </div>
    </div>
  )
}

function Stage4Content() {
  return (
    <div className="aipw-info-content">
      <PlaybookTabs />

      <div className="aipw-section-divider" />

      <ContextTemplateCard />

      <div className="aipw-section-divider" />

      <p style={{ textAlign: 'center', fontWeight: 600, marginTop: '20px' }}>
        Your workflow changed the moment you decided to run it with AI. Start with one prompt from the playbook. This week.
      </p>
    </div>
  )
}

/* ── Toolkit for final screen ── */

const TOOLKIT = [
  { concept: 'Synthesis', when: 'Turning raw interview or feedback data into insight', phrase: 'Pattern recognition at volume', icon: <SearchIcon size={24} color="#0EA5E9" /> },
  { concept: 'Thinking Partner', when: 'Before committing to a product decision', phrase: 'Ask me 5 questions, not an answer', icon: <EyeIcon size={24} color="#0EA5E9" /> },
  { concept: 'RICE Scoring', when: 'Prioritising features with structured context', phrase: 'Starting point, not final answer', icon: <TargetIcon size={24} color="#0EA5E9" /> },
  { concept: 'Roadmap Narrative', when: 'Turning feature lists into strategic stories', phrase: 'Why this order, what we skip', icon: <FileIcon size={24} color="#0EA5E9" /> },
  { concept: 'Stakeholder Update', when: 'Every Friday, or after significant events', phrase: '5 min template, 8 min draft', icon: <TrendingUpIcon size={24} color="#0EA5E9" /> },
  { concept: 'Sprint Brief', when: 'Start of every sprint to prevent misalignment', phrase: 'Flag gaps before building starts', icon: <ShieldIcon size={24} color="#0EA5E9" /> },
  { concept: 'Context Document', when: 'Beginning of every AI session', phrase: 'Write once, paste everywhere', icon: <LayersIcon size={24} color="#0EA5E9" /> },
  { concept: 'Prompt Playbook', when: 'Any PM situation from discovery to delivery', phrase: '12 copy-ready prompts for real work', icon: <BookIcon size={24} color="#0EA5E9" /> },
]

/* ── Main Component ── */

function AIPMWorkflows({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('ai-pm-workflows', -1)
  const [maxStageReached, setMaxStageReached] = useState(() => Math.max(-1, stage))
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)
  const activeStepRef = useRef(null)

  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      let el = document.querySelector('.aipw-root')
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollTop > 0) el.scrollTo({ top: 0, behavior: 'smooth' })
        el = el.parentElement
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (activeStepRef.current) {
        const step = activeStepRef.current
        const stepper = step.closest('.how-stepper')
        if (stepper) {
          const left = stepper.scrollLeft + step.getBoundingClientRect().left - stepper.getBoundingClientRect().left - stepper.offsetWidth / 2 + step.offsetWidth / 2
          stepper.scrollTo({ left, behavior: 'smooth' })
        }
      }
    })
    return () => cancelAnimationFrame(rafId)
  }, [stage])

  useEffect(() => {
    if (stage === 1 && !dismissedTips.has('discovery') && !learnTip) {
      setLearnTip({ id: 'discovery', text: 'The "help me think first" format in the thinking partner section changes how you use AI entirely. Try it on your current hardest product decision before the next section. Ask AI for 5 questions a sharp senior PM would ask you. Do not ask for an answer yet.' })
    } else if (stage === 2 && !dismissedTips.has('planning') && !learnTip) {
      setLearnTip({ id: 'planning', text: 'Try the assumption mapping prompt on something real: paste your current roadmap commitment and ask AI to list the 8 embedded assumptions ordered by risk. The output will be imperfect but it will surface at least one assumption you had not explicitly named.' })
    } else if (stage === 4 && !dismissedTips.has('playbook') && !learnTip) {
      setLearnTip({ id: 'playbook', text: 'Start with the context document at the bottom of this stage before copying any prompts. The prompts produce generic output without context. The same prompts with a completed context document produce outputs specific to your product.' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips])

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
        markModuleComplete('ai-pm-workflows')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.aipw-root')
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

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setFading(false)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
  }

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips(prev => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  const vizComponents = {
    0: <Stage0Content onSwitchTab={onSwitchTab} />,
    1: <Stage1Content />,
    2: <Stage2Content />,
    3: <Stage3Content />,
    4: <Stage4Content />,
  }

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="ai-pm-workflows" size={48} style={{ color: '#0EA5E9' }} />}
        title="AI-Native PM Workflows"
        subtitle="Run Every PM Motion with AI"
        description={<>The average PM spends 60% of their time on synthesis and communication that AI can dramatically accelerate. This tutorial covers the full operational rhythm: how AI fits into discovery, planning, alignment, and execution &mdash; with real tools, real prompts, and a playbook you keep.</>}
        buttonText="Start the Week"
        onStart={() => {
          setStage(0)
          markModuleStarted('ai-pm-workflows')
        }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms aipw-root quiz-fade-in">
        <Quiz
          questions={aiPMWorkflowsQuiz}
          tabName="AI-Native PM Workflows"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="ai-pm-workflows"
        />
      </div>
    )
  }

  return (
    <div className={`how-llms aipw-root${fading ? ' how-fading' : ''}`}>
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>

      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to AI-Native PM Workflows</strong> &mdash; Five stages. First, a map of the AI-native PM week &mdash; where AI plugs in across your daily rhythm. Then three deep dives: discovery and synthesis, planning and prioritisation, and communication. We close with a full prompt playbook of 12 copy-ready prompts for real PM situations. No theory &mdash; all practice.
            <ol className="module-welcome-steps">
              <li>Map <strong>where AI fits</strong> in your weekly PM rhythm</li>
              <li>Learn <strong>discovery, planning, and communication</strong> motions with real prompts</li>
              <li>Walk away with a <strong>12-prompt playbook</strong> and a context document template</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper aipw-stepper">
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
                <PMWeekView stage={stage} />

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
                  <ToolChips tools={STAGE_TOOLS[stage] || []} />
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
                    <button className="how-gotit-btn" onClick={nextStage} style={{ background: '#0EA5E9' }}>
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
          <div className="how-final-celebration">Your PM Workflow Is Now AI-Native</div>

          <div className="pe-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your AI-Native PM Workflows Toolkit</div>
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
            <button className="how-secondary-btn" onClick={handleStartOver}>
              Start over
            </button>
          </div>
          <SuggestedModules currentModuleId="ai-pm-workflows" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default AIPMWorkflows
