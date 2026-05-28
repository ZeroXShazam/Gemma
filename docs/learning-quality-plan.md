# Implementation plan: elevate learning quality

**Goal:** Less repetition, harder recall, same lean UI (one screen, cloze → flip → rate).

---

## Principles

1. **Cards first** — most repetition comes from template sentences in the DB, not the SRS UI.
2. **Harder production, not more features** — tighten what you must type, not add new screens.
3. **Small shippable phases** — each phase is deployable on its own.
4. **Keep ~400–600 strong cards** as the long-term target; shrink generated fluff.

---

## Phase 0 — Baseline & metrics (½ day)

**Why:** You need before/after numbers so you know if changes worked.

### Tasks

- Extend `scripts/dump-cards.ts` (or add `scripts/audit-deck.ts`) to report:
  - % examples matching mechanical noun template (`ist hier`, `Ich sehe den`, `Ich spreche von`)
  - % verb examples that are bare conjugation (`Ich X.` / `Du X?`)
  - % sentences with ≥5 words
  - Cards with zero “real” examples
- Run once on current DB → save as baseline JSON/markdown in `scripts/.cache/`

### Done when

One command prints a quality summary you can re-run after each phase.

---

## Phase 1 — Trainer difficulty (app only, ~1 day)

**Why:** Immediate feel improvement without reseeding the whole deck.

### 1.1 Settings (persist per user)

Add to `Settings` + `user_settings`:

| Setting | Default | Purpose |
|---------|---------|---------|
| `nounHardMode` | `false` | Blank article + noun form, not just article |
| `hideHintsAfterNew` | `true` | No lemma hint once card left `new` |
| `reverseRateMature` | `0.55` | EN→DE probability on review/mature |
| `prepProduction` | `true` | Type answer instead of tap chips (optional: chips only for `new`) |

**Files:** `src/lib/types.ts` (if needed), `schema-stats.sql`, `src/app/api/user/settings/route.ts`, `src/app/page.tsx` (menu toggles, minimal)

### 1.2 Noun hard mode

- In `expandNounFocus` / cloze rendering: when `nounHardMode`, focus becomes e.g. `den Tisch` not `den`
- Accept answer if user types article+noun or just focus span (document on flip)
- Only for `card.type === 'noun'`

### 1.3 Hint gating

- Change `rawHint` logic: if `hideHintsAfterNew && card.state !== 'new'` → no hint (except `subject` note for sie/Sie if needed)

### 1.4 Reverse mode

- Replace flat `REVERSE_PROBABILITY` with tiered logic:
  - `new` / `learning`: 0% reverse (keep forward)
  - `review`: 33%
  - `mature`: use `reverseRateMature` from settings

### 1.5 Prepositions: production

- When `prepProduction`: hide choice chips; user types prep word
- Keep chips as fallback for `new` only (optional)

### 1.6 Example cooldown

- Track `lastExampleIdx` in `user_card_progress` (new JSONB column `last_shown_example` or reuse session state)
- `pickExampleIdx`: zero weight for last-shown index when alternatives exist

### Done when

Toggles work on phone/desktop; mature cards feel harder; preps require typing.

---

## Phase 2 — Generator quality gate (~2 days)

**Why:** ~48% of examples are the same 3 noun templates. Fix at source.

### 2.1 Stricter `build-deck.ts` emission rules

**Nouns — drop unless:**

- ≥1 Wiktionary bilingual example (≥5 words DE + EN), **or**
- hand-maintained exception list (tiny)

**Remove or drastically reduce** mechanical 3-line template (`ist hier` / `Ich sehe` / `Ich spreche von`). If kept at all, max **1** templated case drill + **2** real sentences.

**Verbs — drop unless:**

- ≥2 real sentences with valid focus, **or**
- ≥1 real + conjugation drills only for `new`-tier tag (see 2.3)

**Grammar cards (`gram`)** — unchanged; already good.

### 2.2 Better example selection

- Prefer examples where focus is **inflected form**, not lemma
- Reject examples where blank would be article alone (unless tagged `article-drill`)
- Cap sentence length 140 chars (already there)

### 2.3 Optional card metadata (light)

Add to `CardDef` / card `data` JSON:

```ts
difficulty?: 'easy' | 'standard' | 'hard'
source?: 'hand' | 'gen'
```

Set `gen` + `easy` for anything that still uses templates. Lets Phase 3 filter without deleting yet.

### 2.4 Regenerate & audit

- `pnpm build:deck`
- Run Phase 0 audit → expect mechanical noun % to drop sharply
- `pnpm seed:de --truncate` (or upsert + manual delete of old gen ids)

### Done when

Generated deck ≤700 cards, mechanical template examples <10% of total.

---

## Phase 3 — Queue intelligence (~1 day)

