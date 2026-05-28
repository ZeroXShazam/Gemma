'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signUp, signOut } from '@/lib/auth-client'
import { defaultSRS, computeNext, previewIntervals } from '@/lib/srs'
import { speak, cancelSpeech, ttsAvailable } from '@/lib/tts'
import {
  ALL_TYPES, ALL_LANGUAGES, LANGUAGE_LABELS,
  type SRSState, type SRSCard, type Rating, type CardType, type CardDef, type Language, type Example,
} from '@/lib/types'
import { ALL_SECTION_IDS, cardSection, sectionTitle, type SectionId } from '@/lib/curriculum-de'
import { CurriculumSidebar } from '@/components/CurriculumSidebar'
import { mixQueue, sortNewCardsForBudget } from '@/lib/deck-queue'
import {
  DEFAULT_TRAINER_DIFFICULTY,
  acceptableFocuses,
  applyNounStudyMode,
  canonicalFocus,
  pickExampleIdx,
  pickReverse,
  resolveLemmaHint,
  showPrepChoices,
} from '@/lib/trainer-pick'
import { gradeAnswer } from '@/lib/grading'

const DEFAULT_NEW_LIMIT_SUGGESTION = 20 // shown as placeholder in the limit input

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

const RECENT_MAX = 5
const MAX_FLIP_EXAMPLES = 5

function blankParts(de: string, focus: string | string[]): [string, string] {
  const c = canonicalFocus(focus)
  const i = de.indexOf(c)
  return i === -1 ? [de, ''] : [de.slice(0, i), de.slice(i + c.length)]
}

// Pick at most MAX_FLIP_EXAMPLES examples to show on the flip side.
// Always include the just-answered example first, then fill remaining
// slots preferring examples with a different caseLabel for variety.
function pickFlipExamples(examples: Example[], currentIdx: number): Example[] {
  if (examples.length <= MAX_FLIP_EXAMPLES) return examples
  const current = examples[currentIdx % examples.length]
  const rest = examples.filter((_, i) => i !== (currentIdx % examples.length))
  const picked: Example[] = [current]
  const seenCases = new Set<string>()
  if (current.caseLabel) seenCases.add(current.caseLabel)
  for (const e of rest) {
    if (picked.length >= MAX_FLIP_EXAMPLES) break
    if (e.caseLabel && !seenCases.has(e.caseLabel)) {
      picked.push(e)
      seenCases.add(e.caseLabel)
    }
  }
  for (const e of rest) {
    if (picked.length >= MAX_FLIP_EXAMPLES) break
    if (!picked.includes(e)) picked.push(e)
  }
  return picked
}

