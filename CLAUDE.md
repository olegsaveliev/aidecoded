# AI Decoded — LLM Playground

Interactive React app for learning how Large Language Models work.

## Architecture

- **Framework**: React + Vite
- **API**: OpenAI (Chat Completions, Embeddings) via server-side proxy (`/api/chat.js`, `/api/embeddings.js`)
- **API Proxy**: Vercel Edge Runtime functions in `/api/` — frontend calls `/api/chat` and `/api/embeddings`, proxy adds `OPENAI_API_KEY` server-side
- **Auth**: Supabase Auth (Google OAuth + email/password) with PostgreSQL progress tracking
- **Styling**: Per-module CSS files, CSS variables for theming (light/dark)
- **State**: React useState/useEffect, AuthContext for auth/progress state, ReleaseContext for module feature flags
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
| `image-generation` | ImageGeneration.jsx | ImageGeneration.css | imageGenerationQuiz | Journey | #FF9500 |
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
| `claude-skills` | ClaudeSkills.jsx | ClaudeSkills.css | claudeSkillsQuiz | Practical | #34C759 |
| `agent-teams` | AgentTeams.jsx | AgentTeams.css | agentTeamsQuiz | Technical | #5856D6 |
| `custom-agents` | CustomAgents.jsx | CustomAgents.css | customAgentsQuiz | Technical | #5856D6 |
| `model-training-tycoon` | ModelTrainingTycoon.jsx | ModelTrainingTycoon.css | — (game) | Game | #F59E0B |
| `spec-driven-dev` | SpecDrivenDev.jsx | SpecDrivenDev.css | specDrivenDevQuiz | Practical | #34C759 |
| `ai-coding-tools` | AICodingTools.jsx | AICodingTools.css | aiCodingToolsQuiz | Practical | #34C759 |
| `ai-pm-workflows` | AIPMWorkflows.jsx | AIPMWorkflows.css | aiPMWorkflowsQuiz | Professional | #0EA5E9 |
| `system-design-interview` | SystemDesignInterview.jsx | SystemDesignInterview.css | — (game) | Game | #F59E0B |
| `prompt-injection` | PromptInjection.jsx | PromptInjection.css | promptInjectionQuiz | Security | #EF4444 |
| `prompt-injection-lab` | PromptInjectionLab.jsx | PromptInjectionLab.css | — (game) | Game | #F59E0B |
| `skill-builder-challenge` | SkillBuilderChallenge.jsx | SkillBuilderChallenge.css | — (game) | Game | #F59E0B |

## Color System — Two Color Layers

### Tag Colors (Primary — used for icons, borders, visual identity)

These 8 colors drive all icon coloring, HomeScreen card borders, EntryScreen icons, and landing page icons:

| Tag | Color | Modules |
|---|---|---|
| Interactive | #0071E3 (blue) | Playground, Generation |
| Visual | #AF52DE (purple) | Tokenizer |
| Journey | #FF9500 (orange) | How LLMs Work, Model Training, RAG, Generative AI, Image Generation |
| Practical | #34C759 (green) | Prompt Engineering, Context Engineering, AI Safety & Hallucinations, AI Fluency, Choosing the Right AI Model, Run AI Locally, Claude Code, Claude Skills, Spec-Driven Development, AI Coding Tools |
| Technical | #5856D6 (indigo) | Agentic AI, Machine Learning, Neural Networks, Deep Learning, Fine-Tuning, Precision & Recall, Why RAG Fails, AI in Production, Agent Teams, Custom Agents |
| Game | #F59E0B (amber/gold) | AI City Builder, AI Lab Explorer, Prompt Heist, Token Budget, AI Ethics Tribunal, PM Simulator, AI Startup Simulator, The Alignment Game, Label Master, Draw & Deceive, Agent Office, Model Training Tycoon, System Design Interview, Skill Builder Challenge |
| Professional | #0EA5E9 (sky blue) | AI-Native PM, AI-Native PM Workflows |
| Security | #EF4444 (red) | Prompt Injection Explained |

