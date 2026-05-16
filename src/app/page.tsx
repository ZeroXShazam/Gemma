'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signUp, signOut } from '@/lib/auth-client'
import { defaultSRS, computeNext, previewIntervals } from '@/lib/srs'
import { speak, cancelSpeech, ttsAvailable } from '@/lib/tts'
import {
  ALL_TYPES, ALL_LANGUAGES, LANGUAGE_LABELS,
  type SRSState, type SRSCard, type Rating, type CardType, type CardDef, type Language, type Example,
} from '@/lib/types'

const NEW_DAILY_LIMIT = 20

const TYPE_LABELS: Record<CardType, string> = {
  verb: 'Verbs', noun: 'Nouns', prep: 'Prepositions',
  wh: 'Wh-words', pronoun: 'Pronouns', possessive: 'Possessives',
  adjective: 'Adjectives', modal: 'Modals', perfekt: 'Perfekt',
  negation: 'Negation', comparative: 'Comparative',
  reflexive: 'Reflexive', conjunction: 'Conjunctions',
}

const VERB_EN: Record<string, string> = {
  sein: 'to be', haben: 'to have', gehen: 'to go', kommen: 'to come',
  lesen: 'to read', essen: 'to eat', trinken: 'to drink', fahren: 'to drive',
  sprechen: 'to speak', sehen: 'to see', nehmen: 'to take', geben: 'to give',
  finden: 'to find', wissen: 'to know', machen: 'to do', arbeiten: 'to work',
  wohnen: 'to live', lernen: 'to learn', heißen: 'to be called', helfen: 'to help',
  schlafen: 'to sleep', verstehen: 'to understand', bleiben: 'to stay',
  treffen: 'to meet', denken: 'to think', schreiben: 'to write',
  bringen: 'to bring', laufen: 'to run',
  können: 'can', müssen: 'must', wollen: 'to want', sollen: 'should',
  dürfen: 'may', mögen: 'to like', möchten: 'would like',
}

const RATING_CFG = [
  { r: 'again' as Rating, label: 'Again', color: '#f87171', key: '1' },
  { r: 'hard'  as Rating, label: 'Hard',  color: '#fb923c', key: '2' },
  { r: 'good'  as Rating, label: 'Good',  color: '#60a5fa', key: '3' },
  { r: 'easy'  as Rating, label: 'Easy',  color: '#34d399', key: '4' },
]

function todayStr() { return new Date().toISOString().slice(0, 10) }

function canonicalFocus(focus: string | string[]): string {
  return Array.isArray(focus) ? focus[0] : focus
}

function acceptableFocuses(focus: string | string[]): string[] {
  return Array.isArray(focus) ? focus : [focus]
}

const REVERSE_PROBABILITY = 0.33
const RECENT_MAX = 5

function pickReverse(card: SRSCard | undefined): boolean {
  if (!card) return false
  if (card.state !== 'review' && card.state !== 'mature') return false
  if (card.type === 'prep') return false // prep uses choice chips, no production
  return Math.random() < REVERSE_PROBABILITY
}

function pickExampleIdx(card: SRSCard): number {
  const len = card.examples.length
  if (len <= 1) return 0
  const misses = card.exampleMisses ?? {}
  const weights = card.examples.map((_, i) => (misses[String(i)] ?? 0) + 1)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return len - 1
}

function pushResult(s: string, ok: boolean): string {
  const next = s + (ok ? '1' : '0')
  return next.length > RECENT_MAX ? next.slice(-RECENT_MAX) : next
}

