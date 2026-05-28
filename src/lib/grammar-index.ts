import type { CardDef, CardType, Conjugations, Example, Language, Level } from './types';
import { TYPE_TIPS, VERB_GLOSS } from './grammar-gloss';

export interface GrammarEntry {
  id: string;
  type: CardType;
  level: Level;
  rule: string;
  label: string;
  /** Large word shown at top of popup. */
  headline?: string;
  /** Extra explanation paragraph (HTML). */
  detail?: string;
  /** Short study tip. */
  tip?: string;
  /** Primary example (from current sentence when possible). */
  example?: Example;
  /** Up to 3 deck examples. */
  examples?: Example[];
}

const WORD = /[a-zA-Z\u00C0-\u024F\u00df\u00DF]+(?:'[a-zA-Z\u00C0-\u024F\u00df\u00DF]+)?/;
const WORD_ALL = /[a-zA-Z\u00C0-\u024F\u00df\u00DF]+(?:'[a-zA-Z\u00C0-\u024F\u00df\u00DF]+)?/g;

interface BuiltinNote {
  rule: string;
  detail?: string;
  tip?: string;
}

const SUBJECT_PRONOUNS: Record<Language, Record<string, BuiltinNote>> = {
  de: {
    ich: {
      rule: '<b>ich</b> — I (1st person singular)',
      detail: 'Subject pronoun. Only capitalized at the start of a sentence.',
      tip: 'Pair with verb endings: ich <em>bin</em>, ich <em>gehe</em>, ich <em>lerne</em>…',
    },
    du: {
      rule: '<b>du</b> — you (informal singular)',
      detail: 'Used with friends, family, children, and peers.',
      tip: 'Verb ending is usually <em>-st</em>: du <em>gehst</em>, du <em>lernst</em>.',
    },
    er: {
      rule: '<b>er</b> — he (masculine / generic)',
      detail: 'Also used for masculine nouns (der Mann → er).',
      tip: '3rd person singular ending <em>-t</em>: er <em>geht</em>.',
    },
    sie: {
      rule: '<b>sie</b> — she <em>or</em> they',
      detail: 'Lowercase <b>sie</b> = she/they. Capital <b>Sie</b> = formal you.',
      tip: 'Same verb form for she and they: sie <em>geht</em> / sie <em>gehen</em>.',
    },
    es: {
      rule: '<b>es</b> — it (neuter)',
      detail: 'Used for das-words and impersonal statements: <em>Es regnet.</em>',
      tip: 'Same endings as er/sie: es <em>ist</em>, es <em>gibt</em>.',
    },
    wir: {
      rule: '<b>wir</b> — we',
      detail: '1st person plural subject.',
      tip: 'Infinitive-like ending <em>-en</em>: wir <em>gehen</em>.',
    },
    ihr: {
      rule: '<b>ihr</b> — you (plural informal)',
      detail: 'Addressing several people you know well.',
      tip: 'Ending <em>-t</em>: ihr <em>geht</em>, ihr <em>habt</em>.',
    },
    Sie: {
      rule: '<b>Sie</b> — you (formal)',
      detail: 'Always capitalized. Used with strangers, officials, in business.',
      tip: 'Same verb form as sie (they): <em>Sie gehen</em>, <em>Sie haben</em>.',
    },
  },
  it: {
    io: { rule: '<b>io</b> — I', detail: '1st person singular. Often omitted — <em>vado</em> = I go.', tip: 'Present: -o (parl<b>o</b>, mangi<b>o</b>).' },
    tu: { rule: '<b>tu</b> — you (informal)', detail: 'Friends and family.', tip: 'Present: -i (parl<b>i</b>) or -i after -isc- (fin<b>isci</b>).' },
    lui: { rule: '<b>lui</b> — he', detail: '3rd person masculine.', tip: 'Present: -a/-e/-isce (parl<b>a</b>).' },
    lei: { rule: '<b>lei</b> — she', detail: '3rd person feminine.', tip: 'Same endings as lui in present tense.' },
    noi: { rule: '<b>noi</b> — we', detail: '1st person plural.', tip: 'Present: -iamo (parl<b>iamo</b>).' },
    voi: { rule: '<b>voi</b> — you (plural)', detail: 'Several people, informal.', tip: 'Present: -ate/-ete/-ite.' },
    loro: { rule: '<b>loro</b> — they', detail: '3rd person plural.', tip: 'Present: -ano/-ono/-iscono.' },
  },
};

const ARTICLE_FORMS: Record<Language, Record<string, BuiltinNote>> = {
  de: {
    der: { rule: '<b>der</b> — the (nom. masc.)', detail: 'Masculine nominative: <em>der Mann</em>, <em>der Tisch</em>.', tip: 'Changes in other cases: den, dem, des.' },
    die: { rule: '<b>die</b> — the (nom. fem. / plural)', detail: 'Feminine singular and all genders in plural.', tip: 'Plural always takes <em>die</em> in nominative.' },
    das: { rule: '<b>das</b> — the (nom. neut.)', detail: 'Neuter nominative: <em>das Kind</em>, <em>das Buch</em>.', tip: 'Neuter = das in nominative and accusative.' },
    den: { rule: '<b>den</b> — the (acc. masc.)', detail: 'Masculine accusative — direct object or after two-way prep + movement.', tip: 'Ich sehe <em>den</em> Mann. / Ich gehe in <em>den</em> Park.' },
    dem: { rule: '<b>dem</b> — the (dat. masc./neut.)', detail: 'Dative masculine/neuter — after mit, in, an, auf, bei, von, zu, nach…', tip: 'mit <em>dem</em> Bus · in <em>dem</em> Haus · bei <em>dem</em> Arzt' },
    des: { rule: '<b>des</b> — the (gen. masc./neut.)', detail: 'Genitive — possession or some prepositions (wegen, trotz).', tip: 'Often adds -s/-es on the noun: des Mann<b>es</b>.' },
    ein: { rule: '<b>ein</b> — a / an (nom. masc./neut.)', detail: 'Indefinite article, nominative.', tip: 'Kein plural form — use <em>keine</em> for “no/not any”.' },
    eine: { rule: '<b>eine</b> — a / an (nom. fem.)', detail: 'Feminine nominative.', tip: 'Accusative also <em>eine</em>: Ich habe <em>eine</em> Idee.' },
    einen: { rule: '<b>einen</b> — a / an (acc. masc.)', detail: 'Masculine accusative.', tip: 'Ich esse <em>einen</em> Apfel.' },
    einem: { rule: '<b>einem</b> — a / an (dat. masc./neut.)', detail: 'Dative masculine/neuter.', tip: 'mit <em>einem</em> Freund · in <em>einem</em> Restaurant' },
    einer: { rule: '<b>einer</b> — a / an (dat./gen. fem.)', detail: 'Feminine dative or genitive.', tip: 'mit <em>einer</em> Freundin · wegen <em>einer</em> Krankheit' },
    eines: { rule: '<b>eines</b> — a / an (gen. masc./neut.)', detail: 'Genitive masculine/neuter.', tip: 'Less common in speech — good to recognize in writing.' },
  },
  it: {
    il: { rule: '<b>il</b> — the (masc. sg.)', detail: 'Default masculine singular.', tip: 'Combines: di+il=<em>del</em>, a+il=<em>al</em>.' },
    lo: { rule: '<b>lo</b> — the (masc. before s+cons, z, gn…)', detail: 'Before special consonant clusters.', tip: 'lo studente, lo zoo → plural <em>gli</em>.' },
    la: { rule: '<b>la</b> — the (fem. sg.)', detail: 'Feminine singular.', tip: 'di+la=<em>della</em>, a+la=<em>alla</em>.' },
    i: { rule: '<b>i</b> — the (masc. pl.)', detail: 'Masculine plural (il → i).', tip: 'Regular masculine plurals in -i.' },
    gli: { rule: '<b>gli</b> — the (masc. pl. before vowels / lo-words)', detail: 'Before vowels or lo- nouns in plural.', tip: 'gli amici, gli studenti.' },
    le: { rule: '<b>le</b> — the (fem. pl.)', detail: 'Feminine plural.', tip: 'la → le in plural.' },
    un: { rule: '<b>un</b> — a (masc.)', detail: 'Indefinite masculine.', tip: 'Before vowels: <em>un amico</em>.' },
    uno: { rule: '<b>uno</b> — a (masc. before s+cons, z…)', detail: 'Same rules as <em>lo</em>.', tip: 'uno studente, uno zaino.' },
    una: { rule: '<b>una</b> — a (fem.)', detail: 'Indefinite feminine.', tip: 'Before vowels: <em>un\'amica</em>.' },
  },
};

const GRAMMAR_TYPES = new Set<CardType>([
  'prep', 'conjunction', 'pronoun', 'wh', 'negation', 'comparative',
  'reflexive', 'possessive', 'perfekt', 'adjective',
]);

function cardLanguage(c: CardDef): Language {
  if (c.language) return c.language;
  return c.id.startsWith('it-') ? 'it' : 'de';
}

export function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function tokenize(text: string): string[] {
  return text.match(WORD_ALL) ?? [];
}

function addToIndex(index: Map<string, GrammarEntry[]>, key: string, entry: GrammarEntry) {
  const k = normalizeWord(key);
  if (!k) return;
  const list = index.get(k);
  if (list) {
    if (!list.some((e) => e.id === entry.id)) list.push(entry);
  } else {
    index.set(k, [entry]);
  }
}

function focuses(ex: Example): string[] {
  return Array.isArray(ex.focus) ? ex.focus : [ex.focus];
}

function conjRows(c: Conjugations, isIt: boolean): [string, string][] {
  return isIt
    ? [
        ['io', c.ich], ['noi', c.wir],
        ['tu', c.du], ['voi', c.ihr],
        ['lui/lei', c.er], ['loro', c.sie],
      ]
    : [
        ['ich', c.ich], ['wir', c.wir],
        ['du', c.du], ['ihr', c.ihr],
        ['er/sie/es', c.er], ['sie/Sie', c.sie],
      ];
}

function verbRuleHtml(card: CardDef, isIt: boolean): string {
  const c = card.conjugations!;
  const rows = conjRows(c, isIt);
  const grid = rows
    .map(
      ([p, v]) =>
        `<div class="grammar-cases-row"><span>${p}</span><span>${v}</span></div>`,
    )
    .join('');
  const praet = isIt ? 'Imperfetto' : 'Präteritum';
  const perf = isIt ? 'Passato prossimo' : 'Perfekt';
  const tense = isIt ? 'Present tense' : 'Present tense (Präsens)';
  return (
    `<div style="font-size:12px;color:var(--dim);margin-bottom:8px">${tense}</div>` +
    `<div class="grammar-cases">${grid}</div>` +
    `<div style="font-size:12px;color:var(--dim);margin-top:8px">${praet}: <b>${card.praeteritum ?? '—'}</b> · ${perf}: <b>${card.perfekt ?? '—'}</b></div>`
  );
}

function nounRuleHtml(card: CardDef, isIt: boolean): string {
  const art = String(card.article ?? '');
  if (isIt) {
    const plArt =
      art === 'la' || art === 'una' ? 'le' : art === 'il' || art === 'lo' ? 'i' : art === 'l\'' ? 'gli' : 'i';
    return (
      `<div style="display:flex;gap:16px;text-align:center">` +
      `<div style="flex:1;padding:8px;background:var(--elev);border-radius:8px">` +
      `<div style="font-size:11px;color:var(--dim);margin-bottom:4px">Singular</div>` +
      `<div style="font-weight:700">${art} ${card.noun}</div></div>` +
      `<div style="flex:1;padding:8px;background:var(--elev);border-radius:8px">` +
      `<div style="font-size:11px;color:var(--dim);margin-bottom:4px">Plural</div>` +
      `<div style="font-weight:700">${plArt} ${card.plural ?? '—'}</div></div></div>`
    );
  }
  const gc = art === 'der' ? '#60a5fa' : art === 'die' ? '#f472b6' : '#34d399';
  return (
    `<div style="display:flex;gap:16px;text-align:center">` +
    `<div style="flex:1;padding:8px;background:var(--elev);border-radius:8px">` +
    `<div style="font-size:11px;color:var(--dim);margin-bottom:4px">Singular</div>` +
    `<div style="font-weight:700;color:${gc}">${art} ${card.noun}</div></div>` +
    `<div style="flex:1;padding:8px;background:var(--elev);border-radius:8px">` +
    `<div style="font-size:11px;color:var(--dim);margin-bottom:4px">Plural</div>` +
    `<div style="font-weight:700">die ${card.plural ?? '—'}</div></div></div>`
  );
}

function nounCasesHtml(card: CardDef, isIt: boolean): string {
  if (!card.nounForms || isIt) return '';
  const f = card.nounForms;
  return (
    '<div class="grammar-cases">' +
    '<div class="grammar-cases-row"><span>Nom</span><span>' + f.nom + ' ' + card.noun + '</span></div>' +
    '<div class="grammar-cases-row"><span>Akk</span><span>' + f.akk + ' ' + card.noun + '</span></div>' +
    '<div class="grammar-cases-row"><span>Dat</span><span>' + f.dat + ' ' + card.noun + '</span></div>' +
    '</div>'
  );
}

function conjugationPerson(card: CardDef, word: string, isIt: boolean): string | null {
  if (!card.conjugations) return null;
  const key = normalizeWord(word);
  const rows = conjRows(card.conjugations, isIt);
  for (const [person, form] of rows) {
    if (normalizeWord(form) === key) return person;
  }
  return null;
}

function pickExamples(
  card: CardDef | undefined,
  word: string,
  primary: Example | undefined,
  max = 3,
): Example[] {
  if (!card) return primary ? [primary] : [];
  const key = normalizeWord(word);
  const out: Example[] = [];
  const seen = new Set<string>();
  const add = (ex: Example) => {
    if (seen.has(ex.de) || out.length >= max) return;
    seen.add(ex.de);
    out.push(ex);
  };
  if (primary) add(primary);
  for (const ex of card.examples) {
    const focusHit = focuses(ex).some((f) => normalizeWord(f) === key);
    const wordHit = tokenize(ex.de).some((w) => normalizeWord(w) === key);
    if (focusHit || wordHit) add(ex);
  }
  if (out.length === 0) {
    for (const ex of card.examples) {
      add(ex);
      if (out.length >= max) break;
    }
  }
  return out;
}

function inferLemma(word: string, language: Language): { lemma: string; label: string } | null {
  if (language !== 'it') return null;
  const key = normalizeWord(word);
  for (const lemma of Object.keys(VERB_GLOSS.it)) {
    if (lemma.endsWith('are') && key === lemma.slice(0, -3) + 'a') {
      return { lemma, label: '3rd person singular (lui/lei)' };
    }
    if (lemma.endsWith('ere') && key === lemma.slice(0, -3) + 'e') {
      return { lemma, label: '3rd person singular (lui/lei)' };
    }
    if (lemma.endsWith('ire') && key === lemma.slice(0, -3) + 'e') {
      return { lemma, label: '3rd person singular (lui/lei)' };
    }
  }
  return null;
}

function enrichEntry(
  entry: GrammarEntry,
  card: CardDef | undefined,
  word: string,
  language: Language,
): GrammarEntry {
  const isIt = language === 'it';
  const key = normalizeWord(word);
  const primary = entry.example;
  const examples = pickExamples(card, word, primary, 3);
  let detail = entry.detail ?? '';
  let tip = entry.tip ?? TYPE_TIPS[language][entry.type] ?? '';

  if (entry.id.startsWith('pron-subj-') || entry.id.startsWith('art-')) {
    return { ...entry, headline: word, examples: examples.length ? examples : undefined, example: examples[0] ?? primary };
  }

  if (card?.verb && (entry.type === 'verb' || entry.type === 'modal')) {
    const gloss = VERB_GLOSS[language][card.verb];
    const person = conjugationPerson(card, word, isIt);
    detail = gloss
      ? `Infinitive <b>${card.verb}</b> — ${gloss}`
      : `Infinitive <b>${card.verb}</b>`;
    if (person && normalizeWord(card.verb) !== key) {
      detail += `<br><span style="color:var(--dim)">In this sentence: </span><b>${word}</b> (${person})`;
    }
    if (card.praeteritum || card.perfekt) {
      const praet = isIt ? 'Imperfetto' : 'Präteritum';
      const perf = isIt ? 'Passato prossimo' : 'Perfekt';
      detail += `<br>${praet}: <b>${card.praeteritum ?? '—'}</b> · ${perf}: <b>${card.perfekt ?? '—'}</b>`;
    }
  }

  if (card?.noun && entry.type === 'noun') {
    const cases = nounCasesHtml(card, isIt);
    if (cases) detail = (detail ? detail + cases : cases);
    if (card.plural) {
      detail = (detail || '') + `<br>Plural: <b>${card.plural}</b>`;
    }
  }

  if (entry.type === 'prep' && card?.rule) {
    if (card.rule.includes('Wo?') || card.rule.includes('Wohin?')) {
      tip = 'Two-way preposition: <b>Wo?</b> → Dative (static location). <b>Wohin?</b> → Accusative (movement/direction).';
    }
  }

  if (card?.rule && entry.type === 'conjunction' && !detail) {
    detail = 'In the subordinate clause, the conjugated verb goes to the <b>end</b>.';
  }

  // Scenario / phrase cards: explain a focused verb form (e.g. costa → costare).
  if (card && !card.verb && entry.type === 'verb') {
    const focusEx = card.examples.find((ex) =>
      focuses(ex).some((f) => normalizeWord(f) === key),
    );
    if (focusEx) {
      const inferred = inferLemma(word, language);
      if (inferred && VERB_GLOSS[language][inferred.lemma]) {
        detail = `<b>${word}</b> — ${inferred.label}. Infinitive: <b>${inferred.lemma}</b> (${VERB_GLOSS[language][inferred.lemma]}).`;
      } else if (!detail) {
        detail = `Key word in this phrase — see the example below.`;
      }
    }
  }

  return {
    ...entry,
    headline: word,
    detail: detail || undefined,
    tip: tip || undefined,
    examples,
    example: examples[0] ?? primary,
  };
}

function builtinEntry(id: string, type: CardType, note: BuiltinNote): GrammarEntry {
  return {
    id,
    type,
    level: 'A1',
    rule: note.rule,
    label: stripHtml(note.rule),
    detail: note.detail,
    tip: note.tip,
  };
}

function exampleContaining(card: CardDef | undefined, word: string): Example | undefined {
  if (!card) return undefined;
  const key = normalizeWord(word);
  for (const ex of card.examples) {
    if (tokenize(ex.de).some((w) => normalizeWord(w) === key)) return ex;
    for (const f of focuses(ex)) {
      if (normalizeWord(f) === key || tokenize(f).some((w) => normalizeWord(w) === key)) return ex;
    }
  }
  return card.examples[0];
}

function wordInCard(card: CardDef, word: string): boolean {
  const key = normalizeWord(word);
  for (const ex of card.examples) {
    if (tokenize(ex.de).some((w) => normalizeWord(w) === key)) return true;
  }
  return false;
}

function indexKeysForCard(card: CardDef): string[] {
  const keys = new Set<string>();

  if (card.word) keys.add(card.word);
  if (card.verb) keys.add(card.verb);
  if (card.noun) keys.add(card.noun);
  if (card.plural) keys.add(card.plural);
  if (card.article) keys.add(String(card.article));

  if (card.conjugations) {
    for (const v of Object.values(card.conjugations)) keys.add(v);
  }
  if (card.praeteritum) keys.add(card.praeteritum);
  if (card.perfekt) {
    for (const w of card.perfekt.split(/\s+/)) keys.add(w);
  }
  if (card.nounForms) {
    for (const form of Object.values(card.nounForms)) {
      for (const w of form.split(/\s+/)) keys.add(w);
    }
  }

  // Full vocab cards: index every word in examples (verbs, nouns, modals).
  // Grammar cards: only index focus words — avoid mapping "costa" → "quanto".
  const indexAllExampleWords =
    ((card.type === 'verb' || card.type === 'modal') && !!card.verb && !!card.conjugations) ||
    (card.type === 'noun' && !!card.noun);

  for (const ex of card.examples) {
    for (const f of focuses(ex)) {
      keys.add(f);
      for (const w of tokenize(f)) keys.add(w);
    }
    if (indexAllExampleWords) {
      for (const w of tokenize(ex.de)) keys.add(w);
    }
  }

  return [...keys];
}

export function entryForCard(card: CardDef, language: Language): GrammarEntry | null {
  const isIt = language === 'it';
  const example = card.examples[0];

  if (card.rule && card.word) {
    return {
      id: card.id,
      type: card.type,
      level: card.level,
      rule: card.rule,
      label: stripHtml(card.rule),
      example,
    };
  }

  if ((card.type === 'verb' || card.type === 'modal') && card.verb && card.conjugations) {
    return {
      id: card.id,
      type: card.type,
      level: card.level,
      rule: verbRuleHtml(card, isIt),
      label: card.verb,
      example,
    };
  }

  if (card.type === 'noun' && card.noun) {
    return {
      id: card.id,
      type: card.type,
      level: card.level,
      rule: nounRuleHtml(card, isIt),
      label: `${card.article ?? ''} ${card.noun}`.trim(),
      example,
    };
  }

  if (card.rule) {
    return {
      id: card.id,
      type: card.type,
      level: card.level,
      rule: card.rule,
      label: stripHtml(card.rule).slice(0, 80),
      example,
    };
  }

  return null;
}

function scoreEntry(
  entry: GrammarEntry,
  card: CardDef | undefined,
  word: string,
  currentCardId?: string,
): number {
  const key = normalizeWord(word);
  let score = 0;

  if (card?.word && normalizeWord(card.word) === key) score += 2000;
  if (entry.id === `pron-subj-${key}`) score += 850;
  if (entry.id === `art-${key}`) score += 900;
  if (card?.verb && normalizeWord(card.verb) === key) score += 450;
  if (card?.noun && normalizeWord(card.noun) === key) score += 450;
  if (card?.conjugations && Object.values(card.conjugations).some((v) => normalizeWord(v) === key)) {
    score += 600;
  }
  if (GRAMMAR_TYPES.has(entry.type)) score += 300;
  if (card?.examples.some((ex) => focuses(ex).some((f) => normalizeWord(f) === key))) score += 250;

  // Grammar cards should not win on incidental sentence words (e.g. costa ≠ quanto).
  if (card && GRAMMAR_TYPES.has(entry.type)) {
    const ownsWord = card.word && normalizeWord(card.word) === key;
    const ownsFocus = card.examples.some((ex) =>
      focuses(ex).some((f) => normalizeWord(f) === key),
    );
    if (!ownsWord && !ownsFocus) score -= 2000;
  }

  if (currentCardId && entry.id === currentCardId && card) {
    const isFocus = card.examples.some((ex) =>
      focuses(ex).some((f) => normalizeWord(f) === key),
    );
    const isLemma =
      (card.verb && normalizeWord(card.verb) === key) ||
      (card.word && normalizeWord(card.word) === key) ||
      (card.noun && normalizeWord(card.noun) === key) ||
      (card.conjugations &&
        Object.values(card.conjugations).some((v) => normalizeWord(v) === key));
    if (isFocus || isLemma) score += 1000;
    else if (wordInCard(card, key)) score += 120;
  }

  if (card && wordInCard(card, key)) score += 80;
  return score;
}

export function lookupEntry(
  index: Map<string, GrammarEntry[]>,
  word: string,
  cardsById: Map<string, CardDef>,
  language: Language,
  currentCardId?: string,
): GrammarEntry | null {
  const key = normalizeWord(word);
  const raw = index.get(key) ?? [];

  if (raw.length === 0 && currentCardId) {
    const current = cardsById.get(currentCardId);
    if (current && wordInCard(current, key)) {
      const entry = entryForCard(current, cardLanguage(current));
      if (entry) {
        return enrichEntry(
          { ...entry, example: exampleContaining(current, key) ?? entry.example },
          current,
          word,
          language,
        );
      }
    }
    return null;
  }

  if (raw.length === 0) return null;

  let best: GrammarEntry | null = null;
  let bestScore = -1;
  for (const entry of raw) {
    const card = cardsById.get(entry.id);
    const score = scoreEntry(entry, card, word, currentCardId);
    if (score > bestScore) {
      bestScore = score;
      best = {
        ...entry,
        example: exampleContaining(card, key) ?? entry.example,
      };
    }
  }
  if (!best) return null;
  const card = cardsById.get(best.id);
  return enrichEntry(best, card, word, language);
}

export function buildGrammarIndex(cards: CardDef[], language: Language): Map<string, GrammarEntry[]> {
  const index = new Map<string, GrammarEntry[]>();

  for (const [word, note] of Object.entries(SUBJECT_PRONOUNS[language])) {
    addToIndex(index, word, builtinEntry(`pron-subj-${normalizeWord(word)}`, 'pronoun', note));
  }

  for (const [word, note] of Object.entries(ARTICLE_FORMS[language])) {
    addToIndex(index, word, builtinEntry(`art-${normalizeWord(word)}`, 'adjective', note));
  }

  for (const card of cards) {
    if (cardLanguage(card) !== language) continue;
    const entry = entryForCard(card, language);
    if (!entry) continue;
    for (const key of indexKeysForCard(card)) {
      addToIndex(index, key, entry);
    }
  }

  return index;
}

export type SentenceSegment =
  | { kind: 'text'; text: string }
  | { kind: 'word'; text: string; key: string; entry: GrammarEntry | null; focus: boolean };

function focusRange(text: string, focus: string | string[] | undefined): [number, number] | null {
  if (!focus) return null;
  const focusStr = Array.isArray(focus) ? focus.join(' ') : focus;
  const start = text.indexOf(focusStr);
  if (start < 0) return null;
  return [start, start + focusStr.length];
}

/** Split a sentence into render segments — every word is tappable. */
export function segmentSentence(
  text: string,
  focus: string | string[] | undefined,
  index: Map<string, GrammarEntry[]>,
  cardsById: Map<string, CardDef>,
  language: Language,
  currentCardId?: string,
): SentenceSegment[] {
  const range = focusRange(text, focus);
  const segments: SentenceSegment[] = [];
  let i = 0;

  while (i < text.length) {
    const rest = text.slice(i);
    const wordMatch = rest.match(WORD);
    if (!wordMatch || wordMatch.index !== 0) {
      const nextWord = rest.search(WORD);
      const chunk = nextWord === -1 ? rest : rest.slice(0, nextWord);
      if (chunk) segments.push({ kind: 'text', text: chunk });
      i += chunk.length || 1;
      continue;
    }

    const word = wordMatch[0];
    const key = normalizeWord(word);
    const wordStart = i;
    const wordEnd = i + word.length;
    const isFocus = range
      ? wordStart >= range[0] && wordEnd <= range[1]
      : false;

    segments.push({
      kind: 'word',
      text: word,
      key,
      entry: lookupEntry(index, word, cardsById, language, currentCardId),
      focus: isFocus,
    });
    i += word.length;
  }

  return segments;
}

export function lookupWord(
  index: Map<string, GrammarEntry[]>,
  word: string,
  cardsById: Map<string, CardDef>,
  language: Language,
  currentCardId?: string,
): GrammarEntry | null {
  return lookupEntry(index, word, cardsById, language, currentCardId);
}