**Where tag colors are used:**
- HomeScreen card left borders + card icons: `FILTER_COLORS[card.tag]`
- EntryScreen ModuleIcon: `style={{ color: '<tag-color>' }}`
- Landing page neuron burst particles use tag palette colors (light/dark variants)

### Navigation Group Colors

| Group | Color | Tabs |
|---|---|---|
| Tools | #0071E3 | Playground, Tokenizer, Generation |
| Foundations | #AF52DE | How LLMs Work, Model Training, Machine Learning, Neural Networks, Precision & Recall, Deep Learning, Fine-Tuning, Generative AI, Image Generation |
| Skills | #34C759 | Prompt Engineering, Context Engineering, AI Safety & Hallucinations, AI Fluency, Choosing the Right AI Model, Run AI Locally, Claude Code, Claude Skills, Spec-Driven Development, AI Coding Tools |
| Advanced | #FF9500 | RAG, Agentic AI, Agent Teams, Custom Agents, Why RAG Fails, AI in Production |
| Play | #F59E0B | AI City Builder, AI Lab Explorer, Prompt Heist, Token Budget, AI Ethics Tribunal, PM Simulator, AI Startup Simulator, The Alignment Game, Label Master, Draw & Deceive, Agent Office, Model Training Tycoon, System Design Interview, Skill Builder Challenge |
| Professional | #0EA5E9 | AI-Native PM, AI-Native PM Workflows |
| Security | #EF4444 | Prompt Injection Explained |

Used in: `NavDropdown.jsx`

### Icon Color Matching Rule

**Every SVG icon must match the color of its container:**
- Icon inside a card with colored left border → icon color = border color
- Icon inside a pipeline step with colored border → icon color = border color
- Icon inside a tag-labeled container → icon color = tag color
- Module icons (EntryScreen, HomeScreen) → tag color from table above
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

## Navigation

Header uses grouped dropdown navigation (`NavDropdown.jsx` / `NavDropdown.css`):

- Desktop: `[Logo + AI Decoded]  [Tools] [Foundations] [Security] [Skills] [Advanced] [Play] [Professional]  [dark mode toggle]`
- Mobile (< 768px): Hamburger menu with full-screen overlay
- Active tab's parent group label turns Apple blue (#0071E3)
- Breadcrumb shows `Group > Tab Name` on wider screens (>= 900px)
- Browser back/forward via History API (`pushState`/`popstate`) with `?tab=` query params. No React Router.
- Deep links supported: `/?tab=tokenizer` goes directly to module

**Rules for new navigation handlers:**
- Always call `navigateTo(tab)` after setting `activeTab` state
- For home navigation, call `navigateTo('home')`
- Never call `navigateTo` inside the popstate handler (handled by `skipPush` guard)
- All `onSwitchTab` props must use `handleSwitchTab`, not raw `setActiveTab`

> For full navigation implementation details (popstate, deep link auth, session persistence), see `docs/infrastructure.md`.

## Key Files

**Shared/Utility:**
- `src/App.jsx` — Main router, sidebar, grouped header, playground chat
- `src/App.css` — Bulk of component styles + mobile responsive rules
- `src/index.css` — CSS variables (light/dark), global resets, base typography
- `src/ContentIcons.jsx` — SVG icon library (70+ icons, thin-stroke feather style)
- `src/ModuleIcon.jsx` / `src/ModuleIcon.css` — Module-specific SVG icons
- `src/NavDropdown.jsx` — Grouped dropdown navigation
- `src/HomeScreen.jsx` — Module card grid with filter tags
- `src/LandingPage.jsx` — Landing page (Augen-style blur-reveal hero with typewriter title + neuron burst particles)
- `src/EntryScreen.jsx` — Reusable entry/intro screen for each module
- `src/Quiz.jsx` / `src/Quiz.css` — Reusable quiz component
- `src/quizData.js` — All quiz question banks
- `src/ToolChips.jsx` — Reusable tool chips with colored dots + click-to-expand descriptions
- `src/moduleData.js` — Shared ALL_MODULES array + getRandomModules helper
- `src/SuggestedModules.jsx` — Reusable "What to learn next" cards
- `src/usePersistedState.js` — Hook to persist module stage/entry state to sessionStorage
- `src/scrollUtils.js` — Shared scroll-to-top utility (cancellable RAF chains, 500ms easeOutCubic)
- `src/AuthContext.jsx` — Auth provider: user state, progress, quiz results
- `src/ReleaseContext.jsx` — Module release feature flags
- `api/chat.js` — Vercel Edge Runtime proxy for OpenAI Chat Completions
- `api/embeddings.js` — Vercel Edge Runtime proxy for OpenAI Embeddings

