# Module Details

Per-module documentation for AI Decoded. Referenced from CLAUDE.md.

---

## Playground Module (inline in App.jsx)

The Playground is an interactive AI chat with educational scaffolding to teach beginners how LLM parameters work.

### Entry Screen
- Title: "AI Playground", subtitle: "Your first conversation with AI"
- Description explains what the learner will discover (Temperature, Max Tokens, System Prompts)

### Welcome Banner
Numbered 3-step guide: (1) pick a suggestion, (2) change Temperature and resend, (3) try different System Prompts

### Sidebar Parameters
The sidebar is hidden while the entry screen is visible (`showSidebar = !showHome && activeTab === 'playground' && !showPlaygroundEntry`). It appears only after the user dismisses the entry screen. On desktop, the sidebar sits left of the chat via `.main-body-with-sidebar` (flex row). On mobile (< 768px), `.main-body-with-sidebar` switches to `flex-direction: column`, placing the sidebar below the header and above the chat content.

Each slider has a **mood label** (`<span className="slider-mood">`) below it that updates in real time:

| Parameter | Range | Default | Mood Labels |
|---|---|---|---|
| Temperature | 0–1.5 | 0.7 | Focused (0–0.3) / Balanced (0.31–0.8) / Creative (0.81–1.3) / Very creative (1.31–1.5) |
| Max Tokens | 100–2000 | 500 | Short (100–300) / Medium (301–700) / Long (701–1500) / Maximum (1501–2000) |
| Top-p | 0–1 | 1.0 | Narrow (0–0.5) / Focused (0.51–0.9) / Full range (0.91–1.0) |

Temperature is capped at 1.5 (not 2.0) — values above ~1.3 produce garbled output with no educational value.

### System Prompt Presets (5)
| Label | Prompt | Teaching purpose |
|---|---|---|
| Helpful Assistant | "You are a helpful assistant. Provide clear, concise answers." | Baseline |
| Pirate | "You are a pirate. Speak only in pirate language with 'arr' and nautical terms." | Dramatic personality shift |
| Teacher | "You are a patient teacher. Explain concepts step by step, using simple analogies." | Instructional formatting |
| Code Expert | "You are a senior software engineer. Give concise technical answers with code examples." | Domain expertise |
| Poet | "You are a poet. Respond to everything in rhyming verse." | Creative constraint |

### Suggestion Chips (4)
Designed for parameter experimentation: "Tell me a joke", "List 5 facts about the Moon", "Explain what an API is to a 10-year-old", "Write a short story about a robot"

### Progressive Learning Tips
Milestone-based tips (no auto-dismiss — user clicks X to close). Tracked via `dismissedTips` Set and `tempChanged` boolean. Max one visible at a time.

| Trigger | Tip |
|---|---|
| 1st AI response | "Try changing Temperature to 1.5 and send the same message" |
| 3rd response (if no system prompt set) | "Click Pirate and ask the same question" |
| 5th response (if temperature never changed) | "Slide Temperature to 0.1 or 1.5" |

All tips reset on "Start over". CSS: `.learn-tip` with flex layout, `.learn-tip-dismiss` SVG X button, `role="status" aria-live="polite"` for accessibility.

### Response Metadata
Each assistant message stores `meta: { model, temperature, tokens }` and displays it below the bubble:
```
gpt-4o-mini · temp 0.70 · 127 tokens
```
CSS: `.chat-meta` (11px, tertiary color, tabular-nums). Wrapped in `.chat-bubble-wrap` div that handles alignment and animation.

---

## Tokenizer Module (`src/Tokenizer.jsx`)

Interactive token visualizer using `gpt-tokenizer` (same BPE tokenizer as GPT-4/ChatGPT). Not stage-based — it's a tool with educational scaffolding.

### Entry Screen
- Title: "Token Visualizer", subtitle: "See how AI reads your text"
- Description explains what the learner will discover (tokens, token limits, real-time visualization)

### Welcome Banner
Numbered 3-step guide: (1) type text or pick a suggestion, (2) compare character count vs token count, (3) try different inputs to see the pattern

### Info Banner
Dismissable "What is a token?" section with 6 bullet points explaining token basics. Separate from welcome banner — can be dismissed independently.

### Suggestions (4)
Each teaches a tokenization concept:

| Text | Label | What it shows |
|---|---|---|
| "The quick brown fox jumps over the lazy dog" | Common words | ~1 token per word |
| "ChatGPT is an AI assistant built by OpenAI" | Proper nouns | Brand names split into pieces |
| "Supercalifragilisticexpialidocious" | Long rare word | Extreme splitting |
| "SELECT * FROM users WHERE id = 1" | Code syntax | Operators as tokens |

### Progressive Learning Tips
Milestone-based tips triggered by input count (tracks distinct inputs >= 5 chars). No auto-dismiss — user clicks X. Max one visible at a time. Tracked via `dismissedTips` Set and `inputCount` counter.

| Trigger | Tip |
|---|---|
| 1st input | "Look at the character-to-token ratio — try a rare word to see it change" |
| 2nd input | "Different inputs produce different token counts — this is why AI costs are token-based" |
| 4th input | "Try another language or code — tokenization works very differently" |

All tips reset on "Start over". CSS: reuses `.learn-tip` classes from Playground.

### Fun Facts
6 rotating facts (8s interval with fade transition). Supplemental content — always visible, just cycling.

### Bottom Actions
Standard `how-final-actions` pattern: "Test Your Knowledge" quiz button + "Start over" secondary button + `<SuggestedModules>`.

---

## Generation Module (`src/Generation.jsx`)

Interactive token-by-token generation visualizer. Shows real OpenAI API logprobs (top-5 candidates) and lets users build sentences manually or watch automatic streaming.

### Entry Screen
- Title: "Token Generation", subtitle: "Watch AI think, one word at a time"
- Description explains what the learner will discover (predictions, probability, temperature effects)

### Welcome Banner
Numbered 3-step guide: (1) click Manual to see predictions and pick tokens, (2) click Automatic for full-speed completion, (3) change Temperature and compare

### Top-k Card
Dismissable "What is Top-k sampling?" explanation. Covers Top-k, Temperature, and Top-p in plain language.

### Parameters
Temperature capped at 1.5 (consistent with Playground). Tracks `tempChanged` for learn tip trigger.

### Modes
- **Manual**: User clicks probability bars to pick tokens. Simulation mode auto-picks top token for up to 15 steps.
- **Automatic**: Streaming completion with real-time probability bar updates.

### Progressive Learning Tips
Milestone-based tips (no auto-dismiss). Tracked via `dismissedTips` Set, `manualPicks` counter, `hasUsedAuto` and `tempChanged` booleans.

| Trigger | Tip |
|---|---|
| 1st manual pick | "You just picked a token! Notice how probability bars change with each word" |
| After automatic mode | "That's how ChatGPT works — hundreds of token picks per second" |
| 3+ manual picks (temp not changed) | "Try Temperature at 0 vs 1.5 — watch probabilities spread out" |

CSS: reuses `.learn-tip` classes from Playground (old `.gen-learn-tip` removed).

### Bottom Actions
Standard `how-final-actions` pattern: "Test Your Knowledge" quiz button + "Start over" secondary button + `<SuggestedModules>`.

---

## How LLMs Work Module (`src/HowLLMsWork.jsx`)

Interactive 5-stage journey showing how an LLM processes a prompt end-to-end. Uses real OpenAI API calls for embeddings and generation. Stage-based with stepper navigation.

### Entry Screen
- Title: "How LLMs Work", subtitle: "Follow your words through the AI's brain"
- Description explains what the learner will discover (5 stages, tokens, embeddings, attention, generation)

### Stages
5 stages: Prompt → Tokenization → Embeddings → Attention → Generation. Stepper with clickable completed steps. Each stage has an info card with title, description, tip (yellow TipIcon), and ToolChips.

### Suggestions (4, with labels)

| Text | Label | What it shows |
|---|---|---|
| "The weather today is" | Common phrase | Standard tokenization |
| "AI is changing the world" | Abstract concept | Conceptual embedding relationships |
| "Once upon a time" | Storytelling | Creative generation |
| "Hello world" | Programming classic | Code-like tokenization |

### Progressive Learning Tips

| Trigger | Tip |
|---|---|
| Stage 1 complete (all tokens visible) | "Your text became X tokens! Common English averages ~4 chars per token" |
| Stage 2 ready (embeddings loaded) | "Those numbers are how the AI 'understands' meaning — similar contexts get similar numbers" |
| Stage 3 (attention visible) | "Thicker lines = stronger attention. The first word attends to many others" |
| Stage 4 done (generation complete) | "Every ChatGPT response goes through these exact 5 stages" |

