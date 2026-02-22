# AI Decoded — LLM Playground

Interactive React app for learning how Large Language Models work.

## Architecture

- **Framework**: React + Vite
- **API**: OpenAI (Chat Completions, Embeddings)
- **Styling**: Per-module CSS files, CSS variables for theming (light/dark)
- **State**: React useState/useEffect (no external state management)
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
| `machine-learning` | MachineLearning.jsx | MachineLearning.css | machineLearningQuiz | Technical | #5856D6 |
| `fine-tuning` | FineTuning.jsx | FineTuning.css | fineTuningQuiz | Technical | #5856D6 |

## Color System — Two Color Layers

### Tag Colors (Primary — used for icons, borders, visual identity)

These 5 colors drive all icon coloring, HomeScreen card borders, EntryScreen icons, and landing page icons:

| Tag | Color | Modules |
|---|---|---|
| Interactive | #0071E3 (blue) | Playground, Generation |
| Visual | #AF52DE (purple) | Tokenizer |
| Journey | #FF9500 (orange) | How LLMs Work, Model Training, RAG |
| Practical | #34C759 (green) | Prompt Engineering, Context Engineering |
| Technical | #5856D6 (indigo) | Machine Learning |

**Where tag colors are used:**
- HomeScreen card left borders + card icons: `FILTER_COLORS[card.tag]`
- EntryScreen ModuleIcon: `style={{ color: '<tag-color>' }}`
- LandingPage MOBILE_MODULES: `color: '<tag-color>'`
- NeuralNetworkCanvas uses GROUP_COLORS (separate 4-color system for nav groups)

### Navigation Group Colors

| Group | Color | Tabs |
|---|---|---|
| Tools | #0071E3 | Playground, Tokenizer, Generation |
| Foundations | #AF52DE | How LLMs Work, Model Training, Machine Learning |
| Skills | #34C759 | Prompt Engineering, Context Engineering |
| Advanced | #FF9500 | RAG |

Used in: `NavDropdown.jsx`, `NeuralNetworkCanvas.jsx` (node rings, mobile grid)

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

- Desktop: `[Logo + AI Decoded]  [Tools] [Foundations] [Skills] [Advanced]  [dark mode toggle]`
- Mobile (< 768px): Hamburger menu with full-screen overlay
- Active tab's parent group label turns Apple blue (#0071E3)
- Breadcrumb shows `Group > Tab Name` on wider screens (>= 900px)

## Key Files

- `src/App.jsx` — Main router, sidebar, grouped header, playground chat
- `src/App.css` — Bulk of component styles + mobile responsive rules
- `src/index.css` — CSS variables (light/dark), global resets, base typography
- `src/ContentIcons.jsx` — SVG icon library (70+ icons, thin-stroke feather style)
- `src/ModuleIcon.jsx` — Module-specific SVG icons (chat, tokenizer, bolt, etc.)
- `src/ModuleIcon.css` — ModuleIcon color states (default, hover, active)
- `src/NavDropdown.jsx` — Grouped dropdown navigation component
- `src/HomeScreen.jsx` — Module card grid with filter tags and group labels
- `src/LandingPage.jsx` — Landing page with neural network canvas
- `src/NeuralNetworkCanvas.jsx` — Interactive node graph on landing page
- `src/EntryScreen.jsx` — Reusable entry/intro screen for each module
- `src/Quiz.jsx` / `src/Quiz.css` — Reusable quiz component
- `src/quizData.js` — All quiz question banks
- `src/Tooltip.jsx` — Info tooltip component
- `src/FeedbackWidget.jsx` / `src/FeedbackWidget.css` — Feedback bubble + modal
- `src/moduleData.js` — Shared ALL_MODULES array + getRandomModules helper
- `src/SuggestedModules.jsx` — Reusable "What to learn next" cards (used in final screens + quiz end)

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
| `480px` | Small phones — grids collapse to 1 column, NN mobile grid to 2 columns |

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

**Tokenizer:**
- `.tok-suggestions` → `flex-direction: column`
- `.tok-suggestion` → `flex: none` (prevents squish)

**Neural Network Canvas:**
- SVG canvas hidden, replaced with `.nn-mobile-grid` (3-col grid, 2-col at 480px)
- Each card shows `ModuleIcon` colored by group + label

**Entry Screen:**
- Full-width button, reduced padding
- Icons use explicit `size={48}` (not affected by font-size CSS)

---

## Dark Mode

Implemented via `[data-theme="dark"]` attribute on `<html>`.

**Transition:** All elements smoothly transition `background-color, color, border-color, box-shadow` over `0.3s ease`.

**Excluded from transitions:** `input[type='range']`, canvas, svg, `.typing-indicator span`, `.send-spinner`

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
8. Update `src/NeuralNetworkCanvas.jsx`: add to NODES array with group color
9. Add module icon to `src/ModuleIcon.jsx` ICON_PATHS
10. Add module to `src/moduleData.js` ALL_MODULES array
11. Color the EntryScreen icon with **tag color**: `style={{ color: '<tag-color>' }}`
12. Import needed icons from `src/ContentIcons.jsx` — always pass `color` prop matching container
13. All content icons inside colored containers must match the container's border/accent color
14. Use `border: 1.5px solid transparent` on all filled buttons
15. Final screen: exactly 2 buttons + `<SuggestedModules>` (see Standardized Module Screens)
16. Quiz: pass `onStartOver`, `onSwitchTab`, `currentModuleId` props
17. Update this file

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
- NeuralNetworkCanvas tooltips must account for SVG letterboxing (xMidYMid meet)
