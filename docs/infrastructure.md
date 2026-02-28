# Infrastructure Details

Implementation details for SEO, authentication, release flags, canvas, and navigation internals. Referenced from CLAUDE.md.

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

## Module Release Feature Flags

Modules can be built and deployed ahead of time, then toggled visible/hidden via a Supabase table — no redeployment needed. The Supabase dashboard is the admin panel.

### Supabase Table: `module_releases`

```sql
create table module_releases (
  module_id text primary key,
  released boolean not null default true,
  created_at timestamptz default now()
);

alter table module_releases enable row level security;

create policy "Anyone can read module releases"
  on module_releases for select using (true);
```

**Rules:**
- Only modules with a row AND `released = false` are hidden
- Modules without a row are visible by default (backward compatible)
- Write access is admin-only (Supabase dashboard / service key)
- Empty table = all modules visible

### ReleaseContext (`src/ReleaseContext.jsx`)

- Context provides `hiddenModules` (Set of module IDs) and `releaseLoading` (boolean)
- Fetches `module_releases` where `released = false` on mount (independent of auth)
- Null-safe: if no Supabase client, defaults to empty Set (all modules show)
- On fetch error, defaults to empty Set (graceful fallback)
- Wrapped around `<AuthProvider>` in `src/main.jsx`

### Where hidden modules are filtered

| File | What's filtered |
|---|---|
| `src/App.jsx` | Guard effect redirects hidden tab to home; popstate handler blocks hidden tabs; JSON-LD structured data excludes hidden modules |
| `src/NavDropdown.jsx` | Desktop triggers, portal dropdown items, mobile overlay items; hides entire group if all items hidden |
| `src/HomeScreen.jsx` | CARDS filtered before tag/group/search; progress bar uses `visibleTotal` |
| `src/NeuralNetworkCanvas.jsx` | NODES, CONNECTIONS, NEURON_ANIM_ORDER filtered via useMemo; layout recomputed |
| `src/SuggestedModules.jsx` | Passes `hiddenModules` to `getRandomModules` |
| `src/Quiz.jsx` | Passes `hiddenModules` to `getRandomModules` |
| `src/UserProfile.jsx` | Badge conditions and stats use `visibleTotal` |
| `src/moduleData.js` | `getRandomModules(excludeId, count, hiddenIds)` accepts optional hidden set |

### Files NOT affected by release flags

- `src/AuthContext.jsx` — tracks all completions regardless of visibility
- `vite.config.js` — build-time sitemap includes all modules (hidden modules exist in sitemap but aren't linked from UI)
- Individual module components — only render when their tab is active, which can't happen for hidden modules

---

## Navigation Implementation Details

### Key functions in App.jsx
- `VALID_TABS` — whitelist array of all valid tab IDs (defined outside component)
- `getTabFromUrl()` — reads `?tab=` from URL, validates against `VALID_TABS`
- `navigateTo(tab)` — pushes `?tab=X` to history (or bare path for `home`). Guarded by `skipPush` ref to prevent double-pushes during popstate
- `handleSwitchTab(tab)` — wraps `setActiveTab` + `setShowHome(false)` + `navigateTo()`. Checks `isModuleLocked` and shows auth modal if locked. Passed as `onSwitchTab` prop to all child modules
- `AUTH_UNLOCK_MESSAGE` — shared constant for the auth unlock modal message (defined outside component)
- `onPopState` handler — restores `showHome`/`activeTab` on back/forward. Uses `showLandingRef` and `isModuleLockedRef` refs to avoid stale closures

### How it works
1. Every navigation action (`handleSelectTab`, `handleGoHome`, `handleBootComplete`, `handleLandingTabSelect`, `handleBreadcrumbGroupClick`, `handleSwitchTab`) calls `navigateTo()` after updating state
2. On mount, `replaceState` syncs the initial history entry so the first Back works
3. `popstate` handler sets `skipPush=true` before updating state, preventing `navigateTo` from pushing duplicate entries
4. Initial page load checks `?tab=` via `getTabFromUrl()` before sessionStorage `nav_state` (URL param takes priority)
5. Sign-out clears the URL via `replaceState` to bare pathname
6. Locked modules in popstate redirect to home screen instead of the locked module
7. Deep links to locked modules for unauthenticated users redirect to home screen (guard effect after auth loads) — no modal, modal only on explicit clicks
8. `canRenderModule` render guard prevents locked module content from flashing during auth loading

---

## NeuralNetworkCanvas Layout

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