---

## Model Training Module (`src/ModelTraining.jsx`)

Interactive 6-stage journey showing how AI models are built from raw data to deployment. Stage-based with stepper navigation. Rich animations at each stage (particle flow, cleaning pipeline, tokenization, loss curve canvas, SFT comparison, RLHF loop).

### Entry Screen
- Title: "How AI Models Are Built", subtitle: "From raw data to ChatGPT in 6 stages"

### Stages
6 stages: Data Collection → Data Cleaning → Tokenization → Pre-Training → Fine-Tuning → RLHF. Each stage has info card, animated visualization, and ToolChips.

### Progressive Learning Tips

| Trigger | Tip |
|---|---|
| Stage 0 (Data Collection) | "Watch the colored dots — each color is a different data source. AI learns from trillions of words" |
| Stage 1 (Data Cleaning) | "Only 40–60% of data survives cleaning — garbage in, garbage out" |
| Stage 3 (Pre-Training) | "Watch the loss curve drop — lower loss means better predictions. Costs millions of dollars" |
| Stage 5 (RLHF) | "This is what makes ChatGPT feel smart — human feedback teaches helpfulness" |

---

## Prompt Engineering Module (`src/PromptEngineering.jsx`)

Interactive 8-stage tutorial teaching prompt engineering techniques from basic to advanced. Each stage has explanation cards, animated visualizations, and live "Try It" sections where users can edit prompts and run them against the OpenAI API.

### Entry Screen
- Title: "Prompt Engineering", subtitle: "The skill that makes AI actually useful"

### Stages
8 stages: Zero-Shot → Few-Shot → Chain of Thought → Tree of Thoughts → Role Prompting → System Prompts → Prompt Chaining → Patterns. Each stage has explanation card, interactive visualization with Try It section, and ToolChips.

### Progressive Learning Tips

| Trigger | Tip |
|---|---|
| Stage 0 (Zero-Shot) | "Watch the side-by-side — specific prompts get better results. Try editing the prompt below!" |
| Stage 2 (Chain of Thought) | "'Think step by step' makes AI show reasoning — try it in the box below!" |
| Stage 4 (Role Prompting) | "Same question, different answers per role. Try the Role Library below." |
| Stage 6 (Prompt Chaining) | "Click 'Run this chain with real AI' to see step-by-step results." |

---

## Agentic AI Module (`src/AgenticAI.jsx`)

Interactive 8-stage tutorial covering AI agents — from chatbot vs agent comparison to the frontier of autonomous AI. Stage-based with stepper navigation. CSS prefix: `.aai-`. All interactive animations use `setTimeout` chains (not `setInterval`) to avoid closure bugs.

### Entry Screen
- Title: "Agentic AI", subtitle: "AI That Does, Not Just Says"
- Button text: "Meet the Agents"

### Stages
8 stages: What Are Agents? → Agent Loop → Tools → Memory → Multi-Agent → Build an Agent → Real Agents → The Frontier. Each stage has info card, animated visualization, ToolChips, and optional TipIcon tip.

### Stage Visualizations
- **Stage 0 (What Are Agents?)**: `ChatbotVsAgentViz` — side-by-side panels comparing chatbot (linear flow) vs agent (loop flow), autonomy spectrum bar with labeled markers
- **Stage 1 (Agent Loop)**: `AgentLoopViz` — 5-node loop animation (Perceive → Think → Act → Observe → Repeat), runs 3 loops then shows ReAct trace
- **Stage 2 (Tools)**: `ToolExplorerViz` — 6 clickable tool categories (Search, Compute, Comms, Files, APIs, Browser) with JSON-style tool call examples
- **Stage 3 (Memory)**: `MemoryViz` — 4 memory type cards (In-Context, External, Procedural, Episodic)
- **Stage 4 (Multi-Agent)**: `MultiAgentViz` — orchestrator + 5 specialist agent cards with "Run Team" animation (fan-out → working → collecting → done)
- **Stage 5 (Build an Agent)**: `BuildAgentViz` — 6-step interactive builder (Define Goal → Add LLM → Add Tools → Add Memory → System Prompt → Run It) with trace output
- **Stage 6 (Real Agents)**: `RealAgentsViz` — 8 real agent category cards revealed one at a time via "Show next" button
- **Stage 7 (The Frontier)**: `FrontierViz` — clickable timeline (2024–2027) + 3 starter project cards