// True when the lemma hint would substantially reveal the answer.
// Catches exact matches and same-stem declensions (welcher/welchem, mein/meinen, …).
function lemmaRevealsFocus(hint: string, focuses: string[]): boolean {
  const nh = normalize(hint)
  if (nh.length === 0) return true
  for (const f of focuses) {
    const nf = normalize(f)
    if (nh === nf) return true
    if (nh.length >= 3 && (nf.startsWith(nh) || nh.startsWith(nf))) return true
    let i = 0
    while (i < Math.min(nh.length, nf.length) && nh[i] === nf[i]) i++
    if (i >= 4) return true
  }
  return false
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

function answerOk(input: string, focus: string | string[], ex?: Example, card?: CardDef): boolean {
  if (ex) return gradeAnswer(input, ex, card).ok
  const n = normalize(input)
  return acceptableFocuses(focus).some((f) => normalize(f) === n)
}

type Theme = 'dark' | 'light'

interface Settings {
  enabledTypes: CardType[]
  enabledSections: SectionId[]
  newCardsToday: number
  todayDate: string
  totalReviewed: number
  activeLanguage: Language
  streakDays: number
  lastReviewDate: string
  dailyNewLimit: number | null  // null = unlimited
  theme: Theme
  nounHardMode: boolean
  hideHintsAfterNew: boolean
  reverseRateMature: number
  prepProduction: boolean
  preferGrammarNew: boolean
  hideEasyGen: boolean
}

const DEFAULT_SETTINGS: Settings = {
  enabledTypes: [...ALL_TYPES],
  enabledSections: [...ALL_SECTION_IDS],
  newCardsToday: 0,
  todayDate: '',
  totalReviewed: 0,
  activeLanguage: 'de',
  streakDays: 0,
  lastReviewDate: '',
  dailyNewLimit: null,
  theme: 'dark',
  ...DEFAULT_TRAINER_DIFFICULTY,
  preferGrammarNew: false,
  hideEasyGen: true,
}

function cardInQueue(card: CardDef, s: Settings, lv: string): boolean {
  if (lv !== 'All' && card.level !== lv) return false
  if (s.hideEasyGen && card.source === 'gen' && card.difficulty === 'easy') return false
  if (s.activeLanguage === 'de') {
    if (s.enabledSections.length === 0) return false
    return s.enabledSections.includes(cardSection(card))
  }
  return s.enabledTypes.includes(card.type)
}

function buildQueue(cards: CardDef[], pm: Record<string, SRSState>, s: Settings, lv: string): SRSCard[] {
  const now = Date.now()
  const today = todayStr()
  const newToday = s.todayDate === today ? s.newCardsToday : 0
  const budget = s.dailyNewLimit === null
    ? Number.POSITIVE_INFINITY
    : Math.max(0, s.dailyNewLimit - newToday)

  const learning: SRSCard[] = []
  const review: SRSCard[] = []
  const newCards: SRSCard[] = []

  const allNew: SRSCard[] = []

  for (const card of cards) {
    if (!cardInQueue(card, s, lv)) continue
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
  const sortedNew = sortNewCardsForBudget(allNew, s.preferGrammarNew)
  newCards.push(...sortedNew.slice(0, budget))

  return mixQueue([...learning, ...review, ...newCards])
}

const sInput: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'var(--input-bg)', border: '1px solid var(--border-strong)', borderRadius: 8,
  color: 'var(--text)', fontSize: 16, outline: 'none',
}

// Common attributes for foreign-language text inputs (no autocorrect / capitalize).
const langInputProps = (lang: string) => ({
  autoCapitalize: 'off' as const,
  autoCorrect: 'off' as const,
  autoComplete: 'off' as const,
  spellCheck: false,
  enterKeyHint: 'done' as const,
  lang,
})
const sBtnPrimary: React.CSSProperties = {
  padding: '10px 20px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
}
const sBtnSecondary: React.CSSProperties = {
  padding: '10px 20px', background: 'transparent', color: 'var(--text-soft)',
  border: '1px solid var(--border-strong)', borderRadius: 8, fontWeight: 600, fontSize: 14,
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
      background: tab === t ? 'var(--tab-active-bg)' : 'transparent',
      color: tab === t ? 'var(--text)' : 'var(--dim)', fontWeight: 600, fontSize: 13,
    }}>{label}</button>
  )

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--text)', textAlign: 'center' }}>Gemma</h1>
        <p style={{ fontSize: 13, color: 'var(--dim)', textAlign: 'center', marginBottom: 24 }}>German A1–A2 Trainer</p>

        <div style={{ display: 'flex', marginBottom: 24, background: 'var(--bg)', borderRadius: 8, padding: 3 }}>
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
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--dim)', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
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
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{card.verb}</div>
          {card.verb && VERB_EN[card.verb] && (
            <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>{VERB_EN[card.verb]}</div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 16px', marginBottom: 12 }}>
          {rows.map(([p, v]) => (
            <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--elev)', borderRadius: 4 }}>
              <span style={{ color: 'var(--dim)', fontSize: 13 }}>{p}</span>
              <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--dim)', display: 'flex', gap: 16 }}>
          <span>Prät.: <span style={{ color: 'var(--muted)' }}>{card.praeteritum}</span></span>
          <span>Perf.: <span style={{ color: 'var(--muted)' }}>{card.perfekt}</span></span>
        </div>
      </div>
    )
  }

  if (card.type === 'noun' && card.nounForms) {
    const art = card.article!
    const gc = art === 'der' ? '#60a5fa' : art === 'die' ? '#f472b6' : '#34d399'
    return (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', flex: 1, padding: '12px 8px', background: 'var(--elev)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 6 }}>Singular</div>
          <div style={{ fontWeight: 700, color: gc, fontSize: 20 }}>{art} {card.noun}</div>
        </div>
        <div style={{ color: 'var(--faint)', fontSize: 18 }}>/</div>
        <div style={{ textAlign: 'center', flex: 1, padding: '12px 8px', background: 'var(--elev)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 6 }}>Plural</div>
          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 20 }}>die {card.plural}</div>
        </div>
      </div>
    )
  }

  if (card.rule) {
    return (
      <div style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: card.rule }} />
    )
  }

  return null
}

