# AI Decoded — LLM Playground

Interactive React app for learning how Large Language Models work.

## Architecture

- **Framework**: React + Vite
- **API**: OpenAI (Chat Completions, Embeddings) via server-side proxy (`/api/chat.js`, `/api/embeddings.js`)
- **API Proxy**: Vercel Edge Runtime functions in `/api/` — frontend calls `/api/chat` and `/api/embeddings`, proxy adds `OPENAI_API_KEY` server-side
- **Auth**: Supabase Auth (Google OAuth + email/password) with PostgreSQL progress tracking
- **Styling**: Per-module CSS files, CSS variables for theming (light/dark)
- **State**: React useState/useEffect, AuthContext for auth/progress state
- **Icons**: SVG-only (no emojis anywhere in UI). Two icon systems: `ContentIcons.jsx` and `ModuleIcon.jsx`
- **Font Stack**: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif`

## Module Inventory

| Tab ID | Component | CSS | Quiz | Tag | Tag Color |
|---|---|---|---|---|---|
| `playground` | App.jsx (inline) | App.css | — | Interactive | #0071E3 |
| `tokenizer` | Tokenizer.jsx | App.css | tokenizerQuiz | Visual | #AF52DE |
| `generation` | Generation.jsx | App.css | generationQuiz | Interactive | #0071E3 |
| `how-llms-work` | HowLLMsWork.jsx | App.css | howLLMsWorkQuiz | Journey | #FF9500 |
| `model-training` | ModelTraining.jsx | App.css | modelTrainingQuiz | Journey | #FF9500 |
| `prompt-engineering` | PromptEngineering.jsx | App.css | promptEngineeringQuiz | Practical | #34C759 |
| `context-engineering` | ContextEngineering.jsx | ContextEngineering.css | contextEngineeringQuiz | Practical | #34C759 |
| `rag` | RAG.jsx | RAG.css | ragQuiz | Journey | #FF9500 |
| `agentic-ai` | AgenticAI.jsx | AgenticAI.css | agenticAIQuiz | Technical | #5856D6 |
| `machine-learning` | MachineLearning.jsx | MachineLearning.css | machineLearningQuiz | Technical | #5856D6 |
| `deep-learning` | DeepLearning.jsx | DeepLearning.css | deepLearningQuiz | Technical | #5856D6 |
| `fine-tuning` | FineTuning.jsx | FineTuning.css | fineTuningQuiz | Technical | #5856D6 |
| `ai-city-builder` | AICityBuilder.jsx | AICityBuilder.css | — (game) | Game | #F59E0B |
| `ai-lab-explorer` | AILabExplorer.jsx | AILabExplorer.css | — (game) | Game | #F59E0B |
| `prompt-heist` | PromptHeist.jsx | PromptHeist.css | — (game) | Game | #F59E0B |
| `token-budget` | TokenBudget.jsx | TokenBudget.css | — (game) | Game | #F59E0B |
| `ai-ethics-tribunal` | AIEthicsTribunal.jsx | AIEthicsTribunal.css | — (game) | Game | #F59E0B |

## Color System — Two Color Layers

### Tag Colors (Primary — used for icons, borders, visual identity)

These 5 colors drive all icon coloring, HomeScreen card borders, EntryScreen icons, and landing page icons:

| Tag | Color | Modules |
|---|---|---|
| Interactive | #0071E3 (blue) | Playground, Generation |
| Visual | #AF52DE (purple) | Tokenizer |
| Journey | #FF9500 (orange) | How LLMs Work, Model Training, RAG |
| Practical | #34C759 (green) | Prompt Engineering, Context Engineering |
| Technical | #5856D6 (indigo) | Agentic AI, Machine Learning, Deep Learning, Fine-Tuning |
| Game | #F59E0B (amber/gold) | AI City Builder, AI Lab Explorer, Prompt Heist, Token Budget, AI Ethics Tribunal |

**Where tag colors are used:**
- HomeScreen card left borders + card icons: `FILTER_COLORS[card.tag]`
- EntryScreen ModuleIcon: `style={{ color: '<tag-color>' }}`
- LandingPage MOBILE_MODULES: `color: '<tag-color>'`
- NeuralNetworkCanvas uses GROUP_COLORS (separate 4-color system for nav groups)

### Navigation Group Colors

| Group | Color | Tabs |
|---|---|---|
| Tools | #0071E3 | Playground, Tokenizer, Generation |
| Foundations | #AF52DE | How LLMs Work, Model Training, Machine Learning, Deep Learning |
| Skills | #34C759 | Prompt Engineering, Context Engineering |
| Advanced | #FF9500 | RAG, Agentic AI |
| Play | #F59E0B | AI City Builder, AI Lab Explorer, Prompt Heist, Token Budget, AI Ethics Tribunal |

Used in: `NavDropdown.jsx`, `NeuralNetworkCanvas.jsx` (node rings)

### Icon Color Matching Rule

**Every SVG icon must match the color of its container:**
- Icon inside a card with colored left border → icon color = border color
- Icon inside a pipeline step with colored border → icon color = border color
- Icon inside a tag-labeled container → icon color = tag color
- Module icons (EntryScreen, HomeScreen, LandingPage) → tag color from table above
- Icons with semantic meaning keep their semantic color (CheckIcon=green, CrossIcon=red, TipIcon=yellow)

### CSS Variables (index.css)

**Light Theme**
| Variable | Value | Usage |
|---|---|---|
| `--bg-primary` | #ffffff | Page background |
| `--bg-secondary` | #f5f5f7 | Cards, sections |
| `--bg-surface` | #e9e9eb | Elevated surfaces |
| `--bg-card` | #ffffff | Card backgrounds |
| `--text-primary` | #1d1d1f | Headings, body |
| `--text-secondary` | #6e6e73 | Labels, hints |
| `--text-tertiary` | #86868b | Disabled, subtle |
| `--accent` | #0071e3 | Primary blue |
| `--accent-hover` | #0077ed | Blue hover |
| `--border` | #d2d2d7 | Standard borders |
| `--border-light` | #e8e8ed | Subtle borders |
| `--error` | #ff3b30 | Error states |
| `--shadow-sm` | 0 1px 3px rgba(0,0,0,0.04) | Cards |
| `--shadow-md` | 0 2px 12px rgba(0,0,0,0.08) | Dropdowns |
| `--shadow-lg` | 0 4px 24px rgba(0,0,0,0.1) | Modals |
| `--radius` | 12px | Default card radius |
| `--radius-lg` | 18px | Large cards |

**Dark Theme** (`[data-theme="dark"]`)
| Variable | Value |
|---|---|
| `--bg-primary` | #1C1917 |
| `--bg-secondary` | #292524 |
| `--text-primary` | #E8E3DD |
| `--text-secondary` | #A8A29E |
| `--border` | #44403C |
| `--border-light` | #292524 |
| `--error` | #ff453a |
| Shadows | Opacity increased to 0.3 |

### Semantic Colors (hardcoded)

| Color | Hex | Usage |
|---|---|---|
| Success green | #34C759 | Correct answers, check marks |
| Error red | #FF3B30 | Wrong answers, cross marks |
| Warning orange | #FF9500 | Caution, comparison panels |
| Tip yellow | #eab308 | Lightbulb tips (TipIcon always yellow) |
| Apple blue | #0071E3 | Primary accent, links, active states |

---

## Navigation Structure

Header uses grouped dropdown navigation (`NavDropdown.jsx` / `NavDropdown.css`):

- Desktop: `[Logo + AI Decoded]  [Tools] [Foundations] [Skills] [Advanced] [Play]  [dark mode toggle]`
- Mobile (< 768px): Hamburger menu with full-screen overlay
- Active tab's parent group label turns Apple blue (#0071E3)
- Breadcrumb shows `Group > Tab Name` on wider screens (>= 900px)

## Key Files

- `api/chat.js` — Vercel Edge Runtime proxy for OpenAI Chat Completions (streaming + non-streaming)
- `api/embeddings.js` — Vercel Edge Runtime proxy for OpenAI Embeddings
- `src/App.jsx` — Main router, sidebar, grouped header, playground chat
- `src/App.css` — Bulk of component styles + mobile responsive rules
- `src/index.css` — CSS variables (light/dark), global resets, base typography
- `src/ContentIcons.jsx` — SVG icon library (70+ icons, thin-stroke feather style)
- `src/ModuleIcon.jsx` — Module-specific SVG icons (chat, tokenizer, bolt, etc.)
- `src/ModuleIcon.css` — ModuleIcon color states (default, hover, active)
- `src/NavDropdown.jsx` — Grouped dropdown navigation component
- `src/HomeScreen.jsx` — Module card grid with filter tags and group labels
- `src/LandingPage.jsx` — Landing page with neural network canvas
- `src/NeuralNetworkCanvas.jsx` — Interactive node graph on landing page (force-directed layout, viewBox 960×600)
- `src/EntryScreen.jsx` — Reusable entry/intro screen for each module
- `src/Quiz.jsx` / `src/Quiz.css` — Reusable quiz component
- `src/quizData.js` — All quiz question banks
- `src/Tooltip.jsx` — Info tooltip component
- `src/FeedbackWidget.jsx` / `src/FeedbackWidget.css` — Feedback bubble + modal
- `src/AgenticAI.jsx` / `src/AgenticAI.css` — Agentic AI tutorial (agents, loops, tools, memory, multi-agent, building, real agents, frontier)
- `src/DeepLearning.jsx` / `src/DeepLearning.css` — Deep Learning tutorial (neurons, networks, backprop, CNN, transformers)
- `src/AICityBuilder.jsx` / `src/AICityBuilder.css` — AI City Builder game (detective cases, SVG city)
- `src/AILabExplorer.jsx` / `src/AILabExplorer.css` — AI Lab Explorer game (6-room lab, hands-on challenges)
- `src/PromptHeist.jsx` / `src/PromptHeist.css` — Prompt Heist game (5 heists, prompt engineering through gameplay)
- `src/TokenBudget.jsx` / `src/TokenBudget.css` — Token Budget game (5 levels, prompt compression/optimization)
- `src/AIEthicsTribunal.jsx` / `src/AIEthicsTribunal.css` — AI Ethics Tribunal game (6 cases, AI ethics dilemmas)
- `src/moduleData.js` — Shared ALL_MODULES array + getRandomModules helper
- `src/SuggestedModules.jsx` — Reusable "What to learn next" cards (used in final screens + quiz end)
- `src/usePersistedState.js` — Hook to persist module stage/entry state to sessionStorage for logged-in users
- `src/supabase.js` — Supabase client (null-safe, handles missing env vars)
- `src/AuthContext.jsx` — Auth provider: user state, progress, quiz results, module started/complete tracking
- `src/AuthModal.jsx` — Sign In/Sign Up modal (Google OAuth + email/password)
- `src/AuthModal.css` — Auth modal, avatar dropdown, progress badges, locked card styles

---

## Playground Module (inline in App.jsx)

The Playground is an interactive AI chat with educational scaffolding to teach beginners how LLM parameters work.

### Entry Screen
- Title: "AI Playground", subtitle: "Your first conversation with AI"
- Description explains what the learner will discover (Temperature, Max Tokens, System Prompts)

### Welcome Banner
Numbered 3-step guide: (1) pick a suggestion, (2) change Temperature and resend, (3) try different System Prompts

### Sidebar Parameters
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

### Welcome Banner
Numbered 3-step guide: (1) type a prompt or pick a suggestion, (2) watch text transform through 5 stages, (3) read info cards and tips at each stage

### Stages
5 stages: Prompt → Tokenization → Embeddings → Attention → Generation. Stepper with clickable completed steps. Each stage has an info card with title, description, tip (yellow TipIcon), and ToolChips.

### Suggestions (4, with labels)
Each teaches a different concept:

| Text | Label | What it shows |
|---|---|---|
| "The weather today is" | Common phrase | Standard tokenization |
| "AI is changing the world" | Abstract concept | Conceptual embedding relationships |
| "Once upon a time" | Storytelling | Creative generation |
| "Hello world" | Programming classic | Code-like tokenization |

### Progressive Learning Tips
Milestone-based tips triggered at stage completion. No auto-dismiss — user clicks X. Max one visible at a time. Tracked via `dismissedTips` Set with `fadeTimerRef` for cleanup.

| Trigger | Tip |
|---|---|
| Stage 1 complete (all tokens visible) | "Your text became X tokens! Common English averages ~4 chars per token" |
| Stage 2 ready (embeddings loaded) | "Those numbers are how the AI 'understands' meaning — similar contexts get similar numbers" |
| Stage 3 (attention visible) | "Thicker lines = stronger attention. The first word attends to many others" |
| Stage 4 done (generation complete) | "Every ChatGPT response goes through these exact 5 stages" |

All tips reset on "Start over". CSS: reuses `.learn-tip` classes from Playground.

### Bottom Actions
Standard `how-final-actions` pattern: "Test Your Knowledge" quiz button + "Start over" secondary button + `<SuggestedModules>`.

---

## Model Training Module (`src/ModelTraining.jsx`)

Interactive 6-stage journey showing how AI models are built from raw data to deployment. Stage-based with stepper navigation. Rich animations at each stage (particle flow, cleaning pipeline, tokenization, loss curve canvas, SFT comparison, RLHF loop).

### Entry Screen
- Title: "How AI Models Are Built", subtitle: "From raw data to ChatGPT in 6 stages"
- Description explains what the learner will discover (data collection, cleaning, training, human feedback)

### Welcome Banner
Numbered 3-step guide: (1) walk through 6 stages with animations, (2) read info cards at each stage, (3) check tools section for real-world tools

### Stages
6 stages: Data Collection → Data Cleaning → Tokenization → Pre-Training → Fine-Tuning → RLHF. Each stage has info card, animated visualization, and ToolChips.

### Progressive Learning Tips
Milestone-based tips triggered at key stages. No auto-dismiss — user clicks X. Max one visible at a time. Tracked via `dismissedTips` Set with `fadeTimerRef` for cleanup.

| Trigger | Tip |
|---|---|
| Stage 0 (Data Collection) | "Watch the colored dots — each color is a different data source. AI learns from trillions of words" |
| Stage 1 (Data Cleaning) | "Only 40–60% of data survives cleaning — garbage in, garbage out" |
| Stage 3 (Pre-Training) | "Watch the loss curve drop — lower loss means better predictions. Costs millions of dollars" |
| Stage 5 (RLHF) | "This is what makes ChatGPT feel smart — human feedback teaches helpfulness" |

All tips reset on "Start over". CSS: reuses `.learn-tip` classes from Playground.

### Bottom Actions
Standard `how-final-actions` pattern: "Test Your Knowledge" quiz button + "Start over" secondary button + `<SuggestedModules>`.

---

## Prompt Engineering Module (`src/PromptEngineering.jsx`)

Interactive 8-stage tutorial teaching prompt engineering techniques from basic to advanced. Each stage has explanation cards, animated visualizations, and live "Try It" sections where users can edit prompts and run them against the OpenAI API.

### Entry Screen
- Title: "Prompt Engineering", subtitle: "The skill that makes AI actually useful"
- Description explains what the learner will discover (8 techniques, live demos, expert-level answers)

### Welcome Banner
Numbered 3-step guide: (1) walk through 8 techniques that build on each other, (2) edit prompts and hit Run, (3) pay attention to before/after comparisons

### Stages
8 stages: Zero-Shot → Few-Shot → Chain of Thought → Tree of Thoughts → Role Prompting → System Prompts → Prompt Chaining → Patterns. Each stage has explanation card, interactive visualization with Try It section, and ToolChips.

### Progressive Learning Tips
Milestone-based tips triggered at key stages. No auto-dismiss — user clicks X. Max one visible at a time. Tracked via `dismissedTips` Set with `fadeTimerRef` for cleanup.

| Trigger | Tip |
|---|---|
| Stage 0 (Zero-Shot) | "Watch the side-by-side — specific prompts get better results. Try editing the prompt below!" |
| Stage 2 (Chain of Thought) | "'Think step by step' makes AI show reasoning — try it in the box below!" |
| Stage 4 (Role Prompting) | "Same question, different answers per role. Try the Role Library below." |
| Stage 6 (Prompt Chaining) | "Click 'Run this chain with real AI' to see step-by-step results." |

All tips reset on "Start over". CSS: reuses `.learn-tip` classes from Playground.

### Bottom Actions
Standard `how-final-actions` pattern: "Test Your Knowledge" quiz button + "Start over" secondary button + `<SuggestedModules>`.

---

## Agentic AI Module (`src/AgenticAI.jsx`)

Interactive 8-stage tutorial covering AI agents — from chatbot vs agent comparison to the frontier of autonomous AI. Stage-based with stepper navigation. CSS prefix: `.aai-`. All interactive animations use `setTimeout` chains (not `setInterval`) to avoid closure bugs.

### Entry Screen
- Title: "Agentic AI", subtitle: "AI That Does, Not Just Says"
- Description explains what the learner will discover (agents that book flights, write code, browse the web)
- Button text: "Meet the Agents"

### Welcome Banner
Numbered 3-step guide: (1) walk through 8 stages from chatbot basics to the frontier, (2) build an agent step by step, (3) see real agents in production today

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
Milestone-based tips triggered at key stages. No auto-dismiss — user clicks X. Max one visible at a time. Tracked via `dismissedTips` Set with `fadeTimerRef` for cleanup.

| Trigger | Tip |
|---|---|
| Stage 0 (What Are Agents?) | "Look at the two panels above — same request, completely different behavior..." |
| Stage 1 (Agent Loop) | "Click 'Run Agent' to watch the loop in action..." |
| Stage 3 (Memory) | "Remember RAG from earlier? External memory for agents works exactly the same way..." |
| Stage 5 (Build an Agent) | "Walk through all 6 steps to build your agent..." |

All tips reset on "Start over". CSS: reuses `.learn-tip` classes from Playground.

### Dark Mode
Active/highlighted states use `#7c7aef` (lighter indigo) in dark mode for visibility against dark backgrounds. Multi-agent active cards and build step current indicators use `box-shadow: 0 0 0 1px #7c7aef` for extra contrast.

