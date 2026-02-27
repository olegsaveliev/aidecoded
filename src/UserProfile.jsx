import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { useRelease } from './ReleaseContext'
import { NAV_GROUPS } from './NavDropdown.jsx'
import ALL_MODULES from './moduleData.js'
import {
  CheckIcon, StarIcon, ZapIcon, FlameIcon,
  FootprintIcon, TrophyIcon, CompassIcon, TargetIcon,
  LockIcon, PencilIcon, CalendarIcon,
  TrendingUpIcon, GlobeIcon, RocketIcon, WrenchIcon, SparklesIcon,
} from './ContentIcons.jsx'
import './UserProfile.css'

const TOTAL_MODULES = NAV_GROUPS.reduce((sum, g) => sum + g.items.length, 0)
const VALID_MODULE_IDS = new Set(NAV_GROUPS.flatMap(g => g.items.map(i => i.id)))

const BADGES = [
  // Tier 1 — Easy
  { id: 'first-step', name: 'First Step', hint: 'Start any module', icon: FootprintIcon, color: '#34C759', condition: (d) => d.startedCount > 0 },
  { id: 'quiz-taker', name: 'Quiz Taker', hint: 'Take any quiz', icon: StarIcon, color: '#F59E0B', condition: (d) => d.quizCount > 0 },
  { id: 'explorer', name: 'Explorer', hint: 'Start modules in 3+ categories', icon: CompassIcon, color: '#0071E3', condition: (d) => d.categoriesStarted >= 3 },
  { id: 'getting-serious', name: 'Getting Serious', hint: 'Complete 5 modules', icon: RocketIcon, color: '#5856D6', condition: (d) => d.completedCount >= 5 },
  // Tier 2 — Medium
  { id: 'on-a-roll', name: 'On a Roll', hint: 'Score 70%+ on 3 quizzes', icon: TrendingUpIcon, color: '#0071E3', condition: (d) => d.quizScoresOver70 >= 3 },
  { id: 'dedicated', name: 'Dedicated', hint: '7-day streak', icon: FlameIcon, color: '#FF3B30', condition: (d) => d.streak >= 7 },
  { id: 'toolmaster', name: 'Toolmaster', hint: 'Complete all Tools modules', icon: WrenchIcon, color: '#FF9500', condition: (d) => d.toolsGroupCompleted },
  { id: 'renaissance', name: 'Renaissance Learner', hint: 'Complete a module in every category', icon: GlobeIcon, color: '#AF52DE', condition: (d) => d.categoriesCompleted >= d.totalCategories },
  // Tier 3 — Hard
  { id: 'perfectionist', name: 'Perfectionist', hint: 'Score 100% on a quiz', icon: CheckIcon, color: '#34C759', condition: (d) => d.perfectQuizCount >= 1 },
  { id: 'overachiever', name: 'Overachiever', hint: 'Score 100% on 3 quizzes', icon: SparklesIcon, color: '#F59E0B', condition: (d) => d.perfectQuizCount >= 3 },
  { id: 'half-way', name: 'Half Way There', hint: 'Complete half of all modules', icon: TargetIcon, color: '#FF9500', condition: (d) => d.completedCount >= Math.ceil(d.totalModules / 2) },
  { id: 'knowledge-master', name: 'Knowledge Master', hint: 'Complete every module', icon: TrophyIcon, color: '#AF52DE', condition: (d) => d.completedCount >= d.totalModules },
]

function getScoreColor(score) {
  if (score === null) return 'var(--text-tertiary)'
  if (score >= 70) return '#34C759'
  if (score >= 50) return '#FF9500'
  return '#FF3B30'
}

function getGrade(score) {
  if (score === null) return null
  if (score >= 90) return { label: 'S', bg: '#34C75918', color: '#34C759' }
  if (score >= 70) return { label: 'A', bg: '#0071E318', color: '#0071E3' }
  if (score >= 50) return { label: 'B', bg: '#FF950018', color: '#FF9500' }
  return { label: 'C', bg: '#FF3B3018', color: '#FF3B30' }
}

