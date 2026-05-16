'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signUp, signOut } from '@/lib/auth-client'
import { CARDS_DATA, ALL_TYPES } from '@/lib/cards'
import { defaultSRS, computeNext, previewIntervals } from '@/lib/srs'
import type { SRSState, SRSCard, Rating, CardType } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const NEW_DAILY_LIMIT = 20

const TYPE_LABELS: Record<CardType, string> = {
  verb: 'Verbs', noun: 'Nouns', prep: 'Prepositions',
  wh: 'Wh-words', pronoun: 'Pronouns', possessive: 'Possessives',
  adjective: 'Adjectives', modal: 'Modals', perfekt: 'Perfekt',
  negation: 'Negation', comparative: 'Comparative',
  reflexive: 'Reflexive', conjunction: 'Conjunctions',
}

const RATING_CFG = [
  { r: 'again' as Rating, label: 'Again', color: '#f87171', key: '1' },
  { r: 'hard'  as Rating, label: 'Hard',  color: '#fb923c', key: '2' },
  { r: 'good'  as Rating, label: 'Good',  color: '#60a5fa', key: '3' },
  { r: 'easy'  as Rating, label: 'Easy',  color: '#34d399', key: '4' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().slice(0, 10) }

function blankParts(de: string, focus: string): [string, string] {
  const i = de.indexOf(focus)
  return i === -1 ? [de, ''] : [de.slice(0, i), de.slice(i + focus.length)]
}

function answerOk(input: string, focus: string): boolean {
  return input.trim().toLowerCase() === focus.toLowerCase()
}

// ─── Settings type ────────────────────────────────────────────────────────────

interface Settings {
  enabledTypes: CardType[]
  newCardsToday: number
  todayDate: string
  totalReviewed: number
}

const DEFAULT_SETTINGS: Settings = {
  enabledTypes: [...ALL_TYPES],
  newCardsToday: 0,
  todayDate: '',
  totalReviewed: 0,
}

// ─── Queue builder ────────────────────────────────────────────────────────────

function buildQueue(pm: Record<string, SRSState>, s: Settings, lv: string): SRSCard[] {
  const now = Date.now()
  const today = todayStr()
  const newToday = s.todayDate === today ? s.newCardsToday : 0
  const budget = Math.max(0, NEW_DAILY_LIMIT - newToday)

  const learning: SRSCard[] = []
  const review: SRSCard[] = []
  const newCards: SRSCard[] = []

  for (const card of CARDS_DATA) {
    if (lv !== 'All' && card.level !== lv) continue
    if (!s.enabledTypes.includes(card.type)) continue

    const srs = pm[card.id] ?? defaultSRS()
    const sc = { ...card, ...srs } as SRSCard

    if (srs.state === 'learning' && srs.due <= now) {
      learning.push(sc)
    } else if ((srs.state === 'review' || srs.state === 'mature') && srs.due <= now) {
      review.push(sc)
    } else if (srs.state === 'new' && newCards.length < budget) {
      newCards.push(sc)
    }
  }

  return [...learning, ...review, ...newCards]
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const sInput: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8,
  color: '#ededed', fontSize: 15, outline: 'none',
}
const sBtnPrimary: React.CSSProperties = {
  padding: '10px 20px', background: '#ededed', color: '#0a0a0a',
  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
}
const sBtnSecondary: React.CSSProperties = {
  padding: '10px 20px', background: 'transparent', color: '#ccc',
  border: '1px solid #2a2a2a', borderRadius: 8, fontWeight: 600, fontSize: 14,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ─── AuthForm ─────────────────────────────────────────────────────────────────

function AuthForm() {
  const [tab, setTab]           = useState<'in' | 'up'>('in')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [err, setErr]           = useState('')
  const [busy, setBusy]         = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (tab === 'in') {
        const { error } = await signIn.email({ email, password })
        if (error) setErr(error.message ?? 'Sign in failed')
      } else {
        const { error } = await signUp.email({ email, password, name })
        if (error) setErr(error.message ?? 'Sign up failed')
      }
    } catch (e: unknown) {
      setErr((e as Error)?.message ?? 'Something went wrong')
    }
    setBusy(false)
  }

  const tabBtn = (t: 'in' | 'up', label: string) => (
    <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
      flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
      background: tab === t ? '#262626' : 'transparent',
      color: tab === t ? '#ededed' : '#555', fontWeight: 600, fontSize: 13,
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 360, background: '#111', border: '1px solid #222', borderRadius: 12, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#ededed', textAlign: 'center' }}>Gemma</h1>
        <p style={{ fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 24 }}>German A1–A2 Trainer</p>

        <div style={{ display: 'flex', marginBottom: 24, background: '#0a0a0a', borderRadius: 8, padding: 3 }}>
          {tabBtn('in', 'Sign In')}
          {tabBtn('up', 'Sign Up')}
        </div>

        <form onSubmit={submit}>
          {tab === 'up' && (
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)}
              required style={{ ...sInput, marginBottom: 10 }} />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            required style={{ ...sInput, marginBottom: 10 }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            required style={{ ...sInput, marginBottom: err ? 10 : 16 }} />
          {err && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <button type="submit" disabled={busy} style={{ ...sBtnPrimary, width: '100%', marginBottom: 16 }}>
            {busy ? 'Loading…' : tab === 'in' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#222' }} />
          <span style={{ color: '#444', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#222' }} />
        </div>

        <button
          onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
          style={{ ...sBtnSecondary, width: '100%', gap: 8 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}

// ─── CardBack ─────────────────────────────────────────────────────────────────

function CardBack({ card }: { card: SRSCard }) {
  const c = card.conjugations

  if ((card.type === 'verb' || card.type === 'modal') && c) {
    const rows: [string, string][] = [
      ['ich', c.ich], ['du', c.du], ['er/sie/es', c.er],
      ['wir', c.wir], ['ihr', c.ihr], ['sie/Sie', c.sie],
    ]
    return (
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#ededed', marginBottom: 12 }}>{card.verb}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 16px', marginBottom: 12 }}>
          {rows.map(([p, v]) => (
            <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#1a1a1a', borderRadius: 4 }}>
              <span style={{ color: '#555', fontSize: 13 }}>{p}</span>
              <span style={{ color: '#ededed', fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#555', display: 'flex', gap: 16 }}>
          <span>Prät.: <span style={{ color: '#888' }}>{card.praeteritum}</span></span>
          <span>Perf.: <span style={{ color: '#888' }}>{card.perfekt}</span></span>
        </div>
      </div>
    )
  }

  if (card.type === 'noun' && card.nounForms) {
    const f = card.nounForms
    const art = card.article!
    const gc = art === 'der' ? '#60a5fa' : art === 'die' ? '#f472b6' : '#34d399'
    return (
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: gc, marginBottom: 16 }}>{art} {card.noun}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {(['Nom', 'Akk', 'Dat'] as const).map((cas, i) => (
            <div key={cas} style={{ textAlign: 'center', padding: '10px 8px', background: '#1a1a1a', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{cas}</div>
              <div style={{ fontWeight: 700, color: gc, fontSize: 16 }}>{[f.nom, f.akk, f.dat][i]}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{card.noun}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (card.rule) {
    return (
      <div style={{ fontSize: 14, color: '#ccc', lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: card.rule }} />
    )
  }

  return null
}

// ─── Trainer ──────────────────────────────────────────────────────────────────

function Trainer({ onSignOut }: { onSignOut: () => void }) {
  const [pm, setPm]             = useState<Record<string, SRSState>>({})
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [lv, setLv]             = useState<'A1' | 'A2' | 'All'>('All')
  const [queue, setQueue]       = useState<SRSCard[]>([])
  const [idx, setIdx]           = useState(0)
  const [phase, setPhase]       = useState<'cloze' | 'flip'>('cloze')
  const [input, setInput]       = useState('')
  const [checked, setChecked]   = useState(false)
  const [correct, setCorrect]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [exIdx, setExIdx]       = useState(0)
  const inputEl = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [pr, sr] = await Promise.all([
        fetch('/api/user/progress').then(r => r.json()),
        fetch('/api/user/settings').then(r => r.json()),
      ])

      const map: Record<string, SRSState> = {}
      if (Array.isArray(pr)) {
        for (const row of pr) {
          map[row.card_id] = {
            ease: row.ease, interval: row.interval_days, reps: row.reps,
            lapses: row.lapses, due: row.due, state: row.state, step: row.step,
          }
        }
      }

      const loaded: Settings = sr
        ? {
            enabledTypes: (sr.enabled_types ?? [...ALL_TYPES]) as CardType[],
            newCardsToday: sr.new_cards_today ?? 0,
            todayDate: sr.today_date ?? '',
            totalReviewed: sr.total_reviewed ?? 0,
          }
        : DEFAULT_SETTINGS

      setPm(map)
      setSettings(loaded)
      const q = buildQueue(map, loaded, lv)
      setQueue(q)
      setIdx(0)
      setPhase('cloze')
      setInput('')
      setChecked(false)
      setCorrect(false)
      if (q.length > 0) setExIdx(0)
    } finally {
      setLoading(false)
    }
  }

  function applyQueueChange(newPm: Record<string, SRSState>, newSettings: Settings, newLv: string) {
    const q = buildQueue(newPm, newSettings, newLv)
    setQueue(q)
    setIdx(0)
    setPhase('cloze')
    setInput('')
    setChecked(false)
    setCorrect(false)
    if (q.length > 0) setExIdx(0)
    setTimeout(() => inputEl.current?.focus(), 50)
  }

  function changeLevel(newLv: 'A1' | 'A2' | 'All') {
    setLv(newLv)
    applyQueueChange(pm, settings, newLv)
  }

  function changeTypes(newTypes: CardType[]) {
    const ns = { ...settings, enabledTypes: newTypes }
    setSettings(ns)
    applyQueueChange(pm, ns, lv)
    fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabledTypes: ns.enabledTypes, newCardsToday: ns.newCardsToday, todayDate: ns.todayDate, totalReviewed: ns.totalReviewed }),
    })
  }

  const card = queue[idx] as SRSCard | undefined
  const ex = card ? card.examples[exIdx % card.examples.length] : undefined
  const intervals = card ? previewIntervals(card) : null

  function doCheck() {
    if (!ex || checked) return
    const ok = answerOk(input, ex.focus)
    setCorrect(ok)
    setChecked(true)
    if (ok) setTimeout(() => setPhase('flip'), 800)
  }

  async function doRate(rating: Rating) {
    if (!card || saving) return
    setSaving(true)

    const wasNew = card.state === 'new'
    const next = computeNext(card, rating)
    const newPm = { ...pm, [card.id]: next }
    setPm(newPm)

    const today = todayStr()
    const ns: Settings = {
      ...settings,
      newCardsToday: wasNew
        ? (settings.todayDate === today ? settings.newCardsToday + 1 : 1)
        : settings.newCardsToday,
      todayDate: wasNew ? today : settings.todayDate,
      totalReviewed: settings.totalReviewed + 1,
    }
    setSettings(ns)

    await Promise.all([
      fetch('/api/user/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, ease: next.ease, interval: next.interval, reps: next.reps, lapses: next.lapses, due: next.due, state: next.state, step: next.step }),
      }),
      fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledTypes: ns.enabledTypes, newCardsToday: ns.newCardsToday, todayDate: ns.todayDate, totalReviewed: ns.totalReviewed }),
      }),
    ])

    setSaving(false)

    const nextIdx = idx + 1
    if (nextIdx < queue.length) {
      setIdx(nextIdx)
      setPhase('cloze')
      setInput('')
      setChecked(false)
      setCorrect(false)
      setExIdx(Math.floor(Math.random() * queue[nextIdx].examples.length))
      setTimeout(() => inputEl.current?.focus(), 50)
    } else {
      setIdx(queue.length) // triggers done screen
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Enter') {
          e.preventDefault()
          if (phase === 'cloze') {
            if (!checked) doCheck()
            else if (!correct) setPhase('flip')
          }
        }
        return
      }
      if (phase === 'flip' && !saving) {
        const map: Record<string, Rating> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' }
        const r = map[e.key]
        if (r) doRate(r)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, checked, correct, saving, card, input, ex])

  // Stats counters
  const now = Date.now()
  const today = todayStr()
  const filtered = CARDS_DATA.filter(c =>
    (lv === 'All' || c.level === lv) && settings.enabledTypes.includes(c.type)
  )
  const dueN = filtered.filter(c => {
    const s = pm[c.id]
    return s && (s.state === 'review' || s.state === 'mature') && s.due <= now
  }).length
  const learnN = filtered.filter(c => {
    const s = pm[c.id]
    return s && s.state === 'learning' && s.due <= now
  }).length
  const budget = Math.max(0, NEW_DAILY_LIMIT - (settings.todayDate === today ? settings.newCardsToday : 0))
  const newN = Math.min(budget, filtered.filter(c => !pm[c.id] || pm[c.id].state === 'new').length)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
        Loading your progress…
      </div>
    )
  }

  // Done / empty screen
  if (!card || idx >= queue.length) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ededed', gap: 16, padding: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 48, lineHeight: 1 }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          {queue.length === 0 ? 'All caught up!' : 'Session complete!'}
        </h2>
        <p style={{ color: '#555', margin: 0 }}>
          {queue.length === 0
            ? 'No cards due right now.'
            : `Reviewed ${queue.length} card${queue.length !== 1 ? 's' : ''} · Total: ${settings.totalReviewed}`}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={loadData} style={sBtnPrimary}>Start New Session</button>
          <button onClick={onSignOut} style={sBtnSecondary}>Sign Out</button>
        </div>
      </div>
    )
  }

  const [before, after] = ex ? blankParts(ex.de, ex.focus) : ['', '']

  return (
    <div
      style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ededed' }}
      onClick={() => setShowMenu(false)}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>Gemma</span>

        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          <Pill c="#60a5fa">{learnN} learn</Pill>
          <Pill c="#f59e0b">{dueN} due</Pill>
          <Pill c="#34d399">{newN} new</Pill>
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {(['A1', 'A2', 'All'] as const).map(l => (
            <button key={l} onClick={e => { e.stopPropagation(); changeLevel(l) }} style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: lv === l ? '#222' : 'transparent',
              color: lv === l ? '#ededed' : '#555', fontWeight: 600, fontSize: 13,
            }}>{l}</button>
          ))}

          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowMenu(!showMenu)} style={{
              padding: '4px 10px', border: '1px solid #222', borderRadius: 6,
              background: 'transparent', color: '#666', cursor: 'pointer', fontSize: 14,
            }}>⋯</button>

            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%',
                background: '#111', border: '1px solid #222', borderRadius: 10,
                padding: '12px 16px', width: 210, zIndex: 200, boxShadow: '0 8px 32px #000c',
              }}>
                <div style={{ fontSize: 11, color: '#444', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Card Types</div>
                {ALL_TYPES.map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.enabledTypes.includes(t)}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...settings.enabledTypes, t]
                          : settings.enabledTypes.filter(x => x !== t)
                        changeTypes(next)
                      }} />
                    <span style={{ fontSize: 13, color: '#bbb' }}>{TYPE_LABELS[t]}</span>
                  </label>
                ))}
                <div style={{ borderTop: '1px solid #1e1e1e', marginTop: 12, paddingTop: 12 }}>
                  <button onClick={onSignOut} style={{ ...sBtnSecondary, width: '100%', fontSize: 12, padding: '7px 0' }}>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <div style={{ height: 2, background: '#1a1a1a' }}>
        <div style={{
          height: '100%', background: '#3b82f6',
          width: `${(idx / queue.length) * 100}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* ── Card area ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>
            {TYPE_LABELS[card.type]} · {card.level} · {card.state}
          </span>
          <span style={{ fontSize: 12, color: '#333' }}>{idx + 1} / {queue.length}</span>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '24px 20px' }}>

          {/* ── Phase 1: Cloze ────────────────────────────────────────── */}
          {phase === 'cloze' && ex && (
            <>
              <div style={{ fontSize: 22, lineHeight: 1.6, marginBottom: 6 }}>
                <span>{before}</span>
                <span style={{
                  display: 'inline-block',
                  minWidth: Math.max(ex.focus.length * 11, 48),
                  borderBottom: `2px solid ${checked ? (correct ? '#34d399' : '#f87171') : '#3b82f6'}`,
                  color: checked ? (correct ? '#34d399' : '#f87171') : 'transparent',
                  textAlign: 'center', margin: '0 2px', fontWeight: 700,
                }}>
                  {checked ? ex.focus : '    '}
                </span>
                <span>{after}</span>
              </div>

              <div style={{ fontSize: 14, color: '#444', marginBottom: 20 }}>{ex.en}</div>

              {!checked ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    ref={inputEl}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doCheck() } }}
                    placeholder="Type the missing word…"
                    autoFocus
                    style={{ ...sInput, flex: 1 }}
                  />
                  <button onClick={doCheck} style={sBtnPrimary}>Check</button>
                </div>
              ) : correct ? (
                <p style={{ color: '#34d399', fontWeight: 600 }}>Correct — revealing card…</p>
              ) : (
                <div>
                  <p style={{ color: '#f87171', fontWeight: 600, marginBottom: 14 }}>
                    Incorrect — the answer was <span style={{ color: '#ededed' }}>"{ex.focus}"</span>
                  </p>
                  <button onClick={() => setPhase('flip')} style={sBtnPrimary}>
                    Continue →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Phase 2: Flip / Rate ──────────────────────────────────── */}
          {phase === 'flip' && ex && (
            <>
              <div style={{ fontSize: 22, lineHeight: 1.6, marginBottom: 6 }}>
                <span>{before}</span>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{ex.focus}</span>
                <span>{after}</span>
              </div>
              <div style={{ fontSize: 14, color: '#444', marginBottom: 20 }}>{ex.en}</div>

              {/* Card back */}
              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 20, marginBottom: 20 }}>
                <CardBack card={card} />
              </div>

              {/* All examples */}
              <div style={{ marginBottom: 24 }}>
                {card.examples.map((e, i) => (
                  <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: '#0d0d0d', borderRadius: 8 }}>
                    <div style={{ fontSize: 14, color: '#bbb' }}>{e.de}</div>
                    <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{e.en}</div>
                  </div>
                ))}
              </div>

              {/* Rating buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {RATING_CFG.map(({ r, label, color, key }) => (
                  <button key={r} onClick={() => doRate(r)} disabled={saving} style={{
                    padding: '10px 4px', borderRadius: 8,
                    border: `1px solid ${color}44`, background: `${color}12`,
                    color, cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: 13, opacity: saving ? 0.5 : 1,
                  }}>
                    <div>{label}</div>
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{intervals?.[r]}</div>
                    <div style={{ fontSize: 10, opacity: 0.4, marginTop: 1 }}>[{key}]</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

function Pill({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 12, color: c, background: `${c}22`,
      padding: '2px 8px', borderRadius: 20, fontWeight: 600,
    }}>
      {children}
    </span>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
        Loading…
      </div>
    )
  }

  if (!session) return <AuthForm />
  return <Trainer onSignOut={() => signOut()} />
}