### Bottom Actions
Standard `how-final-actions` pattern: "Test Your Knowledge" quiz button + "Start over" secondary button + `<SuggestedModules>`.

---

## Authentication & Progress

### Overview

- **Provider**: Supabase Auth (Google OAuth + email/password)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Free modules**: `playground`, `tokenizer`, `generation` — no login required
- **Locked modules**: All others dimmed with lock icon until user signs in
- **Env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (also accepts `SUPABASE_*` prefix for Vercel)

### Supabase Tables

```sql
-- User progress (completed modules)
create table progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  module_id text not null,
  completed_at timestamptz default now(),
  unique(user_id, module_id)
);

-- Quiz results
create table quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  module_id text not null,
  score integer not null,
  max_score integer not null,
  taken_at timestamptz default now()
);
```

### AuthContext API

| Export | Purpose |
|---|---|
| `AuthProvider` | Wraps app in `main.jsx`, provides auth state |
| `useAuth()` | Hook to access auth state and actions |
| `FREE_MODULES` | `['playground', 'tokenizer', 'generation']` |

**State**: `user`, `loading`, `progress`, `quizResults`, `completedCount`

**Actions**: `signInWithGoogle()`, `signInWithEmail(email, pw)`, `signUpWithEmail(email, pw, name)`, `signOut()`

