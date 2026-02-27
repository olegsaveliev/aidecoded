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
| `neural-networks` | NeuralNetworks.jsx | NeuralNetworks.css | neuralNetworksQuiz | Technical | #5856D6 |
| `deep-learning` | DeepLearning.jsx | DeepLearning.css | deepLearningQuiz | Technical | #5856D6 |
| `computer-vision` | ComputerVision.jsx | ComputerVision.css | computerVisionQuiz | Technical | #5856D6 |
| `fine-tuning` | FineTuning.jsx | FineTuning.css | fineTuningQuiz | Technical | #5856D6 |
| `generative-ai` | GenerativeAI.jsx | GenerativeAI.css | generativeAIQuiz | Journey | #FF9500 |
| `ai-city-builder` | AICityBuilder.jsx | AICityBuilder.css | — (game) | Game | #F59E0B |
| `ai-lab-explorer` | AILabExplorer.jsx | AILabExplorer.css | — (game) | Game | #F59E0B |
| `prompt-heist` | PromptHeist.jsx | PromptHeist.css | — (game) | Game | #F59E0B |
| `token-budget` | TokenBudget.jsx | TokenBudget.css | — (game) | Game | #F59E0B |
| `ai-ethics-tribunal` | AIEthicsTribunal.jsx | AIEthicsTribunal.css | — (game) | Game | #F59E0B |
| `pm-simulator` | PMSimulator.jsx | PMSimulator.css | — (game) | Game | #F59E0B |
| `ai-native-pm` | AINativePM.jsx | AINativePM.css | aiNativePMQuiz | Professional | #0EA5E9 |
| `ai-safety` | AISafety.jsx | AISafety.css | aiSafetyQuiz | Practical | #34C759 |
| `ai-fluency` | AIFluency.jsx | AIFluency.css | aiFluencyQuiz | Practical | #34C759 |
| `ai-startup-simulator` | AIStartupSimulator.jsx | AIStartupSimulator.css | — (game) | Game | #F59E0B |
| `precision-recall` | PrecisionRecall.jsx | PrecisionRecall.css | precisionRecallQuiz | Technical | #5856D6 |
| `rag-under-the-hood` | RAGUnderTheHood.jsx | RAGUnderTheHood.css | ragUnderTheHoodQuiz | Technical | #5856D6 |
| `ai-in-production` | AIInProduction.jsx | AIInProduction.css | aiInProductionQuiz | Technical | #5856D6 |
| `alignment-game` | AlignmentGame.jsx | AlignmentGame.css | — (game) | Game | #F59E0B |
| `label-master` | LabelMaster.jsx | LabelMaster.css | — (game) | Game | #F59E0B |
| `draw-and-deceive` | DrawAndDeceive.jsx | DrawAndDeceive.css | — (game) | Game | #F59E0B |
| `agent-office` | AgentOffice.jsx | AgentOffice.css | — (game) | Game | #F59E0B |
| `choosing-ai-model` | ChoosingAIModel.jsx | ChoosingAIModel.css | choosingAIModelQuiz | Practical | #34C759 |
| `ollama` | Ollama.jsx | Ollama.css | ollamaQuiz | Practical | #34C759 |
| `claude-code` | ClaudeCode.jsx | ClaudeCode.css | claudeCodeQuiz | Practical | #34C759 |
| `agent-teams` | AgentTeams.jsx | AgentTeams.css | agentTeamsQuiz | Technical | #5856D6 |
| `custom-agents` | CustomAgents.jsx | CustomAgents.css | customAgentsQuiz | Technical | #5856D6 |
| `model-training-tycoon` | ModelTrainingTycoon.jsx | ModelTrainingTycoon.css | — (game) | Game | #F59E0B |

## Color System — Two Color Layers

### Tag Colors (Primary — used for icons, borders, visual identity)

These 6 colors drive all icon coloring, HomeScreen card borders, EntryScreen icons, and landing page icons:

| Tag | Color | Modules |
|---|---|---|
| Interactive | #0071E3 (blue) | Playground, Generation |
| Visual | #AF52DE (purple) | Tokenizer |
| Journey | #FF9500 (orange) | How LLMs Work, Model Training, RAG, Generative AI |
| Practical | #34C759 (green) | Prompt Engineering, Context Engineering, AI Safety & Hallucinations, AI Fluency, Choosing the Right AI Model, Run AI Locally, Claude Code |
| Technical | #5856D6 (indigo) | Agentic AI, Machine Learning, Neural Networks, Deep Learning, Fine-Tuning, Precision & Recall, Why RAG Fails, AI in Production, Agent Teams, Custom Agents |
| Game | #F59E0B (amber/gold) | AI City Builder, AI Lab Explorer, Prompt Heist, Token Budget, AI Ethics Tribunal, PM Simulator, AI Startup Simulator, The Alignment Game, Label Master, Draw & Deceive, Agent Office, Model Training Tycoon |
| Professional | #0EA5E9 (sky blue) | AI-Native PM |