function yesterdayStr(today: string): string {
  const d = new Date(today + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

function nextStreak(s: Settings, today: string): { streakDays: number; lastReviewDate: string } {
  if (s.lastReviewDate === today) return { streakDays: s.streakDays, lastReviewDate: today }
  if (s.lastReviewDate === yesterdayStr(today)) return { streakDays: s.streakDays + 1, lastReviewDate: today }
  return { streakDays: 1, lastReviewDate: today }
}

function expandNounFocus(ex: Example, noun: string): Example {
  const c = canonicalFocus(ex.focus)
  const expected = `${c} ${noun}`
  if (!ex.de.includes(expected)) return ex
  const expanded = acceptableFocuses(ex.focus).map((f) => `${f} ${noun}`)
  return { ...ex, focus: expanded.length === 1 ? expanded[0] : expanded }
}

function blankParts(de: string, focus: string | string[]): [string, string] {
  const c = canonicalFocus(focus)
  const i = de.indexOf(c)
  return i === -1 ? [de, ''] : [de.slice(0, i), de.slice(i + c.length)]
}

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function answerOk(input: string, focus: string | string[]): boolean {
  const n = normalize(input)
  return acceptableFocuses(focus).some((f) => normalize(f) === n)
}

interface Settings {
  enabledTypes: CardType[]
  newCardsToday: number
  todayDate: string
  totalReviewed: number
  activeLanguage: Language
  streakDays: number
  lastReviewDate: string
}

const DEFAULT_SETTINGS: Settings = {
  enabledTypes: [...ALL_TYPES],
  newCardsToday: 0,
  todayDate: '',
  totalReviewed: 0,
  activeLanguage: 'de',
  streakDays: 0,
  lastReviewDate: '',
}

function buildQueue(cards: CardDef[], pm: Record<string, SRSState>, s: Settings, lv: string): SRSCard[] {
  const now = Date.now()
  const today = todayStr()
  const newToday = s.todayDate === today ? s.newCardsToday : 0
  const budget = Math.max(0, NEW_DAILY_LIMIT - newToday)

  const learning: SRSCard[] = []
  const review: SRSCard[] = []
  const newCards: SRSCard[] = []

  const allNew: SRSCard[] = []

  for (const card of cards) {
    if (lv !== 'All' && card.level !== lv) continue
    if (!s.enabledTypes.includes(card.type)) continue
    const srs = pm[card.id] ?? defaultSRS()
    const sc = { ...card, ...srs } as SRSCard
    if (srs.state === 'learning' && srs.due <= now) learning.push(sc)
    else if ((srs.state === 'review' || srs.state === 'mature') && srs.due <= now) review.push(sc)
    else if (srs.state === 'new') allNew.push(sc)
  }

  for (let i = allNew.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allNew[i], allNew[j]] = [allNew[j], allNew[i]]
  }
  newCards.push(...allNew.slice(0, budget))

  const all = [...learning, ...review, ...newCards]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all
}

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

function CardBack({ card }: { card: SRSCard }) {
  const c = card.conjugations

  if ((card.type === 'verb' || card.type === 'modal') && c) {
    const rows: [string, string][] = [
      ['ich', c.ich],       ['wir', c.wir],
      ['du', c.du],         ['ihr', c.ihr],
      ['er/sie/es', c.er],  ['sie/Sie', c.sie],
    ]
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#ededed' }}>{card.verb}</div>
          {card.verb && VERB_EN[card.verb] && (
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{VERB_EN[card.verb]}</div>
          )}
        </div>
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
    const art = card.article!
    const gc = art === 'der' ? '#60a5fa' : art === 'die' ? '#f472b6' : '#34d399'
    return (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', flex: 1, padding: '12px 8px', background: '#1a1a1a', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Singular</div>
          <div style={{ fontWeight: 700, color: gc, fontSize: 20 }}>{art} {card.noun}</div>
        </div>
        <div style={{ color: '#333', fontSize: 18 }}>/</div>
        <div style={{ textAlign: 'center', flex: 1, padding: '12px 8px', background: '#1a1a1a', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Plural</div>
          <div style={{ fontWeight: 700, color: '#ededed', fontSize: 20 }}>die {card.plural}</div>
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

function Trainer({ onSignOut }: { onSignOut: () => void }) {
  const [cards, setCards]       = useState<CardDef[]>([])
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
  const [reverse, setReverse]   = useState(false)
  const [choices, setChoices]   = useState<string[]>([])
  const inputEl = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])

  async function fetchCards(language: Language): Promise<CardDef[]> {
    const res = await fetch(`/api/cards?language=${language}`)
    const data = await res.json()
    return Array.isArray(data) ? (data as CardDef[]) : []
  }

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
            exampleMisses: (row.example_misses ?? {}) as Record<string, number>,
            recentResults: typeof row.recent_results === 'string' ? row.recent_results : '',
          }
        }
      }
      const loaded: Settings = sr
        ? {
            enabledTypes: (sr.enabled_types ?? [...ALL_TYPES]) as CardType[],
            newCardsToday: sr.new_cards_today ?? 0,
            todayDate: sr.today_date ?? '',
            totalReviewed: sr.total_reviewed ?? 0,
            activeLanguage: (sr.active_language ?? 'de') as Language,
            streakDays: sr.streak_days ?? 0,
            lastReviewDate: sr.last_review_date ?? '',
          }
        : DEFAULT_SETTINGS
      const fetched = await fetchCards(loaded.activeLanguage)
      setCards(fetched)
      setPm(map)
      setSettings(loaded)
      const q = buildQueue(fetched, map, loaded, lv)
      setQueue(q)
      setIdx(0)
      setPhase('cloze')
      setInput('')
      setChecked(false)
      setCorrect(false)
      if (q.length > 0) {
        const first = q[0] as SRSCard
        setExIdx(pickExampleIdx(first))
        setReverse(pickReverse(first))
      }
    } finally {
      setLoading(false)
    }
  }

  function applyQueueChange(newCards: CardDef[], newPm: Record<string, SRSState>, newSettings: Settings, newLv: string) {
    const q = buildQueue(newCards, newPm, newSettings, newLv)
    setQueue(q)
    setIdx(0)
    setPhase('cloze')
    setInput('')
    setChecked(false)
    setCorrect(false)
    if (q.length > 0) {
      const first = q[0] as SRSCard
      setExIdx(pickExampleIdx(first))
      setReverse(pickReverse(first))
    }
    setTimeout(() => inputEl.current?.focus(), 50)
  }

  function changeLevel(newLv: 'A1' | 'A2' | 'All') {
    setLv(newLv)
    applyQueueChange(cards, pm, settings, newLv)
  }

  function changeTypes(newTypes: CardType[]) {
    const ns = { ...settings, enabledTypes: newTypes }
    setSettings(ns)
    applyQueueChange(cards, pm, ns, lv)
    fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabledTypes: ns.enabledTypes, newCardsToday: ns.newCardsToday, todayDate: ns.todayDate, totalReviewed: ns.totalReviewed, activeLanguage: ns.activeLanguage }),
    })
  }

  async function changeLanguage(newLang: Language) {
    if (newLang === settings.activeLanguage) return
    setLoading(true)
    try {
      const ns = { ...settings, activeLanguage: newLang }
      setSettings(ns)
      const fetched = await fetchCards(newLang)
      setCards(fetched)
      applyQueueChange(fetched, pm, ns, lv)
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledTypes: ns.enabledTypes, newCardsToday: ns.newCardsToday, todayDate: ns.todayDate, totalReviewed: ns.totalReviewed, activeLanguage: ns.activeLanguage }),
      })
    } finally {
      setLoading(false)
    }
  }

  const card = queue[idx] as SRSCard | undefined
  const baseEx = card ? card.examples[exIdx % card.examples.length] : undefined
  const ex = baseEx && card?.type === 'noun' && card.noun ? expandNounFocus(baseEx, card.noun) : baseEx
  const intervals = card ? previewIntervals(card) : null

  useEffect(() => {
    if (!card || card.type !== 'prep' || !card.word) { setChoices([]); return }
    const allWords = [...new Set(cards.filter(c => c.type === 'prep' && c.word && c.word !== card.word).map(c => c.word!))]
    const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, 3)
    setChoices([...shuffled, card.word].sort(() => Math.random() - 0.5))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id, exIdx])

  function recordCheck(ok: boolean) {
    if (!card) return
    const cardId = card.id
    setPm(prev => {
      const cur = prev[cardId] ?? defaultSRS()
      const updated: SRSState = {
        ...cur,
        exampleMisses: ok ? cur.exampleMisses : {
          ...cur.exampleMisses,
          [String(exIdx)]: (cur.exampleMisses[String(exIdx)] ?? 0) + 1,
        },
        recentResults: pushResult(cur.recentResults, ok),
      }
      return { ...prev, [cardId]: updated }
    })
  }

  function doCheck() {
    if (!ex || checked) return
    const ok = answerOk(input, ex.focus)
    setCorrect(ok)
    setChecked(true)
    recordCheck(ok)
    if (ok) setTimeout(() => setPhase('flip'), 800)
  }

  function pickChoice(value: string) {
    if (!ex || checked) return
    const ok = answerOk(value, ex.focus)
    setInput(value)
    setCorrect(ok)
    setChecked(true)
    recordCheck(ok)
    if (ok) setTimeout(() => setPhase('flip'), 800)
  }

  async function doRate(rating: Rating) {
    if (!card || saving) return
    setSaving(true)
    const wasNew = card.state === 'new'
    const latest = pm[card.id] ?? defaultSRS()
    const next = computeNext({ ...card, ...latest }, rating)
    const newPm = { ...pm, [card.id]: next }
    setPm(newPm)
    const today = todayStr()
    const streak = nextStreak(settings, today)
    const ns: Settings = {
      ...settings,
      newCardsToday: wasNew
        ? (settings.todayDate === today ? settings.newCardsToday + 1 : 1)
        : settings.newCardsToday,
      todayDate: wasNew ? today : settings.todayDate,
      totalReviewed: settings.totalReviewed + 1,
      streakDays: streak.streakDays,
      lastReviewDate: streak.lastReviewDate,
    }
    setSettings(ns)
    await Promise.all([
      fetch('/api/user/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          ease: next.ease, interval: next.interval, reps: next.reps, lapses: next.lapses,
          due: next.due, state: next.state, step: next.step,
          exampleMisses: next.exampleMisses,
          recentResults: next.recentResults,
        }),
      }),
      fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabledTypes: ns.enabledTypes, newCardsToday: ns.newCardsToday,
          todayDate: ns.todayDate, totalReviewed: ns.totalReviewed,
          activeLanguage: ns.activeLanguage,
          streakDays: ns.streakDays, lastReviewDate: ns.lastReviewDate,
        }),
      }),
    ])
    setSaving(false)
    const nextIdx = idx + 1
    if (nextIdx < queue.length) {
      const nextCard = queue[nextIdx]
      const nextSrs = newPm[nextCard.id] ?? defaultSRS()
      const enriched = { ...nextCard, ...nextSrs } as SRSCard
      setIdx(nextIdx)
      setPhase('cloze')
      setInput('')
      setChecked(false)
      setCorrect(false)
      setExIdx(pickExampleIdx(enriched))
      setReverse(pickReverse(enriched))
      setTimeout(() => inputEl.current?.focus(), 50)
    } else {
      setIdx(queue.length)
    }
  }

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
        if (e.key === ' ' && ex) { e.preventDefault(); speak(ex.de, settings.activeLanguage); return }
        const map: Record<string, Rating> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' }
        const r = map[e.key]
        if (r) doRate(r)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, checked, correct, saving, card, input, ex])

  useEffect(() => {
    if (phase === 'flip' && ex) speak(ex.de, settings.activeLanguage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, card?.id, exIdx])

  useEffect(() => () => cancelSpeech(), [])

  const now = Date.now()
  const today = todayStr()
  const filtered = cards.filter(c =>
    (lv === 'All' || c.level === lv) && settings.enabledTypes.includes(c.type)
  )
  const dueN   = filtered.filter(c => { const s = pm[c.id]; return s && (s.state === 'review' || s.state === 'mature') && s.due <= now }).length
  const learnN = filtered.filter(c => { const s = pm[c.id]; return s && s.state === 'learning' && s.due <= now }).length
  const budget = Math.max(0, NEW_DAILY_LIMIT - (settings.todayDate === today ? settings.newCardsToday : 0))
  const newN   = Math.min(budget, filtered.filter(c => !pm[c.id] || pm[c.id].state === 'new').length)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
        Loading your progress…
      </div>
    )
  }

  if (!card || idx >= queue.length) {
    const isEmptyDeck = cards.length === 0
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ededed', gap: 16, padding: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 48, lineHeight: 1 }}>{isEmptyDeck ? '∅' : '✓'}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          {isEmptyDeck
            ? `No ${LANGUAGE_LABELS[settings.activeLanguage]} cards yet`
            : queue.length === 0 ? 'All caught up!' : 'Session complete!'}
        </h2>
        <p style={{ color: '#555', margin: 0 }}>
          {isEmptyDeck
            ? 'This deck is empty. Switch to another language or seed cards.'
            : queue.length === 0
              ? 'No cards due right now.'
              : `Reviewed ${queue.length} card${queue.length !== 1 ? 's' : ''} · Total: ${settings.totalReviewed}`}
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {ALL_LANGUAGES.map(l => (
            <button key={l} onClick={() => changeLanguage(l)} style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid #222', cursor: 'pointer',
              background: settings.activeLanguage === l ? '#222' : 'transparent',
              color: settings.activeLanguage === l ? '#ededed' : '#666',
              fontWeight: 600, fontSize: 13,
            }}>{LANGUAGE_LABELS[l]}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {!isEmptyDeck && <button onClick={loadData} style={sBtnPrimary}>Start New Session</button>}
          <button onClick={onSignOut} style={sBtnSecondary}>Sign Out</button>
        </div>
      </div>
    )
  }

  const [before, after] = ex ? blankParts(ex.de, ex.focus) : ['', '']
  const hint = reverse
    ? (card?.verb ?? card?.noun ?? card?.word ?? null)
    : ((card?.type === 'noun' || card?.type === 'prep') ? null : (card?.verb ?? card?.word ?? null))

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ededed' }} onClick={() => setShowMenu(false)}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>Gemma</span>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          <Pill c="#60a5fa">{learnN} learn</Pill>
          <Pill c="#f59e0b">{dueN} due</Pill>
          <Pill c="#34d399">{newN} new</Pill>
          {settings.streakDays > 0 && (
            <Pill c="#f97316">🔥 {settings.streakDays}</Pill>
          )}
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
                <div style={{ fontSize: 11, color: '#444', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Language</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {ALL_LANGUAGES.map(l => (
                    <button key={l} onClick={() => changeLanguage(l)} style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, border: '1px solid #222',
                      background: settings.activeLanguage === l ? '#222' : 'transparent',
                      color: settings.activeLanguage === l ? '#ededed' : '#666',
                      fontWeight: 600, fontSize: 12, cursor: 'pointer',
                    }}>{LANGUAGE_LABELS[l]}</button>
                  ))}
                </div>
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

      {/* Progress bar */}
      <div style={{ height: 2, background: '#1a1a1a' }}>
        <div style={{ height: '100%', background: '#3b82f6', width: `${(idx / queue.length) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Card */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>
            {TYPE_LABELS[card.type]} · {card.level} · {card.state}{reverse && phase === 'cloze' ? ' · ⇄ reverse' : ''}
            {(pm[card.id]?.recentResults ?? '').length > 0 && (
              <span style={{ marginLeft: 8, letterSpacing: 1 }}>
                {(pm[card.id]?.recentResults ?? '').split('').map((r, i) => (
                  <span key={i} style={{ color: r === '1' ? '#34d399' : '#f87171' }}>
                    {r === '1' ? '✓' : '✗'}
                  </span>
                ))}
              </span>
            )}
          </span>
          <span style={{ fontSize: 12, color: '#333' }}>{idx + 1} / {queue.length}</span>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '24px 20px' }}>

          {/* Phase 1: Cloze — inline input inside the sentence (or reverse: prompt only) */}
          {phase === 'cloze' && ex && (
            <>
              {reverse ? (
                <div>
                  <div style={{ fontSize: 11, color: '#444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    EN → DE · Translate the missing piece
                  </div>
                  <div style={{ fontSize: 18, color: '#ccc', marginBottom: 16, lineHeight: 1.5 }}>{ex.en}</div>
                  {!checked ? (
                    <input
                      ref={inputEl}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doCheck() } }}
                      autoFocus
                      placeholder="Type the German…"
                      style={{
                        ...sInput,
                        fontSize: 20,
                        borderColor: '#3b82f6',
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1px solid ${correct ? '#34d399' : '#f87171'}`,
                      background: correct ? '#34d39912' : '#f8717112',
                      color: correct ? '#34d399' : '#f87171',
                      fontSize: 20, fontWeight: 700, textAlign: 'center',
                    }}>
                      {canonicalFocus(ex.focus)}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 22, lineHeight: 2.2 }}>
                  <span>{before}</span>
                  {!checked ? (
                    <input
                      ref={inputEl}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doCheck() } }}
                      autoFocus
                      style={{
                        display: 'inline-block',
                        width: Math.max(canonicalFocus(ex.focus).length * 14, 80),
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '2px solid #3b82f6',
                        color: '#ededed',
                        fontSize: 22,
                        fontFamily: 'inherit',
                        outline: 'none',
                        padding: '0 4px',
                        margin: '0 2px',
                        textAlign: 'center',
                        verticalAlign: 'baseline',
                      }}
                    />
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      minWidth: Math.max(canonicalFocus(ex.focus).length * 14, 80),
                      borderBottom: `2px solid ${correct ? '#34d399' : '#f87171'}`,
                      color: correct ? '#34d399' : '#f87171',
                      textAlign: 'center', margin: '0 2px', fontWeight: 700, padding: '0 4px',
                    }}>
                      {canonicalFocus(ex.focus)}
                    </span>
                  )}
                  <span>{after}</span>
                </div>
              )}

              {card.type === 'prep' && choices.length > 0 && !checked && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {choices.map(c => (
                    <button key={c} onClick={() => pickChoice(c)} style={{
                      padding: '6px 16px', borderRadius: 20,
                      border: '1px solid #2a2a2a', background: '#1a1a1a',
                      color: '#ccc', cursor: 'pointer', fontSize: 15, fontFamily: 'inherit',
                    }}>{c}</button>
                  ))}
                </div>
              )}

              {(hint || ex.subject === 'sie') && !checked && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
                  {hint && (
                    <span style={{ fontSize: 13, color: '#444', fontStyle: 'italic' }}>{hint}</span>
                  )}
                  {ex.subject === 'sie' && (
                    <span style={{ fontSize: 11, color: '#3b3b3b', background: '#1a1a1a', padding: '2px 7px', borderRadius: 4 }}>
                      sie = they &nbsp;·&nbsp; Sie = formal you
                    </span>
                  )}
                </div>
              )}

              {checked && !correct && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ color: '#f87171', fontWeight: 600, marginBottom: ex.note ? 6 : 14 }}>
                    The answer was <span style={{ color: '#ededed' }}>
                      {'"' + acceptableFocuses(ex.focus).join('" / "') + '"'}
                    </span>
                  </p>
                  {ex.note && (
                    <p style={{ color: '#888', fontSize: 13, marginBottom: 14, fontStyle: 'italic' }}>{ex.note}</p>
                  )}
                  <button onClick={() => setPhase('flip')} style={sBtnPrimary}>Continue →</button>
                </div>
              )}
            </>
          )}

          {/* Phase 2: Flip / Rate */}
          {phase === 'flip' && ex && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 22, lineHeight: 1.6, flex: 1 }}>
                  <span>{before}</span>
                  <span style={{ color: '#60a5fa', fontWeight: 700 }}>{canonicalFocus(ex.focus)}</span>
                  <span>{after}</span>
                </div>
                {ttsAvailable() && (
                  <button
                    onClick={() => speak(ex.de, settings.activeLanguage)}
                    title="Replay (Space)"
                    aria-label="Replay audio"
                    style={{
                      background: 'transparent', border: '1px solid #222', borderRadius: 6,
                      color: '#777', cursor: 'pointer', fontSize: 14, padding: '4px 8px',
                      marginTop: 4, lineHeight: 1,
                    }}
                  >🔊</button>
                )}
              </div>
              <div style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>{ex.en}</div>

              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 20, marginBottom: 20 }}>
                <CardBack card={card} />
              </div>

              <div style={{ marginBottom: 24 }}>
                {card.examples.map((e, i) => (
                  <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: '#0d0d0d', borderRadius: 8 }}>
                    <div style={{ fontSize: 14, color: '#bbb' }}>{e.de}</div>
                    <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{e.en}</div>
                  </div>
                ))}
              </div>

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

function Pill({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 12, color: c, background: `${c}22`, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
      {children}
    </span>
  )
}

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