**Progress**: `markModuleStarted(id)`, `markModuleComplete(id)`, `saveQuizResult(id, score, max)`

**Queries**: `isModuleLocked(id)`, `isModuleStarted(id)`, `isModuleComplete(id)`, `getQuizResult(id)`

### Progress Tracking Triggers

| Module | Started trigger | Completed trigger |
|---|---|---|
| Playground | Entry screen dismissed | First AI response |
| Tokenizer | Entry screen dismissed | First text tokenized |
| Generation | Entry screen dismissed | First token generated |
| Tutorial modules (8) | Entry screen dismissed | Reach final screen |
| AI City Builder | Game started | First case solved |
| AI Lab Explorer | Game started | First room completed |
| Prompt Heist | Game started | All 5 heists completed |
| Token Budget | Game started | First level completed |
| AI Ethics Tribunal | Game started | All 6 cases completed |

### Header Auth UI

- **Logged out**: SVG door/login icon (uses `header-icon-btn` class)
- **Logged in**: SVG person icon (`.header-avatar-svg`) with dropdown
- Auth button is **last** in header-right (after dark mode toggle)
- OAuth redirect preserves current tab via `sessionStorage('auth_return_tab')`

### HomeScreen Badges

Cards show SVG icon badges in bottom-right corner:
- **In Progress** (blue clock) — module started but not completed, tracked via localStorage
- **Done** (green checkbox) — module completed, tracked via Supabase `progress` table
- **Quiz star** (yellow star) — quiz taken, tracked via Supabase `quiz_results` table
- **Lock icon** (top-right) — module locked for unauthenticated users