**Where tag colors are used:**
- HomeScreen card left borders + card icons: `FILTER_COLORS[card.tag]`
- EntryScreen ModuleIcon: `style={{ color: '<tag-color>' }}`
- NeuralNetworkCanvas uses GROUP_COLORS (separate 4-color system for nav groups)

### Navigation Group Colors

| Group | Color | Tabs |
|---|---|---|
| Tools | #0071E3 | Playground, Tokenizer, Generation |
| Foundations | #AF52DE | How LLMs Work, Model Training, Machine Learning, Neural Networks, Precision & Recall, Deep Learning, Fine-Tuning, Generative AI |
| Skills | #34C759 | Prompt Engineering, Context Engineering, AI Safety & Hallucinations, AI Fluency, Choosing the Right AI Model, Run AI Locally, Claude Code |
| Advanced | #FF9500 | RAG, Agentic AI, Agent Teams, Custom Agents, Why RAG Fails, AI in Production |
| Play | #F59E0B | AI City Builder, AI Lab Explorer, Prompt Heist, Token Budget, AI Ethics Tribunal, PM Simulator, AI Startup Simulator, The Alignment Game, Label Master, Draw & Deceive, Agent Office, Model Training Tycoon |
| Professional | #0EA5E9 | AI-Native PM |

Used in: `NavDropdown.jsx`, `NeuralNetworkCanvas.jsx` (node rings)

### Icon Color Matching Rule

**Every SVG icon must match the color of its container:**
- Icon inside a card with colored left border → icon color = border color
- Icon inside a pipeline step with colored border → icon color = border color
- Icon inside a tag-labeled container → icon color = tag color
- Module icons (EntryScreen, HomeScreen, LandingPage) → tag color from table above
- TOOLKIT icons on final screens → tag color from table above (never gray)
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

- Desktop: `[Logo + AI Decoded]  [Tools] [Foundations] [Skills] [Advanced] [Play] [Professional]  [dark mode toggle]`
- Mobile (< 768px): Hamburger menu with full-screen overlay
- Active tab's parent group label turns Apple blue (#0071E3)
- Breadcrumb shows `Group > Tab Name` on wider screens (>= 900px)

### Browser History (Back/Forward)

Browser back/forward buttons work via the History API (`pushState`/`popstate`) using `?tab=` query params. No React Router.

**URL format:**
| Screen | URL |
|---|---|
| Landing / Home | `/` (no query param) |
| Module | `/?tab=playground`, `/?tab=tokenizer`, etc. |
| Profile | `/?tab=profile` (auth-gated) |

**Key functions in App.jsx:**
- `VALID_TABS` — whitelist array of all valid tab IDs (defined outside component)
- `getTabFromUrl()` — reads `?tab=` from URL, validates against `VALID_TABS`
- `navigateTo(tab)` — pushes `?tab=X` to history (or bare path for `home`). Guarded by `skipPush` ref to prevent double-pushes during popstate
- `handleSwitchTab(tab)` — wraps `setActiveTab` + `setShowHome(false)` + `navigateTo()`. Checks `isModuleLocked` and shows auth modal if locked. Passed as `onSwitchTab` prop to all child modules
- `AUTH_UNLOCK_MESSAGE` — shared constant for the auth unlock modal message (defined outside component)
- `onPopState` handler — restores `showHome`/`activeTab` on back/forward. Uses `showLandingRef` and `isModuleLockedRef` refs to avoid stale closures

**How it works:**
1. Every navigation action (`handleSelectTab`, `handleGoHome`, `handleBootComplete`, `handleLandingTabSelect`, `handleBreadcrumbGroupClick`, `handleSwitchTab`) calls `navigateTo()` after updating state
2. On mount, `replaceState` syncs the initial history entry so the first Back works
3. `popstate` handler sets `skipPush=true` before updating state, preventing `navigateTo` from pushing duplicate entries
4. Initial page load checks `?tab=` via `getTabFromUrl()` before sessionStorage `nav_state` (URL param takes priority)
5. Sign-out clears the URL via `replaceState` to bare pathname
6. Locked modules in popstate redirect to home screen instead of the locked module
7. Deep links to locked modules for unauthenticated users redirect to home screen (guard effect after auth loads) — no modal, modal only on explicit clicks
8. `canRenderModule` render guard prevents locked module content from flashing during auth loading