function CompletedModuleCard({ mod, index, onSwitchTab }) {
  const hasQuiz = mod.scorePercent !== null
  const scoreColor = getScoreColor(mod.scorePercent)
  const grade = getGrade(mod.scorePercent)

  const ringSize = 44
  const r = 17
  const circ = 2 * Math.PI * r
  const targetOffset = hasQuiz ? circ * (1 - mod.scorePercent / 100) : circ

  const [ringOffset, setRingOffset] = useState(circ)
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setRingOffset(targetOffset)
      if (hasQuiz) setBarWidth(mod.scorePercent)
    }, 60 + index * 45)
    return () => clearTimeout(t)
  }, [targetOffset, index, mod.scorePercent, hasQuiz])

  return (
    <div
      className="up-cm-card"
      style={{ borderLeftColor: mod.tagColor, animationDelay: `${index * 45}ms` }}
      onClick={() => onSwitchTab(mod.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${mod.title} module`}
      onKeyDown={e => { if (e.key === 'Enter') onSwitchTab(mod.id) }}
    >
      <div className="up-cm-body">
        {hasQuiz ? (
          <div className="up-cm-score-ring">
            <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
              <circle cx={ringSize / 2} cy={ringSize / 2} r={r}
                fill="none" stroke="var(--bg-surface)" strokeWidth={3.5} />
              <circle
                className="up-ring-fill"
                cx={ringSize / 2} cy={ringSize / 2} r={r} fill="none"
                stroke={scoreColor} strokeWidth={3.5} strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div className="up-cm-score-label">
              <span className="up-cm-score-num" style={{ color: scoreColor }}>{mod.scorePercent}</span>
              <span className="up-cm-score-denom">/100</span>
            </div>
          </div>
        ) : (
          <div className="up-cm-no-quiz">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
              stroke="var(--text-tertiary)" strokeWidth={1.75}
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx={12} cy={12} r={10} />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1={12} y1={17} x2={12.01} y2={17} />
            </svg>
          </div>
        )}

        <div className="up-cm-info">
          <div className="up-cm-name">{mod.title}</div>
          <div className="up-cm-meta">
            <span className="up-cm-tag" style={{ background: mod.tagColor }}>{mod.tag}</span>
            {mod.completedAt && (
              <span className="up-cm-date">
                {new Date(mod.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {grade && (
              <span className="up-cm-grade" style={{ background: grade.bg, color: grade.color }}>
                {grade.label}
              </span>
            )}
          </div>
          {hasQuiz && (
            <button
              className="up-cm-retake"
              onClick={e => { e.stopPropagation(); onSwitchTab(mod.id) }}
            >
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.85" />
              </svg>
              Retake quiz
            </button>
          )}
        </div>

        {hasQuiz ? (
          <div className="up-cm-bar-wrap">
            <span className="up-cm-bar-score" style={{ color: scoreColor }}>
              {mod.scorePercent}<span className="up-cm-bar-max">/100</span>
            </span>
            <div className="up-cm-bar-track">
              <div className="up-cm-bar-fill" style={{ background: scoreColor, width: `${barWidth}%` }} />
            </div>
          </div>
        ) : (
          <span className="up-cm-no-quiz-label">No quiz</span>
        )}
      </div>
    </div>
  )
}

function CategoryCard({ cat, index, expanded, onToggle }) {
  const pct = cat.total > 0 ? cat.completed / cat.total : 0
  const pctInt = Math.round(pct * 100)
  const isDone = cat.completed === cat.total
  const r = 16
  const circ = 2 * Math.PI * r
  const targetOffset = circ * (1 - pct)

  const [ringOffset, setRingOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setRingOffset(targetOffset), 60 + index * 55)
    return () => clearTimeout(t)
  }, [targetOffset, index, circ])

  return (
    <div
      className="up-cat-card"
      style={{ borderLeftColor: cat.color, animationDelay: `${index * 55}ms` }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${cat.label} category, ${cat.completed} of ${cat.total} completed`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
    >
      <div className="up-cat-card-main">
        <div className="up-cat-radial-wrap">
          <svg width={40} height={40} viewBox="0 0 40 40">
            <circle cx={20} cy={20} r={r} fill="none" stroke="var(--bg-surface)" strokeWidth={4} />
            <circle
              className="up-ring-fill"
              cx={20} cy={20} r={r} fill="none"
              stroke={cat.color} strokeWidth={4} strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="up-cat-radial-label">
            {isDone ? (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth={2.5} strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <span style={{ fontSize: 9, fontWeight: 700, color: cat.color }}>{pctInt}%</span>
            )}
          </div>
        </div>

        <div className="up-cat-info">
          <div className="up-cat-info-top">
            <span className="up-cat-name">{cat.label}</span>
            <span className="up-cat-count">
              <span style={{ color: cat.color }}>{cat.completed}</span> / {cat.total}
            </span>
          </div>
          <div className="up-cat-segments">
            {cat.modules.map((mod, i) => (
              <div
                key={i}
                className="up-cat-segment"
                style={{
                  background: mod.done ? cat.color : 'var(--bg-surface)',
                  opacity: mod.done ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        </div>

        <svg
          className={`up-cat-chevron ${expanded ? 'up-cat-chevron-open' : ''}`}
          width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="var(--text-secondary)" strokeWidth={2} strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Always in DOM as display:flex — collapsed via max-height/opacity */}
      <div className={`up-cat-modules ${expanded ? 'up-cat-modules-visible' : ''}`}>
        {cat.modules.map(mod => (
          <div
            key={mod.name}
            className="up-cat-mod-pill"
            style={mod.done
              ? { background: `${cat.color}18`, color: cat.color, borderColor: `${cat.color}30` }
              : { background: 'var(--bg-surface)', color: 'var(--text-secondary)' }
            }
          >
            {mod.done ? (
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth={2.5} strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <div className="up-cat-mod-dot" />
            )}
            {mod.name}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressByCategory({ categoryProgress }) {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const totalCompleted = categoryProgress.reduce((s, c) => s + c.completed, 0)
  const totalModules = categoryProgress.reduce((s, c) => s + c.total, 0)
  const overallPct = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0

  const r = 16
  const circ = 2 * Math.PI * r
  const [ringOffset, setRingOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setRingOffset(circ * (1 - overallPct / 100)), 100)
    return () => clearTimeout(t)
  }, [circ, overallPct])

  return (
    <div className="up-categories">
      <div className="up-cat-header">
        <div className="up-cat-header-left">
          <h2>Progress by Category</h2>
          <p className="up-cat-header-sub">{totalCompleted} of {totalModules} modules completed</p>
        </div>
        <div className="up-cat-overall">
          <div className="up-cat-overall-donut">
            <svg width={40} height={40} viewBox="0 0 40 40">
              <circle cx={20} cy={20} r={r} fill="none" stroke="var(--bg-surface)" strokeWidth={3} />
              <circle
                className="up-ring-fill"
                cx={20} cy={20} r={r} fill="none" stroke="#0071E3" strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div className="up-cat-overall-pct">{overallPct}%</div>
          </div>
          <span className="up-cat-overall-label">Overall</span>
        </div>
      </div>

      <div className="up-cat-list">
        {categoryProgress.map((cat, i) => (
          <CategoryCard
            key={cat.label}
            cat={cat}
            index={i}
            expanded={expandedIndex === i}
            onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
          />
        ))}
      </div>

      <p className="up-cat-hint">Tap a category to see module breakdown</p>
    </div>
  )
}

function UserProfile({ onSwitchTab, onGoHome }) {
  const {
    user, progress, quizResults, startedModules,
    completedCount, updateDisplayName,
  } = useAuth()
  const { hiddenModules } = useRelease()
  const visibleTotal = TOTAL_MODULES - hiddenModules.size

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [sortMode, setSortMode] = useState('date')
  const [streak, setStreak] = useState(0)

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  // Streak — read/write localStorage on mount only (not inside useMemo)
  useEffect(() => {
    if (!user) return
    const streakKey = `streak_${user.id}`
    try {
      const saved = JSON.parse(localStorage.getItem(streakKey) || '{}')
      const today = new Date().toISOString().slice(0, 10)
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      if (saved.date === today) {
        setStreak(saved.count || 1)
      } else if (saved.date === yesterday) {
        const next = (saved.count || 0) + 1
        localStorage.setItem(streakKey, JSON.stringify({ date: today, count: next }))
        setStreak(next)
      } else {
        localStorage.setItem(streakKey, JSON.stringify({ date: today, count: 1 }))
        setStreak(1)
      }
    } catch { setStreak(1) }
  }, [user?.id])

  // Compute stats
  const stats = useMemo(() => {
    const completedSet = new Set(progress.map(p => p.module_id).filter(id => VALID_MODULE_IDS.has(id)))
    const quizCount = new Set(quizResults.map(q => q.module_id)).size
    const quizScores = quizResults.map(q => (q.score / q.max_score) * 100)
    const avgQuizScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0
    const hasPerfectQuiz = quizResults.some(q => q.score === q.max_score)

    const startedNotCompleted = startedModules.filter(id => !completedSet.has(id)).length
    const xp = (completedSet.size * 20) + (quizCount * 10) + (startedNotCompleted * 5)

    // Categories started (at least one module touched)
    const allStarted = new Set([...startedModules, ...Array.from(completedSet)])
    const categoriesStarted = NAV_GROUPS.filter(g =>
      g.items.some(item => allStarted.has(item.id))
    ).length

    // Categories completed (every module in the group done)
    const categoriesCompleted = NAV_GROUPS.filter(g =>
      g.items.every(item => completedSet.has(item.id))
    ).length

    // Tools group completion (dynamic — finds the "Tools" group by label)
    const toolsGroup = NAV_GROUPS.find(g => g.label === 'Tools')
    const toolsGroupCompleted = toolsGroup
      ? toolsGroup.items.every(item => completedSet.has(item.id))
      : false

    // Quiz score stats (best score per module)
    const bestScoreByModule = {}
    quizResults.forEach(q => {
      const pct = (q.score / q.max_score) * 100
      if (!bestScoreByModule[q.module_id] || pct > bestScoreByModule[q.module_id]) {
        bestScoreByModule[q.module_id] = pct
      }
    })
    const bestScores = Object.values(bestScoreByModule)
    const quizScoresOver70 = bestScores.filter(s => s >= 70).length
    const perfectQuizCount = bestScores.filter(s => s >= 100).length

    return {
      completedCount: completedSet.size,
      avgQuizScore,
      quizCount,
      xp,
      streak,
      hasPerfectQuiz,
      startedCount: allStarted.size,
      categoriesStarted,
      categoriesCompleted,
      toolsGroupCompleted,
      quizScoresOver70,
      perfectQuizCount,
      totalCategories: NAV_GROUPS.length,
      completedSet,
    }
  }, [progress, quizResults, startedModules, user, streak])

  // Flat module lookup from NAV_GROUPS (auto-updates when modules are added)
  const moduleMap = useMemo(() => {
    const map = {}
    NAV_GROUPS.forEach(group => {
      group.items.forEach(item => {
        const full = ALL_MODULES.find(m => m.id === item.id)
        map[item.id] = {
          id: item.id,
          title: full?.title || item.name,
          tag: full?.tag || group.label,
          tagColor: full?.tagColor || group.color,
        }
      })
    })
    return map
  }, [])

  // Progress by category
  const categoryProgress = useMemo(() => {
    return NAV_GROUPS.map(group => {
      const modules = group.items.map(item => ({
        name: item.name,
        done: stats.completedSet.has(item.id),
      }))
      const total = modules.length
      const completed = modules.filter(m => m.done).length
      return { label: group.label, color: group.color, completed, total, modules }
    })
  }, [stats.completedSet])

  // Badge data
  const badgeData = useMemo(() => {
    const d = {
      startedCount: stats.startedCount,
      completedCount: stats.completedCount,
      quizCount: stats.quizCount,
      hasPerfectQuiz: stats.hasPerfectQuiz,
      categoriesStarted: stats.categoriesStarted,
      categoriesCompleted: stats.categoriesCompleted,
      toolsGroupCompleted: stats.toolsGroupCompleted,
      quizScoresOver70: stats.quizScoresOver70,
      perfectQuizCount: stats.perfectQuizCount,
      totalCategories: stats.totalCategories,
      totalModules: visibleTotal,
      streak: stats.streak,
    }
    return BADGES.map(badge => ({
      ...badge,
      earned: badge.condition(d),
    }))
  }, [stats, visibleTotal])

  // Completed modules (base, unsorted) — uses moduleMap so new modules auto-populate
  const completedModulesBase = useMemo(() => {
    return progress
      .map(p => {
        const mod = moduleMap[p.module_id]
        if (!mod) return null
        const quizResult = quizResults
          .filter(q => q.module_id === p.module_id)
          .sort((a, b) => b.score - a.score)[0]
        const scorePercent = quizResult
          ? Math.round((quizResult.score / quizResult.max_score) * 100)
          : null
        return { ...mod, completedAt: p.completed_at, scorePercent }
      })
      .filter(Boolean)
  }, [progress, quizResults, moduleMap])

  const sortedCompletedModules = useMemo(() => {
    const list = [...completedModulesBase]
    if (sortMode === 'score') {
      return list.sort((a, b) => {
        if (a.scorePercent === null && b.scorePercent === null) return 0
        if (a.scorePercent === null) return 1
        if (b.scorePercent === null) return -1
        return b.scorePercent - a.scorePercent
      })
    }
    if (sortMode === 'az') return list.sort((a, b) => a.title.localeCompare(b.title))
    return list.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  }, [completedModulesBase, sortMode])

  const completedAvgScore = useMemo(() => {
    const withScore = completedModulesBase.filter(m => m.scorePercent !== null)
    if (withScore.length === 0) return null
    return Math.round(withScore.reduce((s, m) => s + m.scorePercent, 0) / withScore.length)
  }, [completedModulesBase])

  function handleStartEdit() {
    setEditName(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '')
    setEditing(true)
  }

  async function handleSave() {
    const trimmed = editName.trim()
    if (!trimmed) return
    setSaving(true)
    await updateDisplayName(trimmed)
    setSaving(false)
    setEditing(false)
  }

  function handleCancelEdit() {
    setEditing(false)
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancelEdit()
  }

  return (
    <div className="up-container">
      {/* Header */}
      <div className="up-header">
        <div className="up-info">
          {editing ? (
            <div className="up-edit-row">
              <input
                className="up-edit-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={handleEditKeyDown}
                autoFocus
                placeholder="Display name"
              />
              <button className="up-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="up-cancel-btn" onClick={handleCancelEdit}>Cancel</button>
            </div>
          ) : (
            <div className="up-name-row">
              <span className="up-name">{displayName}</span>
              <button className="up-edit-btn" onClick={handleStartEdit} aria-label="Edit display name">
                <PencilIcon size={16} />
              </button>
            </div>
          )}
          <div className="up-email">{user?.email}</div>
          {memberSince && (
            <div className="up-member-since">
              <CalendarIcon size={13} color="var(--text-tertiary)" />
              Member since {memberSince}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="up-stats">
        <div className="up-stat-card">
          <div className="up-stat-icon"><CheckIcon size={20} color="#34C759" /></div>
          <div className="up-stat-value">{stats.completedCount}<span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-tertiary)' }}>/{visibleTotal}</span></div>
          <div className="up-stat-label">Modules Completed</div>
        </div>
        <div className="up-stat-card">
          <div className="up-stat-icon"><StarIcon size={20} color="#F59E0B" /></div>
          <div className="up-stat-value">{stats.avgQuizScore}<span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-tertiary)' }}>%</span></div>
          <div className="up-stat-label">Quiz Score Avg</div>
        </div>
        <div className="up-stat-card">
          <div className="up-stat-icon"><ZapIcon size={20} color="#0071E3" /></div>
          <div className="up-stat-value">{stats.xp}</div>
          <div className="up-stat-label">Total XP</div>
        </div>
        <div className="up-stat-card">
          <div className="up-stat-icon"><FlameIcon size={20} color="#FF3B30" /></div>
          <div className="up-stat-value">{stats.streak}</div>
          <div className="up-stat-label">Day Streak</div>
        </div>
      </div>

      {/* Progress by Category */}
      <ProgressByCategory categoryProgress={categoryProgress} />

      {/* Achievements */}
      <div className="up-achievements">
        <h2 className="up-section-title">Achievements</h2>
        <div className="up-badges-grid">
          {badgeData.map(badge => {
            const Icon = badge.icon
            return (
              <div key={badge.id} className={`up-badge-card ${badge.earned ? '' : 'up-badge-locked'}`}>
                <div className="up-badge-icon" style={badge.earned ? { background: `${badge.color}14` } : undefined}>
                  <Icon size={24} color={badge.earned ? badge.color : 'var(--text-tertiary)'} />
                </div>
                <span className="up-badge-name">{badge.name}</span>
                {!badge.earned && (
                  <>
                    <span className="up-badge-hint">{badge.hint}</span>
                    <span className="up-badge-lock-overlay">
                      <LockIcon size={14} color="var(--text-tertiary)" />
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Completed Modules */}
      <div className="up-completed">
        <div className="up-cm-header">
          <div className="up-cm-header-left">
            <h2>Completed Modules</h2>
            <p className="up-cm-header-sub">
              {completedModulesBase.length} modules completed
              {completedAvgScore !== null && <> &middot; Avg score {completedAvgScore}/100</>}
            </p>
          </div>
          {completedModulesBase.length > 0 && (
            <div className="up-cm-sort-pills">
              {[
                { key: 'date', label: 'Recent' },
                { key: 'score', label: 'Score' },
                { key: 'az', label: 'A\u2013Z' },
              ].map(s => (
                <button
                  key={s.key}
                  className={`up-cm-sort-pill ${sortMode === s.key ? 'up-cm-sort-pill-active' : ''}`}
                  onClick={() => setSortMode(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {sortedCompletedModules.length === 0 ? (
          <div className="up-cm-empty">
            <div className="up-cm-empty-icon">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
                stroke="var(--text-secondary)" strokeWidth={1.5} strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>No modules completed yet</h3>
            <p>Start learning to see your progress here</p>
            <button className="up-empty-cta" onClick={onGoHome}>
              Start learning &rarr;
            </button>
          </div>
        ) : (
          <div className="up-cm-list" key={sortMode}>
            {sortedCompletedModules.map((mod, i) => (
              <CompletedModuleCard
                key={mod.id}
                mod={mod}
                index={i}
                onSwitchTab={onSwitchTab}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