### Mobile Auth

- Auth modal slides up as bottom sheet (`border-radius: 16px 16px 0 0`)
- Avatar dropdown slides up as bottom sheet on mobile
- Form inputs use `font-size: 16px` to prevent iOS auto-zoom
- All auth buttons/inputs have 44px min-height for touch targets

### Session Persistence (Refresh Behavior)

Logged-in users stay on their current screen after page refresh. Non-logged-in users always land on the landing page.

**Two sessionStorage keys** (both cleared on sign-out in App.jsx):
- `nav_state` — `{ activeTab, showHome }` — which tab/screen the user is on
- `module_stages` — `{ "model-training": 2, "generation-entry": false, ... }` — per-module stage/entry state

**`usePersistedState(key, defaultValue)`** hook (`src/usePersistedState.js`):
- Drop-in `useState` replacement that persists value to `module_stages` in sessionStorage
- Reads from sessionStorage on mount (presence implies valid logged-in session)
- Writes on every value change when user is logged in
- Resets value back to `defaultValue` on sign-out (detects user truthy → null transition via ref)
- Used by all stage-based modules (`stage`, default `-1`) and entry-based modules (`showEntry`, default `true`)
- `showWelcome` initializes from stage/entry state: `useState(stage === -1)` or `useState(showEntry)`