function TrainerShell({
  settings,
  cards,
  pm,
  onSectionsChange,
  showSections,
  setShowSections,
  children,
}: {
  settings: Settings
  cards: CardDef[]
  pm: Record<string, SRSState>
  onSectionsChange: (s: SectionId[]) => void
  showSections: boolean
  setShowSections: (v: boolean) => void
  children: React.ReactNode
}) {
  const showCurriculum = settings.activeLanguage === 'de'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem('curriculum-sidebar-collapsed')
      if (v === '1') setSidebarCollapsed(true)
    } catch {}
  }, [])

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((c) => {
      const next = !c
      try { localStorage.setItem('curriculum-sidebar-collapsed', next ? '1' : '0') } catch {}
      return next
    })
  }

  return (
    <div className="app-shell trainer-layout" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {showCurriculum && (
        <div className={`curriculum-sidebar-desktop${sidebarCollapsed ? ' is-collapsed' : ''}`}>
          <div className="curriculum-sidebar-panel">
            <CurriculumSidebar
              cards={cards}
              pm={pm}
              enabledSections={settings.enabledSections}
              onChange={onSectionsChange}
            />
          </div>
          <button
            type="button"
            className="curriculum-sidebar-toggle tap-sm"
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expand grammar panel' : 'Collapse grammar panel'}
            title={sidebarCollapsed ? 'Show grammar sections' : 'Hide grammar sections'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>
      )}
      {showCurriculum && showSections && (
        <>
          <div className="curriculum-drawer-scrim" onClick={() => setShowSections(false)} />
          <div className="curriculum-drawer">
            <CurriculumSidebar
              cards={cards}
              pm={pm}
              enabledSections={settings.enabledSections}
              onChange={onSectionsChange}
              onClose={() => setShowSections(false)}
            />
          </div>
        </>
      )}
      <div className="trainer-main">{children}</div>
    </div>
  )
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
  const [prevExIdx, setPrevExIdx] = useState(0)
  const [prevReverse, setPrevReverse] = useState(false)
  const [reviewingPrev, setReviewingPrev] = useState(false)
  const [nearMiss, setNearMiss] = useState<string | null>(null)
  const [showSections, setShowSections] = useState(false)
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
            lastExampleIdx: typeof row.last_example_idx === 'number' ? row.last_example_idx : undefined,
          }
        }
      }
      const loaded: Settings = sr
        ? {
            enabledTypes: (sr.enabled_types ?? [...ALL_TYPES]) as CardType[],
            enabledSections: Array.isArray(sr.enabled_sections) && sr.enabled_sections.length > 0
              ? (sr.enabled_sections as SectionId[])
              : [...ALL_SECTION_IDS],
            newCardsToday: sr.new_cards_today ?? 0,
            todayDate: sr.today_date ?? '',
            totalReviewed: sr.total_reviewed ?? 0,
            activeLanguage: (sr.active_language ?? 'de') as Language,
            streakDays: sr.streak_days ?? 0,
            lastReviewDate: sr.last_review_date ?? '',
            dailyNewLimit: typeof sr.daily_new_limit === 'number' ? sr.daily_new_limit : null,
            theme: sr.theme === 'light' ? 'light' : 'dark',
            nounHardMode: sr.noun_hard_mode === true,
            hideHintsAfterNew: sr.hide_hints_after_new !== false,
            reverseRateMature: typeof sr.reverse_rate_mature === 'number' ? sr.reverse_rate_mature : 0.55,
            prepProduction: sr.prep_production !== false,
            preferGrammarNew: sr.prefer_grammar_new === true,
            hideEasyGen: sr.hide_easy_gen !== false,
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
        setReverse(pickReverse(first, loaded))
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
    setReviewingPrev(false)
    setNearMiss(null)
    if (q.length > 0) {
      const first = q[0] as SRSCard
      setExIdx(pickExampleIdx(first))
      setReverse(pickReverse(first, newSettings))
    }
    setTimeout(() => inputEl.current?.focus(), 50)
  }

  function changeLevel(newLv: 'A1' | 'A2' | 'All') {
    setLv(newLv)
    applyQueueChange(cards, pm, settings, newLv)
  }

  function persistSettings(ns: Settings) {
    return fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabledTypes: ns.enabledTypes, enabledSections: ns.enabledSections,
        newCardsToday: ns.newCardsToday,
        todayDate: ns.todayDate, totalReviewed: ns.totalReviewed,
        activeLanguage: ns.activeLanguage,
        streakDays: ns.streakDays, lastReviewDate: ns.lastReviewDate,
        dailyNewLimit: ns.dailyNewLimit, theme: ns.theme,
        nounHardMode: ns.nounHardMode, hideHintsAfterNew: ns.hideHintsAfterNew,
        reverseRateMature: ns.reverseRateMature, prepProduction: ns.prepProduction,
        preferGrammarNew: ns.preferGrammarNew, hideEasyGen: ns.hideEasyGen,
      }),
    })
  }

  function changeSections(newSections: SectionId[]) {
    const ns = { ...settings, enabledSections: newSections }
    setSettings(ns)
    applyQueueChange(cards, pm, ns, lv)
    persistSettings(ns)
  }

  function changeDailyLimit(limit: number | null) {
    const ns = { ...settings, dailyNewLimit: limit }
    setSettings(ns)
    applyQueueChange(cards, pm, ns, lv)
    persistSettings(ns)
  }

  function changeTheme(theme: Theme) {
    if (theme === settings.theme) return
    const ns = { ...settings, theme }
    setSettings(ns)
    persistSettings(ns)
  }

  function changeTrainerDifficulty(patch: Partial<Pick<Settings, 'nounHardMode' | 'hideHintsAfterNew' | 'reverseRateMature' | 'prepProduction' | 'preferGrammarNew' | 'hideEasyGen'>>) {
    const ns = { ...settings, ...patch }
    setSettings(ns)
    if ('hideEasyGen' in patch) applyQueueChange(cards, pm, ns, lv)
    persistSettings(ns)
  }

  function toggleSetting(key: 'nounHardMode' | 'hideHintsAfterNew' | 'prepProduction' | 'preferGrammarNew' | 'hideEasyGen') {
    changeTrainerDifficulty({ [key]: !settings[key] })
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
    try { localStorage.setItem('theme', settings.theme) } catch {}
  }, [settings.theme])

  async function changeLanguage(newLang: Language) {
    if (newLang === settings.activeLanguage) return
    setLoading(true)
    try {
      const ns = { ...settings, activeLanguage: newLang }
      setSettings(ns)
      const fetched = await fetchCards(newLang)
      setCards(fetched)
      applyQueueChange(fetched, pm, ns, lv)
      await persistSettings(ns)
    } finally {
      setLoading(false)
    }
  }

  const card = queue[idx] as SRSCard | undefined
  const baseEx = card ? card.examples[exIdx % card.examples.length] : undefined
  const ex = baseEx && card?.type === 'noun' && card.noun
    ? applyNounStudyMode(baseEx, card.noun, settings.nounHardMode)
    : baseEx
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
    if (!ex || checked || !card) return
    if (input.trim() === '') return
    const result = gradeAnswer(input, ex, card)
    setCorrect(result.ok)
    setNearMiss(result.nearMiss ?? null)
    setChecked(true)
    recordCheck(result.ok)
    if (result.ok) setTimeout(() => setPhase('flip'), 800)
  }

  function pickChoice(value: string) {
    if (!ex || checked || !card) return
    const result = gradeAnswer(value, ex, card)
    setInput(value)
    setCorrect(result.ok)
    setNearMiss(result.nearMiss ?? null)
    setChecked(true)
    recordCheck(result.ok)
    if (result.ok) setTimeout(() => setPhase('flip'), 800)
  }

  async function doRate(rating: Rating) {
    if (!card || saving) return
    setSaving(true)
    const wasNew = card.state === 'new'
    const latest = pm[card.id] ?? defaultSRS()
    const next = { ...computeNext({ ...card, ...latest }, rating), lastExampleIdx: exIdx }
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
          lastExampleIdx: next.lastExampleIdx,
        }),
      }),
      persistSettings(ns),
    ])
    setSaving(false)
    setPrevExIdx(exIdx)
    setPrevReverse(reverse)
    setReviewingPrev(false)
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
      setNearMiss(null)
      setExIdx(pickExampleIdx(enriched))
      setReverse(pickReverse(enriched, settings))
      setTimeout(() => inputEl.current?.focus(), 50)
    } else {
      setIdx(queue.length)
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (reviewingPrev) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault()
          setReviewingPrev(false)
        }
        return
      }
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
  }, [phase, checked, correct, saving, card, input, ex, reviewingPrev])

  useEffect(() => {
    if (phase === 'flip' && ex) speak(ex.de, settings.activeLanguage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, card?.id, exIdx])

  useEffect(() => () => cancelSpeech(), [])

  const now = Date.now()
  const today = todayStr()
  const filtered = cards.filter(c => cardInQueue(c, settings, lv))
  const dueN   = filtered.filter(c => { const s = pm[c.id]; return s && (s.state === 'review' || s.state === 'mature') && s.due <= now }).length
  const learnN = filtered.filter(c => { const s = pm[c.id]; return s && s.state === 'learning' && s.due <= now }).length
  const newToday = settings.todayDate === today ? settings.newCardsToday : 0
  const budget = settings.dailyNewLimit === null
    ? Number.POSITIVE_INFINITY
    : Math.max(0, settings.dailyNewLimit - newToday)
  const remainingNew = filtered.filter(c => !pm[c.id] || pm[c.id].state === 'new').length
  const newN   = Math.min(budget, remainingNew)

  if (loading) {
    return (
      <div className="app-shell" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)' }}>
        Loading your progress…
      </div>
    )
  }

  if (!card || idx >= queue.length) {
    const isEmptyDeck = cards.length === 0
    const noSections = settings.activeLanguage === 'de' && settings.enabledSections.length === 0
    const emptyBody = (
      <>
        <div style={{ fontSize: 48, lineHeight: 1 }}>{isEmptyDeck ? '∅' : noSections ? '☐' : '✓'}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          {isEmptyDeck
            ? `No ${LANGUAGE_LABELS[settings.activeLanguage]} cards yet`
            : noSections
              ? 'No sections selected'
              : queue.length === 0 ? 'All caught up!' : 'Session complete!'}
        </h2>
        <p style={{ color: 'var(--dim)', margin: 0 }}>
          {isEmptyDeck
            ? 'This deck is empty. Switch to another language or seed cards.'
            : noSections
              ? 'Enable at least one curriculum section to start studying.'
              : queue.length === 0
                ? 'No cards due right now.'
                : `Reviewed ${queue.length} card${queue.length !== 1 ? 's' : ''} · Total: ${settings.totalReviewed}`}
        </p>
        {noSections && settings.activeLanguage === 'de' && (
          <button
            onClick={() => changeSections([...ALL_SECTION_IDS])}
            style={{ ...sBtnPrimary, marginTop: 8 }}
            className="curriculum-mobile-trigger"
          >
            Enable all sections
          </button>
        )}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {ALL_LANGUAGES.map(l => (
            <button key={l} onClick={() => changeLanguage(l)} className="tap-sm" style={{
              padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer',
              background: settings.activeLanguage === l ? 'var(--border)' : 'transparent',
              color: settings.activeLanguage === l ? 'var(--text)' : 'var(--muted)',
              fontWeight: 600, fontSize: 13,
            }}>{LANGUAGE_LABELS[l]}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {!isEmptyDeck && !noSections && <button onClick={loadData} style={sBtnPrimary}>Start New Session</button>}
          <button onClick={onSignOut} style={sBtnSecondary}>Sign Out</button>
        </div>
      </>
    )
    return (
      <TrainerShell
        settings={settings}
        cards={cards}
        pm={pm}
        onSectionsChange={changeSections}
        showSections={showSections}
        setShowSections={setShowSections}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', gap: 16, padding: 16, textAlign: 'center' }}>
          {emptyBody}
        </div>
      </TrainerShell>
    )
  }

  const [before, after] = ex ? blankParts(ex.de, ex.focus) : ['', '']
  const rawHint = resolveLemmaHint(card, reverse, settings.hideHintsAfterNew)
  const hint = rawHint && ex && lemmaRevealsFocus(rawHint, acceptableFocuses(ex.focus)) ? null : rawHint

  const prevCardBase = idx > 0 ? queue[idx - 1] : undefined
  const prevCard = prevCardBase
    ? ({ ...prevCardBase, ...(pm[prevCardBase.id] ?? defaultSRS()) } as SRSCard)
    : undefined
  const prevBaseEx = prevCard ? prevCard.examples[prevExIdx % prevCard.examples.length] : undefined
  const prevEx = prevBaseEx && prevCard?.type === 'noun' && prevCard.noun
    ? applyNounStudyMode(prevBaseEx, prevCard.noun, settings.nounHardMode)
    : prevBaseEx
  const [prevBefore, prevAfter] = prevEx ? blankParts(prevEx.de, prevEx.focus) : ['', '']
  const canReviewPrev = !!prevCard && !!prevEx && !saving

  return (
    <TrainerShell
      settings={settings}
      cards={cards}
      pm={pm}
      onSectionsChange={changeSections}
      showSections={showSections}
      setShowSections={setShowSections}
    >
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }} onClick={() => setShowMenu(false)}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--elev)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {settings.activeLanguage === 'de' && (
          <button
            type="button"
            className="tap-sm curriculum-mobile-trigger"
            onClick={e => { e.stopPropagation(); setShowSections(true) }}
            style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
            }}
          >
            Sections
          </button>
        )}
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
            <button key={l} onClick={e => { e.stopPropagation(); changeLevel(l) }} className="tap-sm" style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: lv === l ? 'var(--border)' : 'transparent',
              color: lv === l ? 'var(--text)' : 'var(--dim)', fontWeight: 600, fontSize: 13,
            }}>{l}</button>
          ))}
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowMenu(!showMenu)} className="tap-sm" aria-label="Menu" style={{
              padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6,
              background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 16,
            }}>⋯</button>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%',
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '12px 16px', width: 220, maxWidth: 'calc(100vw - 24px)',
                zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Language</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {ALL_LANGUAGES.map(l => (
                    <button key={l} onClick={() => changeLanguage(l)} className="tap-sm" style={{
                      flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--border)',
                      background: settings.activeLanguage === l ? 'var(--border)' : 'transparent',
                      color: settings.activeLanguage === l ? 'var(--text)' : 'var(--muted)',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}>{LANGUAGE_LABELS[l]}</button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Theme</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {(['dark', 'light'] as const).map(t => (
                    <button key={t} onClick={() => changeTheme(t)} className="tap-sm" style={{
                      flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--border)',
                      background: settings.theme === t ? 'var(--border)' : 'transparent',
                      color: settings.theme === t ? 'var(--text)' : 'var(--muted)',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
                    }}>{t}</button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>New cards / day</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="unlimited"
                    value={settings.dailyNewLimit ?? ''}
                    onChange={e => {
                      const v = e.target.value.trim()
                      changeDailyLimit(v === '' ? null : Math.max(1, Number(v) || 0))
                    }}
                    style={{
                      flex: 1, padding: '7px 8px', borderRadius: 6,
                      background: 'var(--input-bg)', border: '1px solid var(--border-strong)',
                      color: 'var(--text)', fontSize: 16, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                  {settings.dailyNewLimit !== null && (
                    <button onClick={() => changeDailyLimit(null)} title="Disable cap" className="tap-sm"
                      style={{
                        padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
                        background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 12,
                      }}>off</button>
                  )}
                  {settings.dailyNewLimit === null && (
                    <button onClick={() => changeDailyLimit(DEFAULT_NEW_LIMIT_SUGGESTION)} title="Enable cap" className="tap-sm"
                      style={{
                        padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
                        background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 12,
                      }}>set</button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Difficulty</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, fontSize: 13 }}>
                  {([
                    ['nounHardMode', 'Noun hard mode (article + noun)'],
                    ['hideHintsAfterNew', 'Hide hints after first review'],
                    ['prepProduction', 'Type prepositions (not chips)'],
                    ['preferGrammarNew', 'Prefer grammar in new cards'],
                    ['hideEasyGen', 'Hide easy auto-generated vocab'],
                  ] as const).map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-soft)' }}>
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={() => toggleSetting(key)}
                        style={{ accentColor: '#3b82f6' }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: 12, paddingTop: 12 }}>
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
      <div style={{ height: 2, background: 'var(--elev)' }}>
        <div style={{ height: '100%', background: '#3b82f6', width: `${(idx / queue.length) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Card */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {settings.activeLanguage === 'de' ? sectionTitle(cardSection(card)) : TYPE_LABELS[card.type]} · {card.level} · {card.state}{reverse && phase === 'cloze' ? ' · ⇄ reverse' : ''}
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
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {canReviewPrev && !reviewingPrev && (
              <button onClick={() => setReviewingPrev(true)} title="Review previous card"
                aria-label="Review previous card" className="tap-sm"
                style={{
                  padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'inherit', lineHeight: 1.4,
                }}>↶ last</button>
            )}
            <span style={{ fontSize: 12, color: 'var(--faint)' }}>{idx + 1} / {queue.length}</span>
          </span>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '24px 20px' }}>

          {/* Review previous card (read-only flip view, no rating) */}
          {reviewingPrev && prevCard && prevEx && (
            <>
              <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                ↶ Reviewing previous · {TYPE_LABELS[prevCard.type]} · {prevCard.level}
                {prevReverse ? ' · ⇄ reverse' : ''}
              </div>
              {prevReverse ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 16, color: 'var(--text-soft)', marginBottom: 8, lineHeight: 1.5 }}>{prevEx.en}</div>
                  <div style={{ fontSize: 22, lineHeight: 1.6 }}>
                    <span>{prevBefore}</span>
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>{canonicalFocus(prevEx.focus)}</span>
                    <span>{prevAfter}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 22, lineHeight: 1.6, flex: 1 }}>
                    <span>{prevBefore}</span>
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>{canonicalFocus(prevEx.focus)}</span>
                    <span>{prevAfter}</span>
                  </div>
                  {ttsAvailable() && (
                    <button
                      onClick={() => speak(prevEx.de, settings.activeLanguage)}
                      title="Replay"
                      aria-label="Replay audio"
                      className="tap-icon"
                      style={{
                        background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
                        color: 'var(--muted)', cursor: 'pointer', fontSize: 16, padding: '6px 10px',
                        marginTop: 2, lineHeight: 1,
                      }}
                    >🔊</button>
                  )}
                </div>
              )}
              {!prevReverse && (
                <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 20 }}>{prevEx.en}</div>
              )}
              <div style={{ borderTop: '1px solid var(--elev)', paddingTop: 20, marginBottom: 20 }}>
                <CardBack card={prevCard} />
              </div>
              <button onClick={() => setReviewingPrev(false)} style={{ ...sBtnPrimary, width: '100%' }}>
                ↩ Resume
              </button>
            </>
          )}

          {/* Phase 1: Cloze — inline input inside the sentence (or reverse: prompt only) */}
          {!reviewingPrev && phase === 'cloze' && ex && (
            <>
              {reverse ? (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    EN → DE · Translate the missing piece
                  </div>
                  <div style={{ fontSize: 18, color: 'var(--text-soft)', marginBottom: 16, lineHeight: 1.5 }}>{ex.en}</div>
                  {!checked ? (
                    <input
                      ref={inputEl}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doCheck() } }}
                      autoFocus
                      placeholder="Type the German…"
                      {...langInputProps(settings.activeLanguage)}
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
                      {...langInputProps(settings.activeLanguage)}
                      style={{
                        display: 'inline-block',
                        width: Math.max(canonicalFocus(ex.focus).length * 14, 80),
                        maxWidth: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '2px solid #3b82f6',
                        color: 'var(--text)',
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

              {showPrepChoices(card, settings.prepProduction, card.state) && choices.length > 0 && !checked && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {choices.map(c => (
                    <button key={c} onClick={() => pickChoice(c)} style={{
                      padding: '6px 16px', borderRadius: 20,
                      border: '1px solid var(--border-strong)', background: 'var(--elev)',
                      color: 'var(--text-soft)', cursor: 'pointer', fontSize: 15, fontFamily: 'inherit',
                    }}>{c}</button>
                  ))}
                </div>
              )}

              {!checked && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                    {ex.en}
                    {ex.caseLabel && <span style={{ color: 'var(--faint)', marginLeft: 6 }}>({ex.caseLabel})</span>}
                  </span>
                  {hint && (
                    <span style={{ fontSize: 13, color: 'var(--dim)', fontStyle: 'italic' }}>· {hint}</span>
                  )}
                  {ex.subject === 'sie' && (
                    <span style={{ fontSize: 11, color: 'var(--faint)', background: 'var(--elev)', padding: '2px 7px', borderRadius: 4 }}>
                      sie = they &nbsp;·&nbsp; Sie = formal you
                    </span>
                  )}
                </div>
              )}

              {checked && !correct && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ color: '#f87171', fontWeight: 600, marginBottom: nearMiss || ex.note ? 6 : 14 }}>
                    The answer was <span style={{ color: 'var(--text)' }}>
                      {'"' + acceptableFocuses(ex.focus).join('" / "') + '"'}
                    </span>
                  </p>
                  {nearMiss && (
                    <p style={{ color: '#fb923c', fontSize: 13, marginBottom: 14 }}>{nearMiss}</p>
                  )}
                  {ex.note && (
                    <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14, fontStyle: 'italic' }}>{ex.note}</p>
                  )}
                  <button onClick={() => setPhase('flip')} style={sBtnPrimary}>Continue →</button>
                </div>
              )}
            </>
          )}

          {/* Phase 2: Flip / Rate */}
          {!reviewingPrev && phase === 'flip' && ex && (
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
                    className="tap-icon"
                    style={{
                      background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
                      color: 'var(--muted)', cursor: 'pointer', fontSize: 16, padding: '6px 10px',
                      marginTop: 2, lineHeight: 1,
                    }}
                  >🔊</button>
                )}
              </div>
              <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 20 }}>{ex.en}</div>

              <div style={{ borderTop: '1px solid var(--elev)', paddingTop: 20, marginBottom: 20 }}>
                <CardBack card={card} />
              </div>

              <div style={{ marginBottom: 24 }}>
                {pickFlipExamples(card.examples, exIdx).map((e, i) => {
                  const isCurrent = e === ex
                  return (
                    <div key={i} style={{
                      marginBottom: 8, padding: '8px 10px', borderRadius: 8,
                      background: isCurrent ? 'var(--elev)' : 'var(--input-bg)',
                      border: isCurrent ? '1px solid var(--border-strong)' : '1px solid transparent',
                    }}>
                      <div style={{ fontSize: 14, color: isCurrent ? 'var(--text)' : 'var(--text-soft)' }}>{e.de}</div>
                      <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>{e.en}</div>
                    </div>
                  )
                })}
                {card.examples.length > MAX_FLIP_EXAMPLES && (
                  <div style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'right', marginTop: 4 }}>
                    showing {MAX_FLIP_EXAMPLES} of {card.examples.length}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {RATING_CFG.map(({ r, label, color, key }) => (
                  <button key={r} onClick={() => doRate(r)} disabled={saving} className="tap-rating" style={{
                    padding: '10px 4px', borderRadius: 8,
                    border: `1px solid ${color}44`, background: `${color}12`,
                    color, cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: 13, opacity: saving ? 0.5 : 1,
                  }}>
                    <div>{label}</div>
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{intervals?.[r]}</div>
                    <div className="kbd-hint" style={{ fontSize: 10, opacity: 0.4, marginTop: 1 }}>[{key}]</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </TrainerShell>
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
      <div className="app-shell" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)' }}>
        Loading…
      </div>
    )
  }

  if (!session) return <AuthForm />
  return <Trainer onSignOut={() => signOut()} />
}
