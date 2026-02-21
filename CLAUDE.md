# AI Decoded — LLM Playground

Interactive React app for learning how Large Language Models work.

## Architecture

- **Framework**: React + Vite
- **API**: OpenAI (Chat Completions, Embeddings)
- **Styling**: Per-module CSS files, CSS variables for theming (light/dark)
- **State**: React useState/useEffect (no external state management)

## Module Inventory

| Tab ID | Component | CSS | Quiz | Accent Color |
|---|---|---|---|---|
| `playground` | App.jsx (inline) | App.css | — | #0071e3 |
| `tokenizer` | Tokenizer.jsx | App.css | tokenizerQuiz | #8b5cf6 |
| `generation` | Generation.jsx | App.css | generationQuiz | #eab308 |
| `how-llms-work` | HowLLMsWork.jsx | App.css | howLLMsWorkQuiz | #ec4899 |
| `model-training` | ModelTraining.jsx | App.css | modelTrainingQuiz | #f97316 |
| `prompt-engineering` | PromptEngineering.jsx | PromptEngineering.css | promptEngineeringQuiz | #22c55e |
| `context-engineering` | ContextEngineering.jsx | ContextEngineering.css | contextEngineeringQuiz | #00c7be |
| `rag` | RAG.jsx | RAG.css | ragQuiz | #5856D6 |
| `machine-learning` | MachineLearning.jsx | MachineLearning.css | machineLearningQuiz | #AF52DE |

## Navigation Structure

Header uses grouped dropdown navigation (`NavDropdown.jsx` / `NavDropdown.css`):

| Group | Emoji | Tabs |
|---|---|---|
| Tools | 🛠️ | Playground, Tokenizer, Generation |
| Foundations | 🧠 | How LLMs Work, Model Training, Machine Learning |
| Skills | 💡 | Prompt Engineering, Context Engineering |
| Advanced | ⚡ | RAG |

- Desktop: `[Logo + AI Decoded]  [Tools ▼] [Foundations ▼] [Skills ▼] [Advanced ▼]  [🌙 Dark mode]`
- Mobile (< 768px): Hamburger menu with full-screen overlay
- Active tab's parent group label turns Apple blue (#0071E3)
- Breadcrumb shows `Group › Tab Name` on wider screens (≥ 900px)

## Adding a New Tutorial Tab

1. Create `src/TabName.jsx` following the stage-based pattern (see ContextEngineering.jsx)
2. Create `src/TabName.css` with module-specific styles
3. Add quiz questions to `src/quizData.js`
4. Update `src/NavDropdown.jsx`: add item to the appropriate NAV_GROUPS entry
5. Update `src/App.jsx`: import component, add render condition
6. Update `src/HomeScreen.jsx`: add card to CARDS array (include `group` field)
7. Update `src/LandingPage.jsx`: add to FEATURES array
8. Update this file

## Key Files

- `src/App.jsx` — Main router, sidebar, grouped header, playground chat
- `src/NavDropdown.jsx` — Grouped dropdown navigation component
- `src/NavDropdown.css` — Navigation dropdown styles
- `src/HomeScreen.jsx` — Module card grid with filter tags and group labels
- `src/LandingPage.jsx` — Initial landing page with feature cards
- `src/quizData.js` — All quiz question banks
- `src/Quiz.jsx` — Reusable quiz component
- `src/EntryScreen.jsx` — Reusable entry/intro screen
- `src/Tooltip.jsx` — Info tooltip component

## Conventions

- Each tutorial uses a stage-based stepper pattern with Back/Next navigation
- Accent colors are unique per module and applied to stepper, highlights, and interactive elements
- All modules support dark mode via CSS variables
- Quizzes are 10 questions, +10 points per correct answer
- Entry screens use the shared `EntryScreen` component
- Visualizations animate on stage activation via `active` prop
- Navigation groups are defined in `NavDropdown.jsx` NAV_GROUPS array