### Animation Pattern
All animations use `setTimeout` chains with `timersRef = useRef([])` pattern:
```jsx
function clearTimers() {
  timersRef.current.forEach(clearTimeout)
  timersRef.current = []
}
// Each step captured directly in its own closure — no shared mutable counter
items.forEach((item, i) => {
  timersRef.current.push(setTimeout(() => {
    setState(item) // item captured by value, not by reference
  }, delay * (i + 1)))
})
```
Never use `setInterval` with mutable counters — React's batched state updates read closure variables lazily, causing off-by-one bugs where the first item is skipped.

### Progressive Learning Tips

| Trigger | Tip |
|---|---|
| Stage 0 (What Are Agents?) | "Look at the two panels above — same request, completely different behavior..." |
| Stage 1 (Agent Loop) | "Click 'Run Agent' to watch the loop in action..." |
| Stage 3 (Memory) | "Remember RAG from earlier? External memory for agents works exactly the same way..." |
| Stage 5 (Build an Agent) | "Walk through all 6 steps to build your agent..." |

### Dark Mode
Active/highlighted states use `#7c7aef` (lighter indigo) in dark mode for visibility against dark backgrounds. Multi-agent active cards and build step current indicators use `box-shadow: 0 0 0 1px #7c7aef` for extra contrast.

---

## Agent Teams Module (`src/AgentTeams.jsx`)

Interactive 5-stage tutorial covering Claude Code Agent Teams — multi-agent collaboration for complex coding tasks. Stage-based with stepper navigation. CSS prefix: `.at-`. Uses shared `TeamVisualiser` SVG component across all stages with animated message particles and a task board.

### Entry Screen
- Title: "Agent Teams", subtitle: "When One Agent Isn't Enough"
- Button text: "Meet the team"

### Stages
5 stages: The Ceiling → Architecture → First Team → Patterns → Rough Edges. Each stage has info cards, team visualiser SVG animation, and ToolChips with colored dots and descriptions.

### Stage Visualizations
- **Stage 0 (The Ceiling)**: Two-column comparison (solo vs team), shift block (Sequential→Parallel, One context→Many, Monologue→Collaboration), real failure mode example
- **Stage 1 (Architecture)**: `TeamVisualiser` with lead circle + 3 teammate circles, animated dashed connection lines, message particles, task board (foreignObject with Todo/Doing/Done columns)
- **Stage 2 (First Team)**: `TeamBuilderViz` — interactive builder with 3 steps: (1) choose pattern preset, (2) assign roles, (3) write system instructions. Generates copyable prompt. Pattern presets: Exploration, Layer Split, QA Swarm
- **Stage 3 (Patterns)**: Three tabbed patterns (Exploration, Layer Split, QA Swarm) with `TeamVisualiser` showing different connection/animation patterns per tab, plus `DecisionMatrix` SVG with quadrant labels and positioned dots
- **Stage 4 (Rough Edges)**: Two-column cards (limitations, when not to use), callout boxes

### Team Visualiser SVG
Shared `TeamVisualiser` component renders lead agent (large circle at top center) and 1-3 teammate circles (bottom row). Features:
- **Lead → Teammate lines**: Vector math offsets line endpoints by circle radius (leadR=29, tmR=23) so dashed lines touch circle borders, not pass through
- **Peer connections**: Adjacent-only pairs (T1↔T2, T2↔T3) to avoid lines crossing through intermediate nodes
- **Message particles**: `MessageParticle` component animates colored dots along connection paths using `requestAnimationFrame`
- **Task board**: `foreignObject` at (440, 20) with 175×280px HTML div showing Todo/Doing/Done columns
- **Active connections**: Each stage/tab highlights different sets of connections (`activeConnections` array)

### Team Builder (Stage 2)
Interactive 3-step builder:
1. **Choose pattern** — 3 preset buttons (Exploration, Layer Split, QA Swarm) with description shown below
2. **Assign roles** — editable text inputs for each teammate, team size buttons (2/3/4)
3. **Write instructions** — textarea for system prompt

Generates a copyable prompt preview (dark code block with copy button). Each step has a `.at-builder-step-hint` description explaining what to do.