**Rules for new navigation handlers:**
- Always call `navigateTo(tab)` after setting `activeTab` state
- For home navigation, call `navigateTo('home')`
- Never call `navigateTo` inside the popstate handler (handled by `skipPush` guard)
- All `onSwitchTab` props must use `handleSwitchTab`, not raw `setActiveTab`

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
- `src/LandingPage.jsx` — Landing page with neural network canvas (desktop) and hero screen (mobile)
- `src/NeuralNetworkCanvas.jsx` — Interactive node graph on landing page (force-directed layout, viewBox 960×600)
- `src/EntryScreen.jsx` — Reusable entry/intro screen for each module
- `src/Quiz.jsx` / `src/Quiz.css` — Reusable quiz component
- `src/quizData.js` — All quiz question banks
- `src/Tooltip.jsx` — Info tooltip component
- `src/FeedbackWidget.jsx` / `src/FeedbackWidget.css` — Feedback bubble + modal
- `src/AgenticAI.jsx` / `src/AgenticAI.css` — Agentic AI tutorial (agents, loops, tools, memory, multi-agent, building, real agents, frontier)
- `src/GenerativeAI.jsx` / `src/GenerativeAI.css` — Generative AI tutorial (discriminative vs generative, diffusion, text, images, audio, video/code, risks, future)
- `src/NeuralNetworks.jsx` / `src/NeuralNetworks.css` — Neural Networks tutorial (8 stages: neuron, weights, activation, layers, forward pass, loss, backprop, training loop)
- `src/DeepLearning.jsx` / `src/DeepLearning.css` — Deep Learning tutorial (neurons, networks, backprop, CNN, transformers)
- `src/AICityBuilder.jsx` / `src/AICityBuilder.css` — AI City Builder game (detective cases, SVG city)
- `src/AILabExplorer.jsx` / `src/AILabExplorer.css` — AI Lab Explorer game (6-room lab, hands-on challenges)
- `src/PromptHeist.jsx` / `src/PromptHeist.css` — Prompt Heist game (5 heists, prompt engineering through gameplay)
- `src/TokenBudget.jsx` / `src/TokenBudget.css` — Token Budget game (5 levels, prompt compression/optimization)
- `src/AIEthicsTribunal.jsx` / `src/AIEthicsTribunal.css` — AI Ethics Tribunal game (6 cases, AI ethics dilemmas)
- `src/PMSimulator.jsx` / `src/PMSimulator.css` — PM Simulator game (5 missions, ship an AI feature as PM)
- `src/AINativePM.jsx` / `src/AINativePM.css` — AI-Native PM tutorial (8 stages: gap, deliverables, system instructions, structured logic, evals, hallucinations, drift, toolkit)
- `src/AISafety.jsx` / `src/AISafety.css` — AI Safety & Hallucinations tutorial (8 stages: what is hallucination, five types, detection, prompt fixes, RAG & grounding, evals, safety beyond, toolkit)
- `src/AIFluency.jsx` / `src/AIFluency.css` — AI Fluency tutorial (8 stages: why plateau, iteration, setting terms, questioning outputs, context, collaborative reasoning, trust limits, fluency system)
- `src/AIStartupSimulator.jsx` / `src/AIStartupSimulator.css` — AI Startup Simulator game (6 months, AI architecture decisions, build vs buy, RAG vs fine-tune, scaling, reliability)
- `src/AlignmentGame.jsx` / `src/AlignmentGame.css` — The Alignment Game (8 rounds, AI alignment through constraint writing, Goodhart's Law, specification gaming)
- `src/LabelMaster.jsx` / `src/LabelMaster.css` — Label Master game (8 levels, bounding box annotation, IoU scoring, NMS demo, segmentation). Levels: 1) Single cat bbox, 2) Bird on branch bbox, 3) Car+person+cone multi-bbox, 4) 5 objects timed bbox, 5) Overlapping cat+sofa+person bbox, 6) 7 people crowded scene bbox, 7) Fix bad labels (drag to correct), 8) Cat polygon segmentation
- `src/DrawAndDeceive.jsx` / `src/DrawAndDeceive.css` — Draw & Deceive game (5 rounds, 32x32 pixel art, GPT-4o vision classification, adversarial examples). Rounds: 1) Draw target for AI, 2) Modify to fool AI, 3) Speed round (30s timer), 4) Adversarial (draw cat, AI says dog), 5) Maximize wrong confidence
- `src/AgentOffice.jsx` / `src/AgentOffice.css` — Agent Office game (6 levels, pixel art office, 4 AI agents, real API calls). Levels: 1) First task (agentic loop), 2) Tools matter, 3) Instructions quality, 4) Agent routing, 5) Multi-agent pipeline, 6) Parallel agents + sub-agents
- `src/PrecisionRecall.jsx` / `src/PrecisionRecall.css` — Precision & Recall tutorial (7 stages: accuracy trap, confusion matrix, precision, recall, trade-off, F1 score, choosing metrics)
- `src/RAGUnderTheHood.jsx` / `src/RAGUnderTheHood.css` — Why RAG Fails tutorial (7 stages: why RAG fails, chunking, metadata, embeddings, retrieval, filtering, production checklist)
- `src/AIInProduction.jsx` / `src/AIInProduction.css` — AI in Production tutorial (7 stages: silent failure, quality metrics, latency & cost, drift detection, A/B testing, alerting, full observability stack)
- `src/ChoosingAIModel.jsx` / `src/ChoosingAIModel.css` — Choosing the Right AI Model tutorial (7 stages: wrong question, 7 dimensions, benchmarks, task matching, cost-quality-speed triangle, model snapshot 2026, personal framework)
- `src/Ollama.jsx` / `src/Ollama.css` — Run AI Locally tutorial (7 stages: why local, install & run, model library, the Modelfile, parameters, the API, build assistant)
- `src/ClaudeCode.jsx` / `src/ClaudeCode.css` — Claude Code tutorial (8 stages: what it is, installation, models, CLAUDE.md, skills, MCP, full stack, workflows)
- `src/AgentTeams.jsx` / `src/AgentTeams.css` — Agent Teams tutorial (5 stages: solo vs team, architecture, first team, patterns, rough edges). TeamVisualiser SVG, TeamBuilderViz interactive builder, DecisionMatrix quadrant chart, ToolChips with colored dots + descriptions
- `src/CustomAgents.jsx` / `src/CustomAgents.css` — Custom Agents tutorial (5 stages: what they are, name and description, frontmatter fields, three example agents, comparison). AgentCard component, DescriptionTester interactive, FrontmatterBuilder interactive, three-way comparison table
- `src/ToolChips.jsx` — Reusable tool chips component with colored dots and click-to-expand descriptions (portal popup, viewport clamped)
- `src/moduleData.js` — Shared ALL_MODULES array + getRandomModules helper
- `src/SuggestedModules.jsx` — Reusable "What to learn next" cards (used in final screens + quiz end)
- `src/usePersistedState.js` — Hook to persist module stage/entry state to sessionStorage for logged-in users
- `src/supabase.js` — Supabase client (null-safe, handles missing env vars)
- `src/AuthContext.jsx` — Auth provider: user state, progress, quiz results, module started/complete tracking
- `src/UserProfile.jsx` / `src/UserProfile.css` — User profile page (stats grid, progress by category, achievements/badges, completed modules list)
- `src/AuthModal.jsx` — Sign In/Sign Up modal (Google OAuth + email/password)
- `src/AuthModal.css` — Auth modal, avatar dropdown, progress badges, locked card styles