**App.jsx nav persistence:**
- `readNav()` helper reads `nav_state` from sessionStorage in `useState` initializers
- During OAuth redirect, `activeTab` initializes to `pendingAuthReturn` to avoid flash of Playground
- Effect persists `{ activeTab, showHome }` whenever navigation changes (only when logged in and past landing/boot)
- On sign-out: clears `nav_state` + `module_stages` from sessionStorage, redirects to landing page

---

## Icon System

### Rule: No Emojis

**Never use emoji characters anywhere in the UI.** All icons are SVG. This includes:
- Data arrays (pipeline steps, use cases, strategies, etc.)
- Button labels (use `<PlayIcon>`, `<CheckIcon>`, etc.)
- CSS `::before`/`::after` pseudo-elements (no `content: '\1F4A1'`)
- Inline text indicators (use `Tip:` text or `<TipIcon>` instead)
- SVG `<text>` elements (draw shapes with `<line>`, `<polyline>`, `<g>` instead)
- Collapse/expand indicators (use SVG chevrons, not Unicode triangles)

### ContentIcons.jsx — General Purpose Icons

Thin-stroke feather-style SVGs. All share `IconBase` wrapper:

```jsx
// Pattern: size, color, className props. Stroke-based, no fill.
<IconBase size={16} color="#8E8E93" className="">
  <path ... />
</IconBase>
// IconBase: viewBox="0 0 24 24", strokeWidth="1.5", strokeLinecap/Join="round"
```

**Default colors by semantic meaning:**
| Icon | Default Color | Usage |
|---|---|---|
| `CheckIcon` | #34C759 (green) | Success, completion |
| `CrossIcon` | #FF3B30 (red) | Error, close, dismiss |
| `TipIcon` | #eab308 (yellow) | Tips, lightbulb hints — always yellow |
| `WarningIcon` | #FF9500 (orange) | Warnings |
| `SkullIcon` | #FF3B30 (red) | Danger, poisoning |
| All others | #8E8E93 (gray) | Neutral/contextual |

**Color matching rule:** When an icon appears inside a colored container (border-left, border-top, colored tag), set the icon's `color` prop to match the container's border/accent color. Exception: semantic icons (CheckIcon, CrossIcon, TipIcon) keep their semantic colors.

### ModuleIcon.jsx — Module Navigation Icons

Each module has a unique icon (chat bubble, bolt, CPU, etc.). Uses `stroke="currentColor"` so color is set via `style={{ color }}`.

**Color rule:** Always pass the module's **tag color** (not the old accent color):
```jsx
<ModuleIcon module="how-llms-work" size={48} style={{ color: '#FF9500' }} />
// FF9500 = Journey tag color, NOT the old #ec4899 accent
```

This applies to: EntryScreen icons, HomeScreen cards, LandingPage mobile grid, NeuralNetworkCanvas nodes.

---

## Button System

### Three Button Tiers

All filled buttons use `border: 1.5px solid transparent` to match outline button box models.

**1. Large CTA** — Entry screens, quiz launch, final actions, landing CTA
```css
height: 48px; padding: 0 28px; font-size: 15px; font-weight: 600;
border: 1.5px solid transparent; border-radius: 10px;
background: var(--accent); color: #fff;
```
Classes: `.entry-screen-btn`, `.how-start-btn`, `.how-gotit-btn`, `.quiz-launch-btn`, `.landing-cta`

**2. Navigation** — Back/Next step buttons
```css
padding: 10px 24px; font-size: 14px; font-weight: 600;
border: 1.5px solid transparent; border-radius: 10px;
```
Classes: `.how-back-btn` (outline), `.how-next-btn` (filled), `.gen-step-btn`, `.gen-auto-btn`, `.gen-reset-btn`

**3. Small Inline** — Replay, run, copy, pills, chips
```css
height: 36px; padding: 0 20px; font-size: 13px;
border: 1.5px solid var(--border); border-radius: 10px;
```
Classes: `.pe-replay-btn`, `.pe-chain-run-btn`, `.pe-tryit-run`, `.preset-btn`, `.suggestion-chip`