> For per-module file descriptions and stage details, see `docs/module-details.md`.
> For SEO, auth tables, release flags, canvas layout, see `docs/infrastructure.md`.

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

Each module has a unique icon. Uses `stroke="currentColor"` so color is set via `style={{ color }}`.

**Color rule:** Always pass the module's **tag color** (not the old accent color):
```jsx
<ModuleIcon module="how-llms-work" size={48} style={{ color: '#FF9500' }} />
```

This applies to: EntryScreen icons, HomeScreen cards.

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
<div className="how-info-tip">
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
- Header → `position: fixed` (z-index 1000)
- `.main-body` → `padding-top: 52px`
- `.tab-content-wrapper` → `overflow-y: visible` (no inner scroll on mobile)
- Sidebar collapses with toggle button (SVG chevron)
- Padding reduces: `40px → 24px`, `20px → 16px`

**Buttons:**
- All buttons: `min-height: 44px` for touch target accessibility
- Navigation/final action buttons → `width: 100%`
- `.how-final-actions` → `flex-direction: column`

**Cards and Grids:**
- Grid collapse pattern: 3/4-col → 2-col (768px) → 1-col (480px)

**Landing Page:**
- Augen-style full-viewport centered hero (same layout desktop + mobile)
- Blur-reveal animation: elements start `opacity: 0; filter: blur(6px)` → reveal with stagger
- TypewriterTitle types on load with blur clearing; subtitle + CTA blur-reveal after typing finishes
- Neuron burst: canvas particle system fires when typewriter completes — particles shoot toward four screen corners
- Theme toggle hidden on mobile landing via `body.on-landing` class