### Decision Matrix (Stage 3)
SVG quadrant chart with axes: Complexity (Low→High) × Independence (Low→High). 4 quadrant labels, 4 positioned dots (Solo Agent, Layer Split, QA Swarm, Exploration). Helps students choose the right team pattern.

### Animation Pattern
Uses `setTimeout` chains with `timersRef = useRef([])` (same as AgenticAI). Stage 1 runs a multi-phase animation: lead delegates → teammates work → peer messages → tasks complete. Controlled by `play` state and `runAnimation` callback.

### Tool Chips
All 5 stages use `ToolChips` with `{ name, color, desc }` objects (~40 tools total). Colored dots indicate category, descriptions show on click/tap via tooltip popup.

### Dark Mode
Uses standard CSS variable overrides. Builder inputs, role inputs, and prompt preview have dark-mode-specific border/background. Active pattern buttons use indigo (`#5856D6`) borders in both modes.

---

## AI Coding Tools Module (`src/AICodingTools.jsx`)

Interactive 4-stage tutorial covering the AI coding tools landscape — three categories, eight tool profiles, a recommendation quiz, and shared concepts. Stage-based with stepper navigation. CSS prefix: `.act-`. Uses subgrid for cross-card alignment in the category stage.

### Entry Screen
- Title: "AI Coding Tools", subtitle: "The Market, the Players, Your Pick"
- Button text: "Explore the Market"

### Stages
4 stages: Categories → The Tools → Find Yours → Shared DNA. Each stage has info cards, ToolChips, and stage-specific interactive elements.

### Stage Visualizations
- **Stage 0 (Categories)**: Three category cards using CSS `subgrid` with `grid-row: span 7` — AI Extensions (Copilot, Cline, Continue.dev), AI-Native IDEs (Cursor, Windsurf, Kiro, VS Code), Terminal Agents (Claude Code, Codex CLI). Each card has icon, label, tagline, description, tool pills, trade-offs, and best-if sections
- **Stage 1 (The Tools)**: 8 expandable tool profile cards with click-to-expand accordion (`act-expandDown` animation). Each profile has: name, category badge, price, free-tier indicator, intro, "what makes it different", "best for" list, good/not-good trade-offs, and standout feature. Tools: GitHub Copilot, Cursor, Windsurf, Kiro, Cline, Claude Code, Continue.dev, VS Code
- **Stage 2 (Find Yours)**: 4-question recommendation quiz with fade transitions between questions. Scoring weights per tool, computes top match with explanation. Shows result card with "See why" expandable reasoning. Tools scored: Cursor, GitHub Copilot, Claude Code, Cline, Windsurf
- **Stage 3 (Shared DNA)**: Fluency ladder — 6 clickable concept steps (Context Window, Conventions File, MCP, Agentic Loop, Review Gates) with expandable detail panels showing cross-tool examples

### Tool Profiles (8)
| Tool | Category | Price |
|---|---|---|
| GitHub Copilot | AI Extension | Free / $10/mo / $19/mo |
| Cursor | AI-Native IDE | Free (limited) / $20/mo / $60/mo |
| Windsurf | AI-Native IDE | Free tier / $15/mo |
| Kiro | AI-Native IDE | Free (50 credits/mo) / $20/mo |
| Cline | AI Extension | Free (open source) + API cost |
| Claude Code | Terminal Agent | $20/mo / $100/mo / API |
| Continue.dev | AI Extension | Free (open source) + API cost |
| VS Code | AI-Native IDE | Free |

### CSS Patterns
- Category cards use CSS `subgrid` with `grid-row: span 7` for cross-card alignment (7 children: icon, label, tagline, desc, tools, tradeoffs, bestif)
- Tool profile cards use `act-expandDown` keyframe animation (`max-height: 0 → 600px`) for accordion expand
- Finder quiz uses `act-quiz-fading` opacity transition between questions
- Fluency ladder detail panels use `act-ladder-detail` with `min-width: 220px`, `max-width: 280px`
- Statistics badges row (`.act-stats-row`) with 4 metric cards

### Dark Mode
Uses standard CSS variable overrides. Category cards, tool profiles, finder quiz, and ladder detail panels have dark-mode-specific border/background overrides. Answer hover state uses `rgba(52, 199, 89, 0.08)` in dark mode.