**Why:** Even good cards feel repetitive when the queue serves 15 similar nouns in a row.

### 3.1 Template fingerprint

- Function `exampleFingerprint(ex)` → e.g. `noun:see-akk`, `verb:ich-du-er`, `real`
- In `buildQueue`: when shuffling, penalize consecutive cards with same fingerprint

### 3.2 Section-aware pacing

- When building queue, cap consecutive cards from same `sectionId` (e.g. max 2 in a row)
- Prefer mixing grammar + vocab within a session

### 3.3 Daily new card bias

- Optional setting: `preferGrammarNew: boolean` — fill daily new budget from hand/grammar sections first

### Done when

A session mixes sections and sentence shapes; less “Ich sehe den…” fatigue.

---

## Phase 4 — Hand-curated depth (~ongoing, batch by section)

**Why:** A2 needs connected grammar, not more isolated lemmas.

Target: **+80–120 hand cards** in thin curriculum sections (write in `src/lib/cards.ts`, assign via existing `sectionId` / id prefixes).

| Section | Add ~ | Content |
|---------|------:|---------|
| Perfekt | 15 | haben/sein choice, word order, common participles |
| Präteritum | 10 | war/hatte, modals, narrative snippets |
| Reflexive | 20 | sich freuen auf, interessieren für, waschen, anziehen, erinnern an |
| Wechselpräp | 15 | Wo/Wohin pairs: in, an, auf, über, unter |
| Clauses | 10 | weil/dass/wenn/ob in varied contexts |
| Adj endings | 15 | der/die/das + ein/kein patterns |
| Dative | 10 | helfen, geben, mit + pronouns in sentences |
| Sentence packs | 20 | travel, doctor, work mini-dialogues |

### Done when

Every curriculum section has ≥8 hand cards with real sentences; empty sections (Future, Imperative) stay small but non-zero.

---

## Phase 5 — Smarter grading (optional, ~1 day)

**Why:** “Too easy” also means binary right/wrong on obvious forms.

- **Case-aware noun check:** wrong article but right noun → show “Hard” suggestion, partial credit message
- **Synonym accept list** on `Example` (optional `accept?: string[]`)
- **Separable verb:** accept multi-token focus array (already supported) — ensure generator uses it

### Done when

Near-misses aren’t scored as full Good without acknowledgment.

---

## Phase 6 — Deck size policy (after Phase 2 audit)

**Decision point:**

| Option | Cards | When |
|--------|------:|------|
| A. Quality gate only | ~700–900 | After Phase 2 |
| B. Aggressive cut | ~450–600 | If audit still shows weak gen cards |
| C. Two-tier | All in DB, default sections exclude `easy` gen | Soft launch |

**Recommend C** short-term: add `enabledDifficulty` or default-disable sections heavy in `easy` gen vocab; then move to **B**.

---

## File map

| Area | Files |
|------|--------|
| Audit | `scripts/audit-deck.ts`, `scripts/dump-cards.ts` |
| Generator | `scripts/build-deck.ts`, `src/lib/cards-generated.ts` |
| Hand deck | `src/lib/cards.ts`, `src/lib/curriculum-de.ts` |
| Trainer | `src/app/page.tsx`, `src/app/globals.css` |
| Settings | `schema-stats.sql`, `src/app/api/user/settings/route.ts` |
| Progress | `schema-stats.sql`, `src/app/api/user/progress/route.ts` |
| Seed | `scripts/seed-de.ts` |

---

## Suggested order & timeline

```
Week 1
  Phase 0  ─ audit baseline
  Phase 1  ─ trainer difficulty (ship to prod)

Week 2
  Phase 2  ─ rebuild deck + reseed
  Phase 0  ─ audit again (compare)

Week 3
  Phase 3  ─ queue mixing
  Phase 4  ─ first hand batch (Perfekt, Reflexive, Wechselpräp)

Week 4+
  Phase 4  ─ remaining hand cards
  Phase 5  ─ grading (if still too easy)
  Phase 6  ─ cut or tier deck
```

---

## Acceptance criteria (overall)

You’re done when:

1. **<15%** of active examples match mechanical noun/verb templates
2. Mature cards often require **EN→DE** or **full phrase** production
3. No lemma hint on reviewed cards (by default)
4. Sessions **mix sections** and sentence types
5. Curriculum sections for A2 grammar have **real sentence** drills, not isolated lemmas
6. Personal feel: “I have to think” on most mature reviews, not autopilot

---

## What not to build

- Separate grammar vs vocab modes
- Lessons, videos, chat tutor
- Complex difficulty ML
- More card types
- Gamification

---

## Recommended start

Phase 0 + Phase 1 in one PR, then Phase 2 as a second PR with `--truncate` reseed.