**Entry Screen:**
- Full-width button, reduced padding
- Game entry buttons use `.entry-screen-btn-game` class (orange #F59E0B, hover #D97706)

---

## Dark Mode

Implemented via `[data-theme="dark"]` attribute on `<html>`.

**Transition:** Instant switch — `.no-transitions` class disables all transitions during toggle.

**Theme persistence:** `localStorage.setItem('theme', ...)` — `index.html` inline script reads it before CSS loads (prevents flash).

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
- Stage → final screen: fade out (`.how-fading`, 0.25s) → scroll to top → fade in (`.how-fade-in`)
- Quiz → results: fade out (`.quiz-fading-out`, 0.3s) → scroll to top → fade in (`.quiz-fade-in`)

**Easing:** `ease-out` for entrances, `ease-in` for exits, `ease` for general transitions.

---

## Standardized Module Screens

### Stage Content Structure

Every stage in a stage-based module follows this layout (top to bottom):

1. **Info card** (`how-info-card how-info-card-edu`) — contains ALL introductory text for the stage:
   - `how-info-card-header` with `<strong>` title (renders with blue left border accent)
   - Body paragraphs (intro text, explanations)
   - Tip box (`how-info-tip` with `TipIcon`) if applicable
   - `ToolChips` component if applicable
2. **Visual/interactive content** — section headings (`<h3>`) + visualizations, diagrams, interactive elements, cards, grids, etc.
3. **Navigation** — `how-nav-row` > `how-nav-buttons` > Back + Next buttons

```jsx
{stage === N && (
  <div className="xx-stage">
    <div className="how-info-card how-info-card-edu">
      <div className="how-info-card-header"><strong>Stage Title</strong></div>
      <p>Intro paragraph...</p>
      <div className="how-info-tip">
        <TipIcon size={16} color="#eab308" />
        Tip text...
      </div>
      <ToolChips tools={STAGES[N].tools} />
    </div>

    <h3 className="xx-section-heading">Section Title</h3>
    <p>Description hint text (13px, var(--text-secondary)).</p>
    {/* Visualization / interactive component */}

    <div className="how-nav-row">
      <div className="how-nav-buttons">
        <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
        <button className="how-gotit-btn" onClick={handleNext}>Next &rarr;</button>
      </div>
    </div>
  </div>
)}
```

**Rules:**
- All intro text goes INSIDE the info card — never floating bare `<p>` tags above it
- Section headings (`<h3>`) and their visual content go BELOW the info card
- Description text below section headings: `13px`, `color: var(--text-secondary)` (hint style)
- Navigation is always last, wrapped in `how-nav-row` > `how-nav-buttons`
- One info card per stage (not multiple)

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
]
```

**Icon color rule:** Every TOOLKIT icon must use the module's **tag color** (not gray `#8E8E93`):
- Practical (#34C759): PromptEngineering, ContextEngineering, AISafety, AIFluency, ChoosingAIModel, Ollama, ClaudeCode
- Technical (#5856D6): AgenticAI, MachineLearning, NeuralNetworks, DeepLearning, FineTuning, PrecisionRecall, RAGUnderTheHood, AIInProduction, AgentTeams
- Journey (#FF9500): HowLLMsWork, ModelTraining, RAG, GenerativeAI, ImageGeneration
- Professional (#0EA5E9): AINativePM
- Security (#EF4444): PromptInjection

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
1. Score circle + message
2. **Exactly 2 buttons** in `.quiz-result-actions`:
   - `quiz-btn-secondary` — "Start Over" (outline, calls `onStartOver`)
   - `quiz-btn-primary` — "Take Quiz Again" (filled, retries quiz)
3. Divider + "What to explore next" + 3 random module cards

**Quiz props:** `questions`, `tabName`, `onBack`, `onStartOver`, `onSwitchTab`, `currentModuleId`

### Shared Module Data

- `src/moduleData.js` — `ALL_MODULES` array with id, title, description, tag, tagColor
- `src/SuggestedModules.jsx` — Reusable "What to learn next" component
- `getRandomModules(excludeId, count)` — Returns random modules excluding current

---

## Adding a New Tutorial Tab

1. Create `src/TabName.jsx` following the stage-based pattern (see ContextEngineering.jsx)
2. Create `src/TabName.css` with module-specific styles
3. Add quiz questions to `src/quizData.js`
4. Update `src/NavDropdown.jsx`: add item to the appropriate NAV_GROUPS entry
5. Update `src/App.jsx`: import component, add render condition (pass `onSwitchTab={setActiveTab}`)
6. Update `src/HomeScreen.jsx`: add card to CARDS array — set `tag` field and use `FILTER_COLORS[tag]` for icon color
7. Add module icon to `src/ModuleIcon.jsx` ICON_PATHS
8. Add module to `src/moduleData.js` ALL_MODULES array
9. Color the EntryScreen icon with **tag color**: `style={{ color: '<tag-color>' }}`; for Game modules, also pass `buttonClassName="entry-screen-btn-game"` for orange button
10. Import needed icons from `src/ContentIcons.jsx` — always pass `color` prop matching container
11. All content icons inside colored containers must match the container's border/accent color
12. Use `border: 1.5px solid transparent` on all filled buttons
13. Final screen: define `TOOLKIT` array at module level with `{ concept, when, phrase, icon }` items (icon color = tag color), use `pe-final-grid` + `pe-reference` + 2 buttons + `<SuggestedModules>` (see Standardized Module Screens)
14. Quiz: pass `onStartOver`, `onSwitchTab`, `currentModuleId` props
15. Add `useAuth` import and destructure `markModuleStarted`, `markModuleComplete`
16. Call `markModuleStarted('<module-id>')` when entry screen is dismissed
17. Call `markModuleComplete('<module-id>')` when module is completed (final screen or first meaningful action)
18. Update `TOTAL_MODULES` in `HomeScreen.jsx` if adding a completable module
19. Use `usePersistedState('<module-id>', -1)` for stage state (or `usePersistedState('<module-id>-entry', true)` for entry-based); init `showWelcome` from stage: `useState(stage === -1)`; init `showFinal` from stage: `useState(stage >= STAGES.length)` — prevents blank screen on page refresh
20. Add welcome banner with `<ol className="module-welcome-steps">` (shared CSS class for all modules)
21. Add progressive learn tips: `learnTip`/`dismissedTips`/`fadeTimerRef` state, `dismissLearnTip` function, milestone-based useEffect
22. Add `handleStartOver` function that resets stage, tips, welcome, and all module state
23. Add mobile touch targets (min-height: 44px) for module-specific buttons at 768px breakpoint
24. Update this file (CLAUDE.md module inventory table, tag color tables if new tag, conventions if new pattern)
25. Update `docs/module-details.md` with entry screen, stages, learn tips, and visualizations for the new module
26. Update `docs/progress-triggers.md` with started/completed triggers for the new module
27. To hide before release: insert `(module_id, false)` into `module_releases` table. To release: set `released = true` or delete the row.

> For progress tracking triggers per module, see `docs/progress-triggers.md`.

## Conventions

- Each tutorial uses a stage-based stepper pattern with Back/Next navigation
- Tag colors (8 colors) drive all module icon coloring — NOT individual accent colors
- All modules support dark mode via CSS variables
- Quizzes are 10 questions, +10 points per correct answer
- Entry screens use the shared `EntryScreen` component with `ModuleIcon` colored by tag color; game modules pass `buttonClassName="entry-screen-btn-game"` for orange buttons (#F59E0B); non-game modules use default blue (`var(--accent)`)
- Game entry screens use tagline animation: `taglines` array + `visibleLines` state with staggered `setTimeout` (300ms/600ms/900ms) + cleanup. Taglines: `font-size: 16px`, `font-weight: 400`. CSS: `.entry-screen-tagline` with `opacity`/`transform` transition, `.visible` class applied per line
- Game entry screen description text: plain centered text (`font-size: 16px`, `color: var(--text-secondary)`, `text-align: center`) — no briefing boxes, no borders, no backgrounds
- Custom-entry games (AlignmentGame, DrawAndDeceive, AgentOffice, LabelMaster, ModelTrainingTycoon, SystemDesignInterview) have own entry CSS but follow same patterns: `min-height: 60vh`, `padding: 40px 24px`, orange button (#F59E0B), 16px tagline text
- Visualizations animate on stage activation via `active` prop
- ToolChips entries must be actual software tools, libraries, frameworks, platforms, or APIs — not company names, techniques, algorithms, parameters, commands, benchmarks, or generic descriptors. When a company name is relevant, use the product name instead (e.g. "Claude" not "Anthropic", "OpenAI API" not "OpenAI"). Empty tool arrays are fine — `ToolChips` returns `null` and the section is hidden
- Navigation groups are defined in `NavDropdown.jsx` NAV_GROUPS array
- Icons in colored containers always match the container's accent/border color
- Semantic icons (CheckIcon=green, CrossIcon=red, TipIcon=yellow) keep their semantic colors
- Filled and outline buttons both use `border: 1.5px solid` for identical box models
- All border-left accents use `2px` width
- Comparison panel border-tops use `2px` width
- No `!important` overrides unless absolutely necessary
- No emojis or Unicode symbols in UI — all SVG icons
- Never use `\u2014` or other `\uXXXX` escapes anywhere — use HTML entities (`&mdash;`, `&rarr;`, etc.) in JSX text, and literal characters (`—`, `→`) in JavaScript strings
- Mobile-first: test at 375px, 480px, 768px
- Grid collapse pattern: 3/4-col → 2-col (768px) → 1-col (480px)
- Final screens: TOOLKIT icon grid + toolkit table + exactly 2 buttons (Test Your Knowledge + Start over) + SuggestedModules
- Quiz end screens: exactly 2 buttons (Start Over + Take Quiz Again) + explore next cards
- Tip boxes: always yellow — `rgba(234, 179, 8, 0.06)` bg, `#eab308` border-left, `TipIcon color="#eab308"`
- Landing page: Augen-style blur-reveal (`landingBlurReveal` keyframes) + TypewriterTitle + neuron burst canvas particles shooting to screen corners; `NeuronBurst` component in `LandingPage.jsx`
- Free modules (playground, tokenizer, generation) don't require login; all others show lock icon until authenticated
- Every module must call `markModuleStarted` on entry screen dismiss and `markModuleComplete` on completion
- Auth header button (sign-in icon / avatar) is always last in header-right, after dark mode toggle
- Dark mode toggle hidden on mobile landing page via `body.on-landing` class
- Landing page: full-viewport centered hero with typewriter title + blur-reveal subtitle/CTA + neuron burst → boot screen → home (same layout desktop + mobile)
- OAuth redirect preserves current tab via sessionStorage `auth_return_tab`
- Sign-out redirects to landing page and resets all module stages
- Profile page (`activeTab === 'profile'`) requires auth, only accessible via avatar dropdown
- Progress badges (bottom-right of cards): blue clock (in progress), green checkbox (done), yellow star (quiz)
- Supabase client is null-safe — all calls guarded with `if (!supabase) return`
- Started modules tracked in localStorage (keyed by user ID), completed in Supabase `progress` table
- Logged-in users persist navigation + module stage to sessionStorage via `usePersistedState` hook; non-logged-in users always start fresh
- New modules must use `usePersistedState(moduleId, -1)` for stage (or `usePersistedState(moduleId + '-entry', true)` for entry-based modules)
- Module root wrapper must use `className="how-llms [xx]-root"` — `how-llms` (App.css) provides `display:flex`, `flex-direction:column`, `flex:1`, `width:100%`, `align-self:center`, `overflow-y:auto`, `overflow-x:hidden`; module CSS only overrides `max-width`, `gap`, `padding`
- `showFinal` must initialize from persisted stage: `useState(stage >= STAGES.length)` — `useState(false)` causes blank screen on refresh
- Welcome banner `<ol>` uses shared `module-welcome-steps` class (one CSS definition in App.css)
- Welcome banner only shows on first stage: render condition must include `stage === 0 &&`
- All stage-based modules implement `handleStartOver()` that resets stage, welcome, tips, and all module state
- Progressive learn tips: `learnTip` state + `dismissedTips` Set + `fadeTimerRef` ref; milestone-based useEffect; `dismissLearnTip` fades out then clears
- Learn tip useEffect must use a single if/else-if chain with `else { setLearnTip(null); setLearnTipFading(false) }` fallback
- Module-specific CSS must include mobile touch targets: `min-height: 44px` on interactive buttons at 768px
- Stage → final screen uses fade transition: `setFading(true)` → 250ms → `setShowFinal(true)` + scroll-to-top
- Stage-change scroll: import `scrollStageToTop` from `./scrollUtils.js`, call in `useEffect([stage])` with cleanup: `const cancel = scrollStageToTop('.module-root', activeStepRef); return cancel`
- Navigation scroll: `scrollAllToTop()` in App.jsx; called by `handleGoHome`, `handleBreadcrumbGroupClick`, `handleSelectTab`
- HomeScreen does NOT auto-scroll to cards on group filter
- All navigation handlers must call `navigateTo(tab)` after state changes; `onSwitchTab` props use `handleSwitchTab`
- Deep link auth protection: guard effect redirects locked modules to home silently; `canRenderModule` flag prevents locked content rendering
- Auth modal only appears on explicit user action — never on passive deep link redirect
- Module release flags: `ReleaseContext` provides `hiddenModules` Set; modules with `released = false` are hidden across nav, home, canvas, suggestions, and deep links
- New modules are visible by default (no row needed in `module_releases`); to hide, insert row with `released = false`
- Release flags are independent of auth — fetched once on app mount
- Before implementing any change — present the approach and get user approval first. Never start coding without confirmation.
- When introducing a new pattern, convention, or architectural change not covered above — explain what it is, why it's needed, and how it impacts existing modules/code before proceeding. Get user approval, then update CLAUDE.md and relevant docs/ files to document the decision