---

## SEO

**Domain:** `https://www.aidecoded.academy/`

### Static Tags (`index.html`)
- `<meta name="description">` — primary Google snippet text
- `<meta name="keywords">` — search terms (learn AI, LLM tutorial, prompt engineering, etc.)
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical">` — canonical URL
- Open Graph tags (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:locale`)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)

### Auto-generated from `moduleData.js` (no manual updates needed)
- **JSON-LD structured data** (`src/App.jsx`): `useEffect([], ...)` injects `<script type="application/ld+json">` into `<head>` on mount, building `WebSite` + `Organization` + `ItemList` schemas from `ALL_MODULES`. Count and entries auto-sync.
- **Sitemap** (`vite.config.js`): `sitemapPlugin()` runs at `closeBundle`, reads `src/moduleData.js`, extracts module IDs via regex, writes `dist/sitemap.xml` with homepage + all module URLs.
- **Dynamic title/meta** (`src/App.jsx`): `useEffect` on `[activeTab, showHome, showLanding]` updates `document.title`, `<meta name="description">`, `og:title`, `og:description`, `og:url` per module from `ALL_MODULES`.

### Static Files
- `public/robots.txt` — allows all crawlers, points to sitemap
- `dist/sitemap.xml` — auto-generated at build time (not in `public/`)

### Maintenance Rules
- When adding a new module: just add it to `src/moduleData.js` — sitemap, JSON-LD, and dynamic titles all auto-update
- OG image (`og:image`) currently uses `favicon.png` as placeholder — replace with 1200×630px image when available

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

## Agent Teams Module (`src/AgentTeams.jsx`)

Interactive 5-stage tutorial covering Claude Code Agent Teams — multi-agent collaboration for complex coding tasks. Stage-based with stepper navigation. CSS prefix: `.at-`. Uses shared `TeamVisualiser` SVG component across all stages with animated message particles and a task board.

### Entry Screen
- Title: "Agent Teams", subtitle: "When One Agent Isn't Enough"
- Description explains what the learner will discover (team lead + teammates, task boards, messaging, real patterns)
- Button text: "Meet the team"

### Welcome Banner
Numbered 3-step guide: (1) watch the team of agents work through animations, (2) build your own team in the interactive builder, (3) see when teams help and when they don't

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

### Progressive Learning Tips
Milestone-based tips triggered at key stages. No auto-dismiss — user clicks X. Max one visible at a time. Tracked via `dismissedTips` Set with `fadeTimerRef` for cleanup.

| Trigger | Tip |
|---|---|
| Stage 0 (The Ceiling) | "The solo agent hits a wall on big tasks — watch the comparison above" |
| Stage 1 (Architecture) | "Hit Play to watch the lead delegate tasks and teammates work in parallel" |
| Stage 2 (First Team) | "Try all three patterns — each one generates a different prompt you can copy" |
| Stage 4 (Rough Edges) | "Teams aren't always the answer — check the decision matrix to know when" |

All tips reset on "Start over". CSS: reuses `.learn-tip` classes from Playground.

### Tool Chips
All 5 stages use `ToolChips` with `{ name, color, desc }` objects (~40 tools total). Colored dots indicate category, descriptions show on click/tap via tooltip popup.

### Dark Mode
Uses standard CSS variable overrides. Builder inputs, role inputs, and prompt preview have dark-mode-specific border/background. Active pattern buttons use indigo (`#5856D6`) borders in both modes.

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
| Tutorial modules (9) | Entry screen dismissed | Reach final screen |
| AI City Builder | Game started | First case solved |
| AI Lab Explorer | Game started | First room completed |
| Prompt Heist | Game started | All 5 heists completed |
| Token Budget | Game started | First level completed |
| AI Ethics Tribunal | Game started | All 6 cases completed |
| PM Simulator | Game started | All 5 missions completed |
| AI Startup Simulator | Game started | All 6 decisions completed |
| The Alignment Game | Game started | All 8 rounds completed |
| Label Master | Game started | All 8 levels completed |
| Draw & Deceive | Game started | All 5 rounds completed |
| Agent Office | Game started | All 6 levels completed |
| Model Training Tycoon | Game started | First completion (any score) |
| AI-Native PM | Entry screen dismissed | Reach final screen |
| Precision & Recall | Entry screen dismissed | Reach final screen |
| Why RAG Fails | Entry screen dismissed | Reach final screen |
| AI in Production | Entry screen dismissed | Reach final screen |
| Neural Networks | Entry screen dismissed | Reach final screen |
| Choosing the Right AI Model | Entry screen dismissed | Reach final screen |
| Run AI Locally | Entry screen dismissed | Reach final screen |
| Claude Code | Entry screen dismissed | Reach final screen |
| Agent Teams | Entry screen dismissed | Reach final screen |
| Custom Agents | Entry screen dismissed | Reach final screen |

### Header Auth UI

- **Logged out**: SVG door/login icon (uses `header-icon-btn` class)
- **Logged in**: SVG person icon (`.header-avatar-svg`) with dropdown containing Profile + Sign Out
- Auth button is **last** in header-right (after dark mode toggle)
- Profile button navigates to `/?tab=profile` via `handleSwitchTab('profile')`
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
- On session expiry (user becomes null): same cleanup, plus redirects to landing page if on profile page

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

This applies to: EntryScreen icons, HomeScreen cards, NeuralNetworkCanvas nodes.

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

**Border-left accent pattern** (info cards, pipeline steps, hint boxes, lesson cards):
```css
border-left: 2px solid <accent-color>;
border-radius: 10px;  /* always 10px — never 0 Xpx Xpx 0 */
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
border-radius: 10px;                   /* rounded — never flat left edge */
font-size: 14px;
color: var(--text-secondary);
padding: 12px 16px;
```

```jsx
<div className="how-info-tip">  {/* or ft-tip, or any tip class */}
  <TipIcon size={16} color="#eab308" />
  Tip text here...
</div>
```

**Rules:**
- Background: always `rgba(234, 179, 8, 0.06)` (light mode), `rgba(234, 179, 8, 0.08)` (dark mode)
- Border-left: always `2px solid #eab308`
- Border-radius: always `10px` (never `0 8px 8px 0` or similar flat-left patterns)
- Font-size: `14px`, color: `var(--text-secondary)`
- Icon: always `<TipIcon>` with `color="#eab308"`
- CSS classes: `how-info-tip` (App.css), `ft-tip` (FineTuning.css), `ph-hint-box` (PromptHeist), `tb-hint-box` (TokenBudget), `ale-help-box` (AILabExplorer), `pms-hint-box` (PMSimulator)

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
| `480px` | Small phones — grids collapse to 1 column |

### Key Mobile Rules (768px)

**Layout:**
- `.app` → `flex-direction: column; height: auto; min-height: 100vh` (body scroll replaces inner scroll)
- Header → `position: fixed` (always visible at top, z-index 1000)
- `.main-body` → `padding-top: 52px` (offsets fixed header)
- `.tab-content-wrapper` → `overflow-y: visible` (no inner scroll container on mobile)
- `.main` → `overflow: visible`
- Sidebar lives inside `<main>` wrapped in `.main-body` div (below header, above content). Desktop uses `.main-body-with-sidebar` (flex row); mobile overrides to `flex-direction: column`
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

**Landing Page Mobile:**
- Desktop: neural network canvas with interactive nodes (hidden at 768px)
- Mobile (≤ 768px): single hero screen replacing the canvas
  - **Hero** (full viewport): centered ModuleIcon + typewriter "AI Decoded" title + tagline + "Explore Modules" CTA
  - CTA button calls `onGetStarted` → transitions to BootScreen (terminal-style typing) → home screen
  - Desktop elements hidden on mobile: `.landing-title-desktop`, `.landing-tagline-desktop`, `.landing-network-wrapper`, `.landing-cta`, `.landing-hint`
  - Mobile hero hidden on desktop: `.landing-mobile-hero`
- **Theme toggle on mobile landing**: hidden via `body.on-landing` CSS class (added/removed on LandingPage mount/unmount). Users can only change theme inside the app, not on the landing page on mobile. Desktop landing keeps the toggle visible.
- NeuralNetworkCanvas watches `data-theme` changes via MutationObserver for canvas redraws

**Entry Screen:**
- Full-width button, reduced padding
- Icons use explicit `size={48}` (not affected by font-size CSS)

---

## Dark Mode

Implemented via `[data-theme="dark"]` attribute on `<html>`.

**Transition:** Instant switch — `.no-transitions` class disables all transitions during toggle (added/removed in `App.jsx` useEffect via `setTimeout`). No per-element transition needed for theme switching.

**Theme persistence:**
- `localStorage.setItem('theme', 'dark'|'light')` — saved on every toggle
- `index.html` inline `<script>` reads localStorage and sets `data-theme`, `backgroundColor`, `colorScheme`, and `theme-color` meta tag **before** CSS/React loads (prevents flash)
- `App.jsx` darkMode effect sets: `data-theme` attr, `colorScheme` style, `backgroundColor` on both `<html>` and `<body>`, localStorage, and updates `<meta name="theme-color">` for mobile browser chrome
- `theme-color` meta update: `setAttribute` first (works on Android Chrome), then `setTimeout(50ms)` remove+recreate (iOS Safari fallback)

**Mobile landing page:**
- Dark mode toggle hidden on mobile (≤ 768px) when landing page is active
- `LandingPage.jsx` adds `body.on-landing` class on mount, removes on unmount
- CSS: `body.on-landing .header-theme-toggle, body.on-landing .landing-theme-toggle { display: none !important }` at 768px and landscape phones
- Landing page respects saved theme — if user set dark mode in the app, landing shows dark
- Header toggle (`.header-theme-toggle` class) visible on all app screens on mobile, just hidden on landing

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

Every stage-based module's `showFinal` screen follows this standardized structure:
1. Celebration message (`how-final-celebration`)
2. Icon grid (`pe-final-grid`) — 4-column grid of cards, each with an SVG icon + label
3. Toolkit table (`pe-reference`) — 3-column table: Concept | When to use | Key phrase
4. **Exactly 2 buttons** in `.how-final-actions`:
   - `quiz-launch-btn` — "Test Your Knowledge →" (filled, launches quiz)
   - `how-secondary-btn` — "Start over" (outline, calls `handleStartOver()`)
5. `<SuggestedModules>` component — divider + "What to learn next" + 3 random module cards

**TOOLKIT array** — defined at module level (outside the component function), ~5-8 items per module:
```jsx
const TOOLKIT = [
  { concept: 'Name', when: 'When to use it', phrase: 'Key phrase', icon: <SomeIcon size={24} color="#TAG_COLOR" /> },
  // ... one item per stage/concept in the module
]
```

**Icon color rule:** Every TOOLKIT icon must use the module's **tag color** (not gray `#8E8E93`):
- Practical (#34C759): PromptEngineering, ContextEngineering, AISafety, AIFluency, ChoosingAIModel, Ollama, ClaudeCode
- Technical (#5856D6): AgenticAI, MachineLearning, NeuralNetworks, DeepLearning, FineTuning, PrecisionRecall, RAGUnderTheHood, AIInProduction, AgentTeams
- Journey (#FF9500): HowLLMsWork, ModelTraining, RAG, GenerativeAI
- Professional (#0EA5E9): AINativePM

**Full JSX pattern:**
```jsx
{showFinal && (
  <div className="how-final how-fade-in">
    <div className="how-final-celebration">You now know [Topic]!</div>
    <div className="pe-final-grid">
      {TOOLKIT.map((item) => (
        <div key={item.concept} className="pe-final-card">
          <div className="pe-final-card-emoji">{item.icon}</div>
          <div className="pe-final-card-name">{item.concept}</div>
        </div>
      ))}
    </div>
    <div className="pe-reference-wrapper">
      <div className="pe-reference-title">Your [Topic] Toolkit</div>
      <table className="pe-reference">
        <thead><tr><th>Concept</th><th>When to use</th><th>Key phrase</th></tr></thead>
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
      <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>Test Your Knowledge &rarr;</button>
      <button className="how-secondary-btn" onClick={handleStartOver}>Start over</button>
    </div>
    <SuggestedModules currentModuleId="module-id" onSwitchTab={onSwitchTab} />
  </div>
)}
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

**Two layout modes:**
- **Initial (neuron shape)**: `NEURON_LAYOUT` positions nodes in a biological neuron shape — dendrites (left), soma cluster (center-left), axon (middle horizontal), terminals (right). Animation follows signal flow. Uses `computeLayout` with attraction `0.06` to preserve shape.
- **Replay (random)**: `generateRandom()` assigns random `px`/`py` to all nodes and shuffles animation order. Uses attraction `0.02` for loose organic spread.

**Node radius**: `NODE_RADIUS = 24` (icon 20×20, label font 10px)

Node positions are computed by `computeLayout(nodes, refW, refH, nodeR, attraction)` — a force-directed simulation:
- **Repulsion**: pushes any pair of nodes closer than `nodeR * 2 + 44` apart
- **Attraction**: configurable per layout mode (0.06 neuron, 0.02 random) — equal in both X and Y axes
- **Boundary constraints**: proportional padding (`refH * 0.07` top, `refH * 0.08` bottom)
- **Early exit**: stops when total displacement < 0.5px per iteration

**Adding new nodes**: Add to `NODES` array (no `px`/`py` needed), add position to `NEURON_LAYOUT`, add to `NEURON_ANIM_ORDER` in the appropriate section. ViewBox is `960×600` (`REF_W × REF_H`).

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
7. Update `src/NeuralNetworkCanvas.jsx`: add to NODES array with group color, add position to `NEURON_LAYOUT`, add to `NEURON_ANIM_ORDER` (force layout auto-resolves overlaps)
8. Add module icon to `src/ModuleIcon.jsx` ICON_PATHS
9. Add module to `src/moduleData.js` ALL_MODULES array
10. Color the EntryScreen icon with **tag color**: `style={{ color: '<tag-color>' }}`
11. Import needed icons from `src/ContentIcons.jsx` — always pass `color` prop matching container
12. All content icons inside colored containers must match the container's border/accent color
13. Use `border: 1.5px solid transparent` on all filled buttons
14. Final screen: define `TOOLKIT` array at module level with `{ concept, when, phrase, icon }` items (icon color = tag color), use `pe-final-grid` + `pe-reference` + 2 buttons + `<SuggestedModules>` (see Standardized Module Screens)
15. Quiz: pass `onStartOver`, `onSwitchTab`, `currentModuleId` props
16. Add `useAuth` import and destructure `markModuleStarted`, `markModuleComplete`
17. Call `markModuleStarted('<module-id>')` when entry screen is dismissed
18. Call `markModuleComplete('<module-id>')` when module is completed (final screen or first meaningful action)
19. Update `TOTAL_MODULES` in `HomeScreen.jsx` if adding a completable module
20. Use `usePersistedState('<module-id>', -1)` for stage state (or `usePersistedState('<module-id>-entry', true)` for entry-based); init `showWelcome` from stage: `useState(stage === -1)`; init `showFinal` from stage: `useState(stage >= STAGES.length)` — prevents blank screen on page refresh
21. Add welcome banner with `<ol className="module-welcome-steps">` (shared CSS class for all modules)
22. Add progressive learn tips: `learnTip`/`dismissedTips`/`fadeTimerRef` state, `dismissLearnTip` function, milestone-based useEffect
23. Add `handleStartOver` function that resets stage, tips, welcome, and all module state
24. Add mobile touch targets (min-height: 44px) for module-specific buttons at 768px breakpoint
25. Update this file

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
- Never use `\u2014` or other `\uXXXX` escapes anywhere — use HTML entities (`&mdash;`, `&rarr;`, etc.) in JSX text, and literal characters (`—`, `→`) in JavaScript strings. While `\uXXXX` technically works in JS strings, prefer literal characters for readability and consistency. In JSX template text, `\uXXXX` renders as literal characters and must never be used.
- Mobile-first: test at 375px, 480px, 768px
- Grid collapse pattern: 3/4-col → 2-col (768px) → 1-col (480px)
- Final screens: TOOLKIT icon grid (`pe-final-grid`) + toolkit table (`pe-reference`) + exactly 2 buttons (Test Your Knowledge + Start over) + SuggestedModules component; TOOLKIT array defined at module level with `{ concept, when, phrase, icon }` items; icon color = module's tag color
- Quiz end screens: exactly 2 buttons (Start Over + Take Quiz Again) + explore next cards
- Tip boxes: always yellow — `rgba(234, 179, 8, 0.06)` bg, `#eab308` border-left, `TipIcon color="#eab308"`
- NeuralNetworkCanvas has two layout modes: neuron-shaped initial layout (dendrites→soma→axon→terminals) and random replay layout; new nodes need entries in `NODES`, `NEURON_LAYOUT`, and `NEURON_ANIM_ORDER`
- NeuralNetworkCanvas tooltips must account for SVG letterboxing (xMidYMid meet)
- Free modules (playground, tokenizer, generation) don't require login
- All other modules show lock icon + dimmed card until authenticated
- Every module must call `markModuleStarted` on entry screen dismiss and `markModuleComplete` on completion
- Auth header button (sign-in icon / avatar) is always last in header-right, after dark mode toggle (`.header-theme-toggle`)
- Dark mode toggle hidden on mobile landing page via `body.on-landing` class — users change theme only inside the app
- Landing page mobile: single hero screen with typewriter + CTA → boot screen → home; desktop uses neural network canvas
- OAuth redirect preserves current tab via sessionStorage `auth_return_tab`; `activeTab` initializes to pending tab to prevent flash
- Sign-out redirects to landing page and resets all module stages to defaults
- Session expiry redirects to landing page if user is on the profile page (guard in nav persistence effect)
- Profile page (`activeTab === 'profile'`) rendered at `!showHome && activeTab === 'profile'` — requires auth, no lock icon since only accessible via avatar dropdown
- Progress badges (bottom-right of cards): blue clock (in progress), green checkbox (done), yellow star (quiz)
- Supabase client is null-safe — all calls guarded with `if (!supabase) return`
- Started modules tracked in localStorage (keyed by user ID), completed in Supabase `progress` table
- Logged-in users persist navigation + module stage to sessionStorage via `usePersistedState` hook; non-logged-in users always start fresh
- New modules must use `usePersistedState(moduleId, -1)` for stage (or `usePersistedState(moduleId + '-entry', true)` for entry-based modules)
- `showFinal` must initialize from persisted stage: `useState(stage >= STAGES.length)` — `useState(false)` causes blank screen on page refresh after completing all stages
- Welcome banner `<ol>` uses shared `module-welcome-steps` class (one CSS definition in App.css, not per-module copies)
- Welcome banner only shows on first stage: render condition must include `stage === 0 &&` so the banner auto-dismisses when advancing (no need to click "Got it")
- All stage-based modules implement `handleStartOver()` that resets stage, welcome, tips, and all module state; used by both "Start over" button and quiz `onStartOver`
- Progressive learn tips: `learnTip` state + `dismissedTips` Set + `fadeTimerRef` ref; milestone-based useEffect triggers tips at key stages; `dismissLearnTip` fades out then clears
- Learn tip useEffect must use a single if/else-if chain with `else { setLearnTip(null); setLearnTipFading(false) }` fallback — without the else branch, tips from one stage persist on all subsequent stages
- Module-specific CSS must include mobile touch targets: `min-height: 44px` on interactive buttons at `@media (max-width: 768px)`
- Stage → final screen uses fade transition: `setFading(true)` → 250ms → `setShowFinal(true)` + scroll-to-top via DOM ancestor walking
- Quiz results use fade transition: `setTransitioning(true)` → 300ms → `setShowResult(true)` + scroll-to-top via DOM ancestor walking
- Scroll-to-top pattern: walk up DOM from root element, reset every `scrollTop > 0`, then `window.scrollTo(0, 0)`
- Stage-change scroll: every module's `useEffect([stage])` calls `window.scrollTo(0, 0)` after stepper `scrollIntoView` — ensures page starts at top on mobile (body scroll) while stepper still scrolls horizontally
- Navigation scroll: `scrollAllToTop()` in App.jsx uses same DOM-walking pattern; called by `handleGoHome`, `handleBreadcrumbGroupClick`, `handleSelectTab`
- HomeScreen does NOT auto-scroll to cards on group filter — mobile fixed header makes `scrollIntoView` push content behind header; navigation handlers already scroll to top
- Browser back/forward uses History API (`pushState`/`popstate`) with `?tab=` query params — no React Router
- All navigation handlers must call `navigateTo(tab)` after state changes; `onSwitchTab` props use `handleSwitchTab` (not raw `setActiveTab`)
- Popstate handler uses `showLandingRef` and `isModuleLockedRef` refs to avoid stale closures from empty dependency array
- Deep links supported: `/?tab=tokenizer` skips landing page and goes directly to module (free modules only for unauthenticated users; locked modules redirect to home)
- Deep link auth protection: guard effect (`useEffect` on `[authLoading, activeTab, showHome, showLanding, user]`) redirects to home silently; `canRenderModule` flag (`FREE_MODULES.includes(activeTab) || !!user`) prevents locked content from rendering; `handleSwitchTab` checks `isModuleLocked` before navigating
- Auth modal only appears on explicit user action (clicking locked card on HomeScreen, locked item in nav dropdown, locked item on landing page) — never on passive deep link redirect