**Secondary/Outline buttons:**
```css
border: 1.5px solid var(--accent); background: none;
color: var(--accent); /* hover: fill with accent */
```
Class: `.how-secondary-btn`

### Button Height Consistency

When buttons appear side-by-side (e.g., `.how-final-actions`), force uniform sizing:
```css
.how-final-actions button {
  height: 48px; padding: 0 28px; margin: 0;
  display: inline-flex; align-items: center; justify-content: center;
  box-sizing: border-box; font-size: 15px; font-weight: 600;
  font-family: inherit; border-width: 1.5px; border-style: solid;
  border-radius: 10px; line-height: 1;
}
```

---

## Border Patterns

| Width | Usage |
|---|---|
| `1px` | Standard borders (inputs, cards, default) |
| `1.5px` | All buttons (filled and outline), interactive chips, strong emphasis |
| `2px` | Accent border-left on info tips, comparison panels, pipe steps |

**Border-left accent pattern** (info cards, pipeline steps):
```css
border-left: 2px solid <accent-color>;
```

**Border-top comparison pattern** (good/bad panels):
```css
border-top: 2px solid <color>;  /* #34C759 good, #FF9500 bad */
```

**Border radius values:** `6px` (icon buttons), `8px` (inputs, segments), `10px` (buttons), `12px` (cards, var(--radius)), `14px` (quiz options), `18-22px` (pills/chips)

### Tip Box Pattern

All tip/lightbulb boxes across every module MUST use the same yellow color pattern:

```css
background: rgba(234, 179, 8, 0.06);  /* light yellow tint */
border-left: 2px solid #eab308;        /* yellow left border */
```

```jsx
<div className="how-info-tip">  {/* or ft-tip, or any tip class */}
  <TipIcon size={16} color="#eab308" />
  Tip text here...
</div>
```

**Rules:**
- Background: always `rgba(234, 179, 8, 0.06)` (light/dark mode)
- Border-left: always `2px solid #eab308`
- Icon: always `<TipIcon>` with `color="#eab308"`
- Dark mode: same background tint (no change needed)
- CSS classes: `how-info-tip` (App.css), `ft-tip` (FineTuning.css)

---

## Typography

| Size | Weight | Usage |
|---|---|---|
| 28px | 700 | Page titles |
| 24px | 600 | Section headings |
| 20px | 600 | Quiz questions, sub-headings |
| 18px | 600 | Result messages |
| 16px | 400-600 | Body text, card titles |
| 15px | 500-600 | Buttons, inputs, labels |
| 14px | 500-600 | Secondary text, nav buttons, mobile buttons |
| 13px | 500 | Small text, sidebar, inline buttons |
| 12px | 600-700 | Category labels, progress info |
| 11px | 600 | Extra small section headers |

---

## Mobile Responsive

### Breakpoints

| Breakpoint | Purpose |
|---|---|
| `768px` | **Primary** — sidebar collapses, nav becomes hamburger, full-width layouts |
| `720px` | Module-specific grid collapses (CE, RAG, ML) |
| `700px` | Section-specific (MT data sources, PE layouts) |
| `500px` | Fine-grained (home welcome sizing) |
| `480px` | Small phones — grids collapse to 1 column, landing mobile grid to 2 columns |

### Key Mobile Rules (768px)

**Layout:**
- `.app` → `flex-direction: column`
- Sidebar collapses with toggle button (SVG chevron, not Unicode triangle)
- Padding reduces: `40px → 24px`, `20px → 16px`

**Buttons:**
- All buttons: `min-height: 44px` for touch target accessibility
- Navigation/final action buttons → `width: 100%`
- `.how-final-actions button` → `height: 44px; padding: 0 20px; font-size: 14px`
- `.how-final-actions` → `flex-direction: column`
- `.landing-cta` → `height: 44px; padding: 0 20px; font-size: 14px`

**Cards and Grids:**
- `.home-grid` → `grid-template-columns: 1fr`
- `.mt-collection-sources` → `grid-template-columns: repeat(2, 1fr)`
- `.pe-technique-cards` → `grid-template-columns: 1fr`
- `.ml-comparison, .ml-algo-cards, .ml-business-cards, .ml-overfit-panels` → `1fr` at 720px
- `.ce-model-cards, .ce-usecase-cards` → `1fr 1fr` at 720px, `1fr` at 480px
- `.rag-realworld-cards, .rag-chunking-cards` → `1fr` at 720px
- `.dl-comparison, .dl-techniques-grid, .dl-project-cards` → `1fr` at 768px
- `.ft-data-examples, .ft-industry-cards` → `1fr` at 768px

**Tokenizer:**
- `.tok-suggestions` → `flex-direction: column`
- `.tok-suggestion` → `flex: none` (prevents squish)

**Neural Network Canvas:**
- SVG canvas, background canvas, buttons, and drag hint hidden at 768px
- Mobile grid owned by `LandingPage.jsx` (`.landing-mobile-grid`): 3-col grid, 2-col at 480px
- Each card shows `ModuleIcon` colored by tag color + label

**Entry Screen:**
- Full-width button, reduced padding
- Icons use explicit `size={48}` (not affected by font-size CSS)

---

## Dark Mode

Implemented via `[data-theme="dark"]` attribute on `<html>`.

