import { useState, useEffect, useRef, useCallback } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, FileIcon, SearchIcon, CodeIcon, ShieldIcon, LayersIcon, EyeIcon, TargetIcon, BookIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { specDrivenDevQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './SpecDrivenDev.css'

const STAGES = [
  { key: 'vibe-coding-problem', label: 'The Problem', tooltip: 'Why vibe coding breaks down' },
  { key: 'three-documents', label: 'Three Docs', tooltip: 'The three documents' },
  { key: 'writing-specs', label: 'Writing Specs', tooltip: 'Writing specs AI follows' },
  { key: 'worked-example', label: 'Full Example', tooltip: 'A complete worked example' },
]

const NEXT_LABELS = [
  'The three documents →',
  'Writing specs AI follows →',
  'A complete worked example →',
  'Show me what I learned →',
]

const TOOLKIT = [
  { concept: 'Requirements', when: 'Starting any project', phrase: 'What we are building and why', icon: <FileIcon size={24} color="#34C759" /> },
  { concept: 'Design', when: 'After requirements approved', phrase: 'How we will build it', icon: <LayersIcon size={24} color="#34C759" /> },
  { concept: 'Tasks', when: 'After design approved', phrase: 'Ordered implementation steps', icon: <BookIcon size={24} color="#34C759" /> },
  { concept: 'Out of Scope', when: 'Every requirements doc', phrase: 'The fence that keeps AI inside', icon: <ShieldIcon size={24} color="#34C759" /> },
  { concept: 'Review Gates', when: 'Between each document', phrase: 'Human reviews before AI proceeds', icon: <EyeIcon size={24} color="#34C759" /> },
  { concept: 'Success Conditions', when: 'Every task in tasks.md', phrase: 'Testable definition of done', icon: <TargetIcon size={24} color="#34C759" /> },
  { concept: 'AI as Drafter', when: 'design.md and tasks.md', phrase: 'AI generates, human corrects', icon: <CodeIcon size={24} color="#34C759" /> },
  { concept: 'Small Tasks', when: 'Breaking down work', phrase: 'One context window per task', icon: <SearchIcon size={24} color="#34C759" /> },
]

/* ─── Tool chips per stage ─── */
const STAGE_TOOLS = [
  /* Stage 0 */
  [],
  /* Stage 1 */
  [],
  /* Stage 2 */
  [],
  /* Stage 3 */
  [],
]

/* ─── Spec Transformer (split panel visualization) ─── */
function SpecTransformer({ variant }) {
  if (variant === 0) return <Stage0Transformer />
  if (variant === 1) return <Stage1Transformer />
  if (variant === 3) return <Stage3Transformer />
  return null
}

/* ─── Stage 0 Transformer: Vibe chat vs clean spec ─── */
function Stage0Transformer() {
  return (
    <div className="sdd-transformer">
      {/* Left: Vibe coding */}
      <div className="sdd-vibe-panel">
        <div className="sdd-panel-badge sdd-badge-vibe">Vibe Coding</div>
        <div className="sdd-chat-log">
          <div className="sdd-chat-msg sdd-chat-user">
            <span className="sdd-chat-role">You:</span> build me a todo app
          </div>
          <div className="sdd-chat-msg sdd-chat-ai">
            <span className="sdd-chat-role">AI:</span> Sure! Here&rsquo;s a basic todo app...
          </div>
          <div className="sdd-chat-msg sdd-chat-user">
            <span className="sdd-chat-role">You:</span> add user accounts
          </div>
          <div className="sdd-chat-msg sdd-chat-ai">
            <span className="sdd-chat-role">AI:</span> I&rsquo;ve added user authentication...
          </div>
          <div className="sdd-chat-msg sdd-chat-user">
            <span className="sdd-chat-role">You:</span> wait no, i meant google login
          </div>
          <div className="sdd-chat-msg sdd-chat-ai">
            <span className="sdd-chat-role">AI:</span> Of course! Let me change that...
          </div>
          <div className="sdd-chat-msg sdd-chat-user">
            <span className="sdd-chat-role">You:</span> also the style is wrong
          </div>
          <div className="sdd-chat-fade">...12 more corrections</div>
        </div>
        <div className="sdd-context-bar">
          <div className="sdd-context-label">Context</div>
          <div className="sdd-context-track">
            <div className="sdd-context-fill sdd-context-red" style={{ '--target-width': '87%' }} />
          </div>
          <div className="sdd-context-pct sdd-pct-red">87% full</div>
        </div>
      </div>

      {/* Right: Spec-driven */}
      <div className="sdd-spec-panel">
        <div className="sdd-panel-badge sdd-badge-spec">Spec-Driven</div>
        <div className="sdd-spec-doc">
          <div className="sdd-spec-heading"># Todo App &mdash; Requirements</div>
          <div className="sdd-spec-subheading">## What we&rsquo;re building</div>
          <div className="sdd-spec-text">A personal task manager with Google auth.</div>
          <div className="sdd-spec-subheading">## Core features</div>
          <div className="sdd-spec-check">
            <CheckIcon size={14} color="#34C759" /> Create / edit / delete tasks
          </div>
          <div className="sdd-spec-check">
            <CheckIcon size={14} color="#34C759" /> Google Sign-In only
          </div>
          <div className="sdd-spec-check">
            <CheckIcon size={14} color="#34C759" /> Tasks persist per user
          </div>
          <div className="sdd-spec-subheading">## Out of scope</div>
          <div className="sdd-spec-cross">
            <CrossIcon size={14} color="#FF3B30" /> Email auth
          </div>
          <div className="sdd-spec-cross">
            <CrossIcon size={14} color="#FF3B30" /> Sharing tasks
          </div>
        </div>
        <div className="sdd-reviewed-badge">
          <CheckIcon size={14} color="#34C759" />
          Spec reviewed &mdash; Build begins
        </div>
      </div>

      {/* Quality bars */}
      <div className="sdd-quality-bars">
        <div className="sdd-quality-row">
          <div className="sdd-quality-label">Vibe</div>
          <div className="sdd-quality-track">
            <div className="sdd-quality-fill sdd-fill-red" style={{ '--target-width': '35%' }} />
          </div>
          <div className="sdd-quality-text sdd-text-red">Unpredictable</div>
        </div>
        <div className="sdd-quality-row">
          <div className="sdd-quality-label">Spec</div>
          <div className="sdd-quality-track">
            <div className="sdd-quality-fill sdd-fill-green" style={{ '--target-width': '85%' }} />
          </div>
          <div className="sdd-quality-text sdd-text-green">Consistent</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Stage 1 Transformer: blob prompt vs three docs ─── */
function Stage1Transformer() {
  const [docTab, setDocTab] = useState(0)
  const docLabels = ['requirements.md', 'design.md', 'tasks.md']

  return (
    <div className="sdd-transformer">
      {/* Left: one big blob */}
      <div className="sdd-vibe-panel">
        <div className="sdd-panel-badge sdd-badge-vibe">Vibe Coding</div>
        <div className="sdd-blob-prompt">
          &ldquo;build me a todo app with user accounts and google login and a nice UI and dark mode and mobile support and maybe some filters and tags?&rdquo;
        </div>
        <div className="sdd-blob-badge">
          <CrossIcon size={14} color="#FF3B30" />
          No structure. No review point.
        </div>
      </div>

      {/* Right: three document tabs */}
      <div className="sdd-spec-panel">
          <div className="sdd-panel-badge sdd-badge-spec">Spec-Driven</div>
          <div className="sdd-doc-tabs">
            {docLabels.map((label, i) => (
              <button
                key={label}
                className={`sdd-doc-tab ${docTab === i ? 'sdd-doc-tab-active' : ''}`}
                onClick={() => setDocTab(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="sdd-doc-preview">
            {docTab === 0 && (
              <div className="sdd-doc-content sdd-fade-in">
                <div className="sdd-mini-heading">Problem</div>
                <div className="sdd-mini-text">Tasks get lost in notes apps. Need a dedicated tool.</div>
                <div className="sdd-mini-heading">Users</div>
                <div className="sdd-mini-text">Solo users managing personal tasks.</div>
                <div className="sdd-mini-heading">Features</div>
                <div className="sdd-mini-text">CRUD tasks, Google auth, persist per user.</div>
                <div className="sdd-mini-heading">Out of scope</div>
                <div className="sdd-mini-text">Email auth, team sharing, tags, dark mode v1.</div>
              </div>
            )}
            {docTab === 1 && (
              <div className="sdd-doc-content sdd-fade-in">
                <div className="sdd-mini-heading">Data model</div>
                <div className="sdd-mini-text">users(id, google_id, name), tasks(id, user_id, text, done)</div>
                <div className="sdd-mini-heading">Components</div>
                <div className="sdd-mini-text">AuthProvider, TaskList, TaskItem, AddTaskForm</div>
                <div className="sdd-mini-heading">API</div>
                <div className="sdd-mini-text">GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id</div>
              </div>
            )}
            {docTab === 2 && (
              <div className="sdd-doc-content sdd-fade-in">
                <div className="sdd-mini-heading">Task 1: Auth</div>
                <div className="sdd-mini-text">Google OAuth flow. Success: JWT returned.</div>
                <div className="sdd-mini-heading">Task 2: Data layer</div>
                <div className="sdd-mini-text">Supabase schema + RLS. Success: CRUD works per user.</div>
                <div className="sdd-mini-heading">Task 3: UI</div>
                <div className="sdd-mini-text">Task list + form. Success: create, toggle, delete tasks.</div>
              </div>
            )}
          </div>
          {/* Flow arrows */}
          <div className="sdd-flow-diagram">
            <span className={`sdd-flow-step ${docTab === 0 ? 'sdd-flow-step-active' : ''}`}>requirements</span>
            <span className="sdd-flow-arrow">
              <svg width="20" height="12" viewBox="0 0 20 12"><path d="M0 6h16M12 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className={`sdd-flow-step ${docTab === 1 ? 'sdd-flow-step-active' : ''}`}>design</span>
            <span className="sdd-flow-arrow">
              <svg width="20" height="12" viewBox="0 0 20 12"><path d="M0 6h16M12 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className={`sdd-flow-step ${docTab === 2 ? 'sdd-flow-step-active' : ''}`}>tasks</span>
            <span className="sdd-flow-arrow">
              <svg width="20" height="12" viewBox="0 0 20 12"><path d="M0 6h16M12 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="sdd-flow-step">build</span>
          </div>
        </div>

      {/* Quality bars */}
      <div className="sdd-quality-bars">
        <div className="sdd-quality-row">
          <div className="sdd-quality-label">Vibe</div>
          <div className="sdd-quality-track">
            <div className="sdd-quality-fill sdd-fill-red" style={{ '--target-width': '30%' }} />
          </div>
          <div className="sdd-quality-text sdd-text-red">One big guess</div>
        </div>
        <div className="sdd-quality-row">
          <div className="sdd-quality-label">Spec</div>
          <div className="sdd-quality-track">
            <div className="sdd-quality-fill sdd-fill-green" style={{ '--target-width': '90%' }} />
          </div>
          <div className="sdd-quality-text sdd-text-green">Three reviewable gates</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Stage 3 Transformer: correction rounds vs spec way ─── */
function Stage3Transformer() {
  return (
    <div className="sdd-transformer">
      {/* Left: old way */}
      <div className="sdd-vibe-panel">
        <div className="sdd-panel-badge sdd-badge-vibe">Old Way</div>
        <div className="sdd-correction-list">
          <div className="sdd-correction-item">Round 1: &ldquo;not what I meant&rdquo;</div>
          <div className="sdd-correction-item">Round 2: &ldquo;wrong auth provider&rdquo;</div>
          <div className="sdd-correction-item">Round 3: &ldquo;missing validation&rdquo;</div>
          <div className="sdd-correction-item">Round 4: &ldquo;undo the last change&rdquo;</div>
          <div className="sdd-correction-item">Round 5: &ldquo;context is confused&rdquo;</div>
          <div className="sdd-correction-item sdd-correction-fade">...7 more rounds</div>
        </div>
        <div className="sdd-timer-badge sdd-timer-red">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          ~3 hours of corrections
        </div>
      </div>

      {/* Right: spec way */}
      <div className="sdd-spec-panel">
        <div className="sdd-panel-badge sdd-badge-spec">Spec-Driven</div>
        <div className="sdd-spec-flow">
          <div className="sdd-spec-flow-step sdd-spec-flow-done">
            <CheckIcon size={16} color="#34C759" />
            <span>requirements.md reviewed</span>
          </div>
          <div className="sdd-spec-flow-step sdd-spec-flow-done">
            <CheckIcon size={16} color="#34C759" />
            <span>design.md reviewed</span>
          </div>
          <div className="sdd-spec-flow-step sdd-spec-flow-done">
            <CheckIcon size={16} color="#34C759" />
            <span>tasks.md reviewed</span>
          </div>
          <div className="sdd-spec-flow-divider" />
          <div className="sdd-spec-flow-step sdd-spec-flow-build">
            <CodeIcon size={16} color="#34C759" />
            <span>Implement from spec</span>
          </div>
        </div>
        <div className="sdd-timer-badge sdd-timer-green">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          ~30 min to spec, fast build
        </div>
      </div>

      {/* Quality bars */}
      <div className="sdd-quality-bars">
        <div className="sdd-quality-row">
          <div className="sdd-quality-label">Vibe</div>
          <div className="sdd-quality-track">
            <div className="sdd-quality-fill sdd-fill-red" style={{ '--target-width': '55%' }} />
          </div>
          <div className="sdd-quality-text sdd-text-red">Drifts over time</div>
        </div>
        <div className="sdd-quality-row">
          <div className="sdd-quality-label">Spec</div>
          <div className="sdd-quality-track">
            <div className="sdd-quality-fill sdd-fill-green" style={{ '--target-width': '92%' }} />
          </div>
          <div className="sdd-quality-text sdd-text-green">Consistent and reviewable</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Spec Comparator (Stage 2 interactive) ─── */
const COMPARATOR_EXAMPLES = [
  {
    title: 'Task description',
    poor: {
      label: 'Poor',
      text: 'Task 4: Add user authentication',
      score: 20,
      verdict: 'Untestable',
    },
    good: {
      label: 'Good',
      text: 'Task 4: Implement Google OAuth\nFiles: src/auth/google.ts, src/middleware/auth.ts\nSuccess: POST /auth/google returns JWT. Middleware rejects requests without valid JWT.\nTests: auth.test.ts — 3 tests pass.',
      score: 90,
      verdict: 'Testable',
    },
  },
  {
    title: 'Out of scope',
    poor: {
      label: 'Poor',
      text: '## Features\n- User accounts\n- Task management\n- Filters\n\n(No out-of-scope section)',
      score: 25,
      verdict: 'Scope creep guaranteed',
    },
    good: {
      label: 'Good',
      text: '## Features\n- User accounts\n- Task management\n\n## Out of scope\n- Email/password auth (Google only)\n- Sharing tasks between users\n- Tags or categories (v2)\n- Dark mode (v2)',
      score: 88,
      verdict: 'Scope protected',
    },
  },
  {
    title: 'Feature description',
    poor: {
      label: 'Poor',
      text: 'Users can manage their tasks',
      score: 15,
      verdict: 'Vague',
    },
    good: {
      label: 'Good',
      text: 'Users can create tasks (max 500 chars), mark them complete (strikethrough + grey), delete them (confirmation dialog), and filter by: All / Active / Completed. Tasks persist on page refresh.',
      score: 95,
      verdict: 'Precise',
    },
  },
]

function SpecComparator() {
  const [activeExample, setActiveExample] = useState(0)
  const [showGood, setShowGood] = useState([false, false, false])

  function toggleQuality(index) {
    setShowGood(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const example = COMPARATOR_EXAMPLES[activeExample]
  const isGood = showGood[activeExample]
  const current = isGood ? example.good : example.poor

  return (
    <div className="sdd-comparator">
      <div className="sdd-comparator-tabs">
        {COMPARATOR_EXAMPLES.map((ex, i) => (
          <button
            key={i}
            className={`sdd-comparator-tab ${activeExample === i ? 'sdd-comparator-tab-active' : ''}`}
            onClick={() => setActiveExample(i)}
          >
            {ex.title}
          </button>
        ))}
      </div>

      <div className="sdd-comparator-card">
        <div className="sdd-comparator-toggle">
          <button
            className={`sdd-toggle-option ${!isGood ? 'sdd-toggle-poor-active' : ''}`}
            onClick={() => { if (isGood) toggleQuality(activeExample) }}
          >
            <CrossIcon size={14} color={!isGood ? '#fff' : 'var(--text-tertiary)'} /> Poor
          </button>
          <button
            className={`sdd-toggle-option ${isGood ? 'sdd-toggle-good-active' : ''}`}
            onClick={() => { if (!isGood) toggleQuality(activeExample) }}
          >
            <CheckIcon size={14} color={isGood ? '#fff' : 'var(--text-tertiary)'} /> Good
          </button>
        </div>

        <div className={`sdd-comparator-content sdd-fade-in`} key={`${activeExample}-${isGood}`}>
          <div className="sdd-comparator-text">
            {current.text.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>

        <div className="sdd-comparator-bar">
          <div className="sdd-quality-track">
            <div
              className={`sdd-quality-fill ${isGood ? 'sdd-fill-green' : 'sdd-fill-red'}`}
              style={{ '--target-width': `${current.score}%` }}
              key={`${activeExample}-${isGood}-bar`}
            />
          </div>
          <div className={`sdd-quality-text ${isGood ? 'sdd-text-green' : 'sdd-text-red'}`}>
            {current.score}% — {current.verdict}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Document Viewer (Stage 3 specific) ─── */
const VIEWER_TABS = ['Prompt', 'requirements.md', 'design.md', 'tasks.md']

const VIEWER_CONTENT = {
  prompt: `I want to build a personal todo app. Here are my requirements:

- Users sign in with Google (no email/password)
- Users can create, edit, complete, and delete tasks
- Tasks persist per user across sessions
- No sharing, no tags, no dark mode in v1

Tech stack: React + Vite frontend, Supabase backend (auth + database).

Please generate three spec documents in docs/spec/:
1. requirements.md — what we are building and why
2. design.md — data model, components, API routes
3. tasks.md — ordered implementation steps with success conditions

Do NOT start building yet. Generate the docs for my review first.`,
  requirements: `# Todo App — Requirements Spec

## Problem
Tasks get lost across notes apps, browser tabs, and sticky notes.
Need a single dedicated tool that is fast, simple, and persistent.

## Users
Solo users managing personal tasks. No teams. No collaboration.

## Core Features
1. Google Sign-In (OAuth 2.0) — single click, no forms
2. Create tasks — text input, max 500 characters
3. Edit tasks — inline editing, save on blur
4. Complete tasks — toggle strikethrough + grey styling
5. Delete tasks — confirmation dialog before removal
6. Filter tasks — All / Active / Completed tabs
7. Persistence — tasks survive page refresh and re-login

## Out of Scope
- Email/password authentication
- Sharing tasks between users
- Tags, categories, or labels
- Dark mode (planned for v2)
- Due dates or reminders
- Drag-and-drop reordering

## Success Criteria
- New user: Google sign-in to first task created in under 30 seconds
- Returning user: page load to task list visible in under 2 seconds
- All CRUD operations persist immediately (no save button)`,
  design: `# Todo App — Design Spec

## Data Model (Supabase)

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| google_id | text | From OAuth, unique |
| name | text | Display name from Google |
| created_at | timestamptz | Default now() |

### tasks
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| user_id | uuid | FK to users, RLS enforced |
| text | text | Max 500 chars, not null |
| done | boolean | Default false |
| created_at | timestamptz | Default now() |

Row Level Security: users see only their own tasks.

## Components
- App.jsx — router, auth state
- AuthProvider.jsx — Google OAuth context
- TaskList.jsx — renders filtered task array
- TaskItem.jsx — single task with edit/toggle/delete
- AddTaskForm.jsx — input + submit
- FilterBar.jsx — All / Active / Completed tabs

## API Routes
- GET /tasks — list user tasks (RLS filtered)
- POST /tasks — create task (validate text length)
- PATCH /tasks/:id — update text or done status
- DELETE /tasks/:id — remove task (RLS enforced)

## Auth Flow
1. User clicks "Sign in with Google"
2. Supabase handles OAuth redirect
3. On callback: upsert user record, set session
4. AuthProvider stores session in context
5. All API calls include session JWT automatically`,
  tasks: `# Todo App — Implementation Tasks

## Task 1: Project Setup
Files: package.json, vite.config.js, src/main.jsx
Steps: Init Vite + React, install supabase-js, configure env vars.
Success: Dev server runs. Supabase client connects.
Tests: None (manual verification).

## Task 2: Database Schema
Files: supabase/migrations/001_init.sql
Steps: Create users + tasks tables, enable RLS, add policies.
Success: Tables exist. RLS blocks cross-user access.
Tests: Manual — insert as user A, query as user B returns empty.

## Task 3: Google OAuth
Files: src/AuthProvider.jsx, src/App.jsx
Steps: Configure Google OAuth in Supabase dashboard. Implement
signIn/signOut. Upsert user on first login.
Success: Sign-in redirects to Google, returns JWT. Sign-out clears
session. User record created on first login.
Tests: auth.test.js — sign-in returns session, sign-out clears it.

## Task 4: Task CRUD
Files: src/TaskList.jsx, src/TaskItem.jsx, src/AddTaskForm.jsx
Steps: Implement create, read, update (text + done), delete.
All operations via Supabase client with RLS.
Success: All four operations work. Changes persist on refresh.
Tests: tasks.test.js — CRUD operations, 500-char limit enforced.

## Task 5: Filtering
Files: src/FilterBar.jsx, src/TaskList.jsx
Steps: Add All/Active/Completed filter tabs. Filter task array
client-side based on done status.
Success: Each filter shows correct subset. Active tab highlighted.
Tests: filter.test.js — each filter returns correct items.

## Task 6: Polish and Deploy
Files: src/App.css, vercel.json
Steps: Style all components. Add loading states. Deploy to Vercel.
Success: Loads in under 2 seconds. All features work in production.
Tests: Manual end-to-end walkthrough.`,
}

const IMPLEMENTATION_PROMPT = `Read the three spec documents in docs/spec/ (requirements.md, design.md, tasks.md). Implement the tasks in order, starting with Task 1. After each task, verify the success conditions before moving to the next. Do not add features not listed in requirements. If a task is ambiguous, check the design doc before guessing.`

function DocumentViewer() {
  const [viewerTab, setViewerTab] = useState(0)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedImpl, setCopiedImpl] = useState(false)
  const copyTimerRef = useRef(null)
  const implTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      if (implTimerRef.current) clearTimeout(implTimerRef.current)
    }
  }, [])

  function copyPrompt() {
    navigator.clipboard.writeText(VIEWER_CONTENT.prompt)
    setCopiedPrompt(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopiedPrompt(false), 2000)
  }

  function copyImpl() {
    navigator.clipboard.writeText(IMPLEMENTATION_PROMPT)
    setCopiedImpl(true)
    if (implTimerRef.current) clearTimeout(implTimerRef.current)
    implTimerRef.current = setTimeout(() => setCopiedImpl(false), 2000)
  }

  const contentKeys = ['prompt', 'requirements', 'design', 'tasks']
  const currentKey = contentKeys[viewerTab]
  const currentContent = VIEWER_CONTENT[currentKey]
  const isSpecDoc = viewerTab > 0

  return (
    <div className="sdd-viewer">
      <div className="sdd-viewer-tabs">
        {VIEWER_TABS.map((label, i) => (
          <button
            key={label}
            className={`sdd-viewer-tab ${viewerTab === i ? 'sdd-viewer-tab-active' : ''}`}
            onClick={() => setViewerTab(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="sdd-viewer-body">
        {isSpecDoc && (
          <div className="sdd-viewer-status">
            <CheckIcon size={14} color="#34C759" />
            {viewerTab === 3 ? 'Ready to implement' : 'Reviewed and locked'}
          </div>
        )}
        {viewerTab === 0 && (
          <button className={`sdd-copy-btn ${copiedPrompt ? 'sdd-copy-btn-copied' : ''}`} onClick={copyPrompt}>
            {copiedPrompt ? (
              <>
                <CheckIcon size={12} color="#34C759" />
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                Copy
              </>
            )}
          </button>
        )}
        <pre className="sdd-viewer-pre">{currentContent}</pre>
      </div>

      {/* Implementation prompt */}
      <div className="sdd-impl-prompt">
        <div className="sdd-impl-label">Implementation prompt (after specs are reviewed):</div>
        <div className="sdd-impl-box">
          <pre className="sdd-impl-pre">{IMPLEMENTATION_PROMPT}</pre>
          <button className={`sdd-copy-btn sdd-copy-btn-impl ${copiedImpl ? 'sdd-copy-btn-copied' : ''}`} onClick={copyImpl}>
            {copiedImpl ? (
              <>
                <CheckIcon size={12} color="#34C759" />
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Stage Content ─── */
const STAGE_CONTENT = [
  /* Stage 0: The Vibe Coding Problem */
  {
    title: 'Why Vibe Coding Breaks Down',
    content: (
      <>
        <p>Vibe coding feels fast at first. You type a prompt, AI writes code, you tweak it, AI rewrites. For ten minutes, it works. Then four things go wrong at the same time.</p>

        <div className="sdd-failure-cards">
          <div className="sdd-failure-card">
            <div className="sdd-failure-title">
              <CrossIcon size={16} color="#FF3B30" />
              Context Rot
            </div>
            <p>Every correction fills the context window. By round 12, the AI is reasoning against a wall of contradictory instructions. Quality drops. Errors multiply. You start a new chat and lose everything.</p>
          </div>
          <div className="sdd-failure-card">
            <div className="sdd-failure-title">
              <CrossIcon size={16} color="#FF3B30" />
              &ldquo;That&rsquo;s Not What I Meant&rdquo;
            </div>
            <p>You said &ldquo;add user accounts.&rdquo; AI added email/password auth. You wanted Google Sign-In. Now you spend three rounds undoing and redoing. The spec was in your head. The AI cannot read your head.</p>
          </div>
          <div className="sdd-failure-card">
            <div className="sdd-failure-title">
              <CrossIcon size={16} color="#FF3B30" />
              No Checkpoint
            </div>
            <p>There is no point where you stop and say &ldquo;this is exactly what I want &mdash; now build it.&rdquo; Instead, requirements and code evolve together in an uncontrolled spiral. You cannot review what does not exist as a document.</p>
          </div>
          <div className="sdd-failure-card">
            <div className="sdd-failure-title">
              <CrossIcon size={16} color="#FF3B30" />
              Nothing to Hand Off
            </div>
            <p>When you finish, all you have is code and a messy chat log. No document explains what was built or why. New teammates, future-you, and other AI sessions have zero context.</p>
          </div>
        </div>

        <div className="sdd-root-cause">
          <div className="sdd-root-cause-title">The root cause</div>
          <div className="sdd-root-cause-text">Vibe coding conflates <span className="sdd-bold">deciding what to build</span> with <span className="sdd-bold">building it</span>. Spec-Driven Development separates them. You decide first. You write it down. Then AI builds from the written spec. The spec is the checkpoint. The spec is the handoff. The spec is what survives when the chat window closes.</div>
        </div>
      </>
    ),
    tip: 'The single biggest shift: stop treating the chat window as your workspace. Treat the spec document as your workspace. The chat window is just where you execute against it.',
  },
  /* Stage 1: Three Documents */
  {
    title: 'Three Documents, One Clear Build',
    content: (
      <>
        <p>Every project &mdash; whether it takes an hour or a month &mdash; benefits from three documents. They are short. They are concrete. And they give you three review gates where you can catch problems before any code is written.</p>

        <div className="sdd-doc-rules">
          <div className="sdd-rule">
            <div className="sdd-rule-header">
              <FileIcon size={18} color="#34C759" />
              <strong>requirements.md</strong> &mdash; What and Why
            </div>
            <p>The requirements document defines the problem, the users, and the features. It also defines what is explicitly <em>not</em> being built.</p>
            <div className="sdd-rule-must">Must answer:</div>
            <ul>
              <li>What problem are we solving?</li>
              <li>Who are the users?</li>
              <li>What are the core features (numbered, specific)?</li>
              <li>What is out of scope?</li>
              <li>What are the success criteria?</li>
            </ul>
          </div>

          <div className="sdd-rule">
            <div className="sdd-rule-header">
              <LayersIcon size={18} color="#34C759" />
              <strong>design.md</strong> &mdash; How
            </div>
            <p>The design document turns requirements into architecture. Data model. Components. API routes. Auth flow. This is where AI is most useful as a drafter &mdash; it surfaces questions you had not thought about.</p>
            <div className="sdd-rule-must">Must answer:</div>
            <ul>
              <li>What does the data model look like?</li>
              <li>What are the main components / modules?</li>
              <li>What API routes or endpoints exist?</li>
              <li>How does authentication work end-to-end?</li>
              <li>What are the key technical decisions and why?</li>
            </ul>
          </div>

          <div className="sdd-rule">
            <div className="sdd-rule-header">
              <BookIcon size={18} color="#34C759" />
              <strong>tasks.md</strong> &mdash; In What Order
            </div>
            <p>The task document breaks the design into ordered implementation steps. Each task is small enough to fit in one context window. Each task has a testable definition of done.</p>
            <div className="sdd-rule-must">Must answer:</div>
            <ul>
              <li>What files will be created or modified?</li>
              <li>What are the concrete steps?</li>
              <li>What are the success conditions (testable)?</li>
              <li>What tests verify completion?</li>
              <li>What is the dependency order?</li>
            </ul>
          </div>
        </div>

        <div className="sdd-gate-flow">
          <div className="sdd-gate-step">
            <div className="sdd-gate-label">You write</div>
            <div className="sdd-gate-doc">requirements.md</div>
          </div>
          <div className="sdd-gate-arrow">&rarr;</div>
          <div className="sdd-gate-step">
            <div className="sdd-gate-review"><EyeIcon size={14} color="#34C759" /> Review</div>
            <div className="sdd-gate-label">AI drafts, you review</div>
            <div className="sdd-gate-doc">design.md</div>
          </div>
          <div className="sdd-gate-arrow">&rarr;</div>
          <div className="sdd-gate-step">
            <div className="sdd-gate-review"><EyeIcon size={14} color="#34C759" /> Review</div>
            <div className="sdd-gate-label">AI drafts, you review</div>
            <div className="sdd-gate-doc">tasks.md</div>
          </div>
          <div className="sdd-gate-arrow">&rarr;</div>
          <div className="sdd-gate-step">
            <div className="sdd-gate-review"><EyeIcon size={14} color="#34C759" /> Review</div>
            <div className="sdd-gate-label">AI implements</div>
            <div className="sdd-gate-doc">Build</div>
          </div>
        </div>
      </>
    ),
    tip: 'The design document is where most time is saved. When AI drafts design.md from your requirements, it surfaces questions you had not thought about: "What happens when a user deletes their account?" Catching that in design costs nothing. Catching it in code costs hours.',
  },
  /* Stage 2: Writing Good Specs */
  {
    title: 'The Craft of a Good Spec',
    content: (
      <>
        <p>A mediocre spec produces mediocre code. A precise spec produces code that works the first time. Five rules separate the two.</p>

        <div className="sdd-rules-list">
          <div className="sdd-rule-item">
            <div className="sdd-rule-num">1</div>
            <div className="sdd-rule-body">
              <strong>Every requirement must be testable.</strong> If you cannot write a test for it, rewrite it until you can. &ldquo;Nice UI&rdquo; is not testable. &ldquo;Task text truncates at 500 characters with a visible counter&rdquo; is testable.
            </div>
          </div>
          <div className="sdd-rule-item">
            <div className="sdd-rule-num">2</div>
            <div className="sdd-rule-body">
              <strong>Out of scope is more important than in scope.</strong> AI loves to add features. An explicit out-of-scope section is the fence that keeps AI inside the yard. Without it, expect auth providers you did not ask for, dark modes you did not want, and features that break your timeline.
            </div>
          </div>
          <div className="sdd-rule-item">
            <div className="sdd-rule-num">3</div>
            <div className="sdd-rule-body">
              <strong>Tasks must be small.</strong> Each task should fit in one context window. If a task requires understanding the entire codebase, it is too big. Break it down until each task touches 2&ndash;4 files maximum.
            </div>
          </div>
          <div className="sdd-rule-item">
            <div className="sdd-rule-num">4</div>
            <div className="sdd-rule-body">
              <strong>Every task needs a definition of done.</strong> Not &ldquo;implement auth&rdquo; but &ldquo;POST /auth/google returns JWT. Middleware rejects requests without valid JWT. auth.test.ts passes 3 tests.&rdquo; The AI knows exactly when to stop.
            </div>
          </div>
          <div className="sdd-rule-item">
            <div className="sdd-rule-num">5</div>
            <div className="sdd-rule-body">
              <strong>You are the reviewer, not the author.</strong> Let AI draft design.md and tasks.md from your requirements. Your job is to read, correct, and lock &mdash; not to write from scratch. This is faster, catches more edge cases, and produces better documentation.
            </div>
          </div>
        </div>
      </>
    ),
    tip: 'The fastest way to improve any spec: read each line and ask "can I write a test for this?" If no — rewrite it until you can. Testable specs produce testable code. Untestable specs produce code that may or may not work.',
  },
  /* Stage 3: Worked Example */
  {
    title: 'From Zero to Spec in One Session',
    content: (
      <>
        <p>Here is the complete workflow for a real project. Four tabs show every document. The prompt generates all three specs. You review. Then one implementation prompt builds the entire app from the spec.</p>
      </>
    ),
    tip: 'Save these three files in your project at docs/spec/. They are now living documentation. When you add a feature in 3 months, you update the spec first. When a new teammate joins, you send them the spec first. The documents outlive any chat session.',
  },
]

/* ─── Main Component ─── */
export default function SpecDrivenDev({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('spec-driven-dev', -1)
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
    if (stage === 1 && !dismissedTips.has('three-docs')) {
      setLearnTip({ key: 'three-docs', text: 'Click through the three document tabs in the right panel. Notice how each one is progressively more concrete — requirements is about intent, design is about structure, tasks is about execution. That progression is the whole workflow in three files.' })
    } else if (stage === 2 && !dismissedTips.has('spec-comparator')) {
      setLearnTip({ key: 'spec-comparator', text: 'Try all three toggle examples in the spec comparator. The out-of-scope example is the most important one — seeing a requirements doc without a fence vs one with a fence makes the AI scope creep problem immediately obvious.' })
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
        markModuleComplete('spec-driven-dev')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.sdd-root')
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

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    reset()
    setShowWelcome(true)
  }

  /* ─── Quiz Screen ─── */
  if (showQuiz) {
    return (
      <div className="how-llms sdd-root quiz-fade-in">
        <Quiz
          questions={specDrivenDevQuiz}
          tabName="Spec-Driven Development"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="spec-driven-dev"
        />
      </div>
    )
  }

  /* ─── Entry Screen ─── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="spec-driven-dev" size={48} style={{ color: '#34C759' }} />}
        title="Spec-Driven Development"
        subtitle="Write the What Before the How"
        description="Every developer has felt it: you give AI a vague prompt, it builds the wrong thing, you correct it, context fills up, quality degrades. Spec-Driven Development breaks that cycle. Write a clear spec first. The AI builds from it. You review at milestones, not every line. Less friction. Better output. Every time."
        buttonText="Start Speccing"
        onStart={() => { setStage(0); markModuleStarted('spec-driven-dev') }}
      />
    )
  }

  const content = STAGE_CONTENT[stage] || STAGE_CONTENT[0]
  const tools = STAGE_TOOLS[stage] || []

  return (
    <div className={`how-llms sdd-root ${fading ? 'how-fading' : ''}`}>
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>

      {/* Welcome banner */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Spec-Driven Development</strong> &mdash; Four stages covering why vibe coding breaks down, the three documents every spec needs, how to write specs AI actually follows, and a complete worked example you can use today. No tooling required &mdash; just a text editor and Claude Code.
            <ol className="module-welcome-steps">
              <li>Learn why <strong>vibe coding breaks down</strong> after the first 10 minutes</li>
              <li>Master the <strong>three-document structure</strong> that replaces chaos with clarity</li>
              <li>See a <strong>complete worked example</strong> you can copy and adapt today</li>
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
            <div className="how-stepper sdd-stepper">
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
                {/* Info card */}
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>{content.title}</strong>
                  </div>
                  <div className="sdd-info-content">{content.content}</div>

                  {content.tip && (
                    <div className="how-info-tip">
                      <TipIcon size={16} color="#eab308" />
                      {content.tip}
                    </div>
                  )}

                  {tools.length > 0 && (
                    <ToolChips tools={tools} />
                  )}
                </div>

                {/* Visualization */}
                {stage === 0 && <SpecTransformer variant={0} />}
                {stage === 1 && <SpecTransformer variant={1} />}
                {stage === 2 && <SpecComparator />}
                {stage === 3 && (
                  <>
                    <DocumentViewer />
                    <SpecTransformer variant={3} />
                    <div className="sdd-final-line">
                      You know how to spec. Start your next feature with a document, not a prompt.
                    </div>
                  </>
                )}

                {/* Navigation */}
                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>
                        &larr; Back
                      </button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage} style={{ background: '#34C759' }}>
                      {NEXT_LABELS[stage]}
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
          <div className="how-final-celebration">You Know How to Spec</div>

          <div className="pe-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Spec-Driven Development Toolkit</div>
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

          <SuggestedModules currentModuleId="spec-driven-dev" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