**Transition:** Instant switch — `.no-transitions` class disables all transitions during toggle (added/removed in `App.jsx` useEffect via double-rAF). No per-element transition needed for theme switching.

**Pattern for component overrides:**
```css
[data-theme="dark"] .my-component {
  background: #1C1917;
  border-color: #44403C;
  color: #E8E3DD;
}
```

---

## Animation Patterns

**Duration scale:** `0.1s` (press) → `0.15s` (hover) → `0.2s` (default) → `0.3s` (medium) → `0.5s` (entrance) → `1.2s` (progress)

**Common patterns:**
- Fade in + slide up: `opacity: 0; translateY(12px)` → `opacity: 1; translateY(0)`
- Card entrance: `translateX(30px)` → `translateX(0)` (0.3s ease-out)
- Button press: `transform: scale(0.97)` on `:active`
- Button hover lift: `transform: translateY(-1px)`
- Progress fill: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)
- Stage → final screen transition: fade out (`.how-fading`, 0.25s) → scroll to top → fade in (`.how-fade-in`)
- Quiz → results transition: fade out (`.quiz-fading-out`, 0.3s) → scroll to top → fade in (`.quiz-fade-in`)

**Easing:** `ease-out` for entrances, `ease-in` for exits, `ease` for general transitions.

---

## Standardized Module Screens

### Final Screen (after completing all stages, before quiz)

Every stage-based module's `showFinal` screen follows this structure:
1. Celebration message + toolkit/recap content (module-specific)
2. **Exactly 2 buttons** in `.how-final-actions`:
   - `quiz-launch-btn` — "Test Your Knowledge →" (filled, launches quiz)
   - `how-secondary-btn` — "Start over" (outline, calls `reset()`)
3. `<SuggestedModules>` component — divider + "What to learn next" + 3 random module cards

```jsx
<div className="how-final-actions">
  <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>Test Your Knowledge &rarr;</button>
  <button className="how-secondary-btn" onClick={reset}>Start over</button>
</div>
<SuggestedModules currentModuleId="module-id" onSwitchTab={onSwitchTab} />
```

**No other buttons** (no "Practice in Playground", no "Try X next"). Module suggestions are handled by `SuggestedModules`.

### Quiz End Screen (after completing quiz)

The `Quiz.jsx` component renders a standardized end screen:
1. Score circle + message (keep as-is)
2. **Exactly 2 buttons** in `.quiz-result-actions`:
   - `quiz-btn-secondary` — "Start Over" (outline, calls `onStartOver`)
   - `quiz-btn-primary` — "Take Quiz Again" (filled, retries quiz)
3. Divider + "What to explore next" + 3 random module cards

**Quiz props:** `questions`, `tabName`, `onBack`, `onStartOver`, `onSwitchTab`, `currentModuleId`

### Shared Module Data

- `src/moduleData.js` — `ALL_MODULES` array with id, title, description, tag, tagColor
- `src/SuggestedModules.jsx` — Reusable "What to learn next" component
- `getRandomModules(excludeId, count)` — Returns random modules excluding current

### NeuralNetworkCanvas Layout

Node positions are computed by `computeLayout()` — a force-directed simulation that runs once at module load (~0.5ms):
- **Repulsion**: pushes any pair of nodes closer than `nodeR * 2 + 52` apart
- **X attraction** (0.08): strong pull toward original `px` layer column
- **Y attraction** (0.005): weak pull allows vertical redistribution
- **Boundary constraints**: proportional padding (`refH * 0.07` top, `refH * 0.08` bottom)
- **Early exit**: stops when total displacement < 0.5px per iteration

New nodes only need approximate `px`/`py` hints — the simulation auto-resolves overlaps. ViewBox is `960×600` (`REF_W × REF_H`).

### NeuralNetworkCanvas Tooltips

Tooltips use `createPortal` to `document.body` with `position: fixed`. Must account for SVG `preserveAspectRatio="xMidYMid meet"` letterboxing:

```jsx
const scale = Math.min(svgRect.width / REF_W, svgRect.height / REF_H)
const offsetX = (svgRect.width - REF_W * scale) / 2
const offsetY = (svgRect.height - REF_H * scale) / 2
// tooltip.x = svgRect.left + offsetX + pos.x * scale
// tooltip.y = svgRect.top + offsetY + pos.y * scale + nodeRadius * scale + 8
```

---

## Adding a New Tutorial Tab

1. Create `src/TabName.jsx` following the stage-based pattern (see ContextEngineering.jsx)
2. Create `src/TabName.css` with module-specific styles
3. Add quiz questions to `src/quizData.js`
4. Update `src/NavDropdown.jsx`: add item to the appropriate NAV_GROUPS entry
5. Update `src/App.jsx`: import component, add render condition (pass `onSwitchTab={setActiveTab}`)
6. Update `src/HomeScreen.jsx`: add card to CARDS array — set `tag` field and use `FILTER_COLORS[tag]` for icon color
7. Update `src/LandingPage.jsx`: add to MOBILE_MODULES with tag color
8. Update `src/NeuralNetworkCanvas.jsx`: add to NODES array with group color and approximate `px`/`py` (force layout auto-resolves overlaps)
9. Add module icon to `src/ModuleIcon.jsx` ICON_PATHS
10. Add module to `src/moduleData.js` ALL_MODULES array
11. Color the EntryScreen icon with **tag color**: `style={{ color: '<tag-color>' }}`
12. Import needed icons from `src/ContentIcons.jsx` — always pass `color` prop matching container
13. All content icons inside colored containers must match the container's border/accent color
14. Use `border: 1.5px solid transparent` on all filled buttons
15. Final screen: exactly 2 buttons + `<SuggestedModules>` (see Standardized Module Screens)
16. Quiz: pass `onStartOver`, `onSwitchTab`, `currentModuleId` props
17. Add `useAuth` import and destructure `markModuleStarted`, `markModuleComplete`
18. Call `markModuleStarted('<module-id>')` when entry screen is dismissed
19. Call `markModuleComplete('<module-id>')` when module is completed (final screen or first meaningful action)
20. Update `TOTAL_MODULES` in `HomeScreen.jsx` if adding a completable module
21. Use `usePersistedState('<module-id>', -1)` for stage state (or `usePersistedState('<module-id>-entry', true)` for entry-based); init `showWelcome` from stage: `useState(stage === -1)`; init `showFinal` from stage: `useState(stage >= STAGES.length)` — prevents blank screen on page refresh
22. Add welcome banner with `<ol className="module-welcome-steps">` (shared CSS class for all modules)
23. Add progressive learn tips: `learnTip`/`dismissedTips`/`fadeTimerRef` state, `dismissLearnTip` function, milestone-based useEffect
24. Add `handleStartOver` function that resets stage, tips, welcome, and all module state
25. Add mobile touch targets (min-height: 44px) for module-specific buttons at 768px breakpoint
26. Update this file

## Conventions

- Each tutorial uses a stage-based stepper pattern with Back/Next navigation
- Tag colors (5 colors) drive all module icon coloring — NOT individual accent colors
- All modules support dark mode via CSS variables
- Quizzes are 10 questions, +10 points per correct answer
- Entry screens use the shared `EntryScreen` component with `ModuleIcon` colored by tag color
- Visualizations animate on stage activation via `active` prop
- Navigation groups are defined in `NavDropdown.jsx` NAV_GROUPS array
- Icons in colored containers always match the container's accent/border color
- Semantic icons (CheckIcon=green, CrossIcon=red, TipIcon=yellow) keep their semantic colors
- Filled and outline buttons both use `border: 1.5px solid` for identical box models
- All border-left accents use `2px` width
- Comparison panel border-tops use `2px` width
- No `!important` overrides unless absolutely necessary
- No emojis or Unicode symbols in UI — all SVG icons
- Mobile-first: test at 375px, 480px, 768px
- Grid collapse pattern: 3/4-col → 2-col (768px) → 1-col (480px)
- Final screens: exactly 2 buttons (Test Your Knowledge + Start over) + SuggestedModules component
- Quiz end screens: exactly 2 buttons (Start Over + Take Quiz Again) + explore next cards
- Tip boxes: always yellow — `rgba(234, 179, 8, 0.06)` bg, `#eab308` border-left, `TipIcon color="#eab308"`
- NeuralNetworkCanvas uses force-directed layout (`computeLayout`) — new nodes only need approximate `px`/`py` hints; overlaps are auto-resolved
- NeuralNetworkCanvas tooltips must account for SVG letterboxing (xMidYMid meet)
- Free modules (playground, tokenizer, generation) don't require login
- All other modules show lock icon + dimmed card until authenticated
- Every module must call `markModuleStarted` on entry screen dismiss and `markModuleComplete` on completion
- Auth header button (sign-in icon / avatar) is always last in header-right, after dark mode toggle
- OAuth redirect preserves current tab via sessionStorage `auth_return_tab`; `activeTab` initializes to pending tab to prevent flash
- Sign-out redirects to landing page and resets all module stages to defaults
- Progress badges (bottom-right of cards): blue clock (in progress), green checkbox (done), yellow star (quiz)
- Supabase client is null-safe — all calls guarded with `if (!supabase) return`
- Started modules tracked in localStorage (keyed by user ID), completed in Supabase `progress` table
- Logged-in users persist navigation + module stage to sessionStorage via `usePersistedState` hook; non-logged-in users always start fresh
- New modules must use `usePersistedState(moduleId, -1)` for stage (or `usePersistedState(moduleId + '-entry', true)` for entry-based modules)
- `showFinal` must initialize from persisted stage: `useState(stage >= STAGES.length)` — `useState(false)` causes blank screen on page refresh after completing all stages
- Welcome banner `<ol>` uses shared `module-welcome-steps` class (one CSS definition in App.css, not per-module copies)
- All stage-based modules implement `handleStartOver()` that resets stage, welcome, tips, and all module state; used by both "Start over" button and quiz `onStartOver`
- Progressive learn tips: `learnTip` state + `dismissedTips` Set + `fadeTimerRef` ref; milestone-based useEffect triggers tips at key stages; `dismissLearnTip` fades out then clears
- Module-specific CSS must include mobile touch targets: `min-height: 44px` on interactive buttons at `@media (max-width: 768px)`
- Stage → final screen uses fade transition: `setFading(true)` → 250ms → `setShowFinal(true)` + scroll-to-top via DOM ancestor walking
- Quiz results use fade transition: `setTransitioning(true)` → 300ms → `setShowResult(true)` + scroll-to-top via DOM ancestor walking
- Scroll-to-top pattern: walk up DOM from root element, reset every `scrollTop > 0`, then `window.scrollTo(0, 0)`
