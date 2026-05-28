/**
 * Build the Italian A1+A2 deck from public sources.
 *
 *  - Wordlist: De Mauro VdB lemmas × Hermit Dave frequency ranks (51–2500 ≈ A1/A2)
 *  - Noun gender: en.wiktionary.org {{it-noun|…}} template
 *  - Verb conjugations: rule-based from {{it-conj|…}} (+isc flag)
 *  - English definitions + bilingual examples: en.wiktionary.org REST v1 (language: it)
 *
 * Outputs `src/lib/cards-generated-it.ts`, merged in `src/lib/cards-it.ts`.
 *
 * Usage:
 *   pnpm build:deck:it
 *   pnpm build:deck:it --refresh
 *   pnpm build:deck:it --target=420
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache');
const FREQ_CACHE = path.join(CACHE_DIR, 'it_50k.txt');
const VDB_CACHE = path.join(CACHE_DIR, 'vdb_lemmas.txt');
const WIKT_CACHE = path.join(CACHE_DIR, 'wikt-it.json');
const OUT_FILE = path.join(ROOT, 'src', 'lib', 'cards-generated-it.ts');
const HAND_FILE = path.join(ROOT, 'src', 'lib', 'cards-it.ts');
const DEPTH_FILE = path.join(ROOT, 'src', 'lib', 'cards-it-depth.ts');
const FREQ_URL =
  'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/it/it_50k.txt';
const VDB_URL =
  'https://raw.githubusercontent.com/snizio/italian-wiktionary-parser/master/vdb_lemmas.txt';

const argv = process.argv.slice(2);
const REFRESH = argv.includes('--refresh');
const LIMIT_ARG = argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : Infinity;
const CONCURRENCY_ARG = argv.find((a) => a.startsWith('--concurrency='));
const CONCURRENCY = CONCURRENCY_ARG ? parseInt(CONCURRENCY_ARG.split('=')[1], 10) : 2;
const TARGET_ARG = argv.find((a) => a.startsWith('--target='));
/** Cap generated cards (~420 + ~140 hand ≈ 560 total, matching German deck size). */
const TARGET = TARGET_ARG ? parseInt(TARGET_ARG.split('=')[1], 10) : 420;
const UA = 'gemma-deck-builder/0.1 (https://gemma-iota.vercel.app; vocab learning)';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Level = 'A1' | 'A2';

interface FreqEntry {
  lemma: string;
  rank: number;
  level: Level;
}

interface WiktCacheEntry {
  fetchedAt: number;
  enWikitext: string | null;
  enDef: unknown | null;
}

type WiktCache = Record<string, WiktCacheEntry>;

interface Parsed {
  noun?: { plural?: string; genus?: 'm' | 'f'; uncountable?: boolean };
  verb?: {
    ich: string;
    du: string;
    er: string;
    wir: string;
    ihr: string;
    sie: string;
    praeteritum: string;
    perfekt: string;
  };
  enDef?: string;
  enExamples?: RichExample[];
}

interface RichExample {
  de: string;
  en: string;
  focus: string | string[];
}

const STOPWORDS = new Set([
  'e', 'non', 'che', 'di', 'la', 'il', 'un', 'a', 'per', 'è', 'in', 'una', 'mi', 'sono', 'ho',
  "l'", 'si', 'ha', 'ma', 'lo', 'cosa', 'con', 'no', 'le', 'ti', 'se', 'da', 'i', 'come', 'io',
  'ci', 'hai', 'questo', 'bene', 'qui', 'sei', 'del', 'tu', 'solo', 'mio', 'al', 'me', 'tutto',
  "c'", 'te', 'era', 'della', 'mia', 'fatto', 'fare', 'essere', 'so', 'quando', 'sì', 'ora',
  'lei', 'gli', 'ne', 'oh', 'questa', 'detto', 'ok', 'va', 'perche', 'perché', 'quello', 'mai',
  'alla', 'o', 'anche', 'stato', 'abbiamo', 'tutti', 'dei', 'grazie', 'chi', 'sta', 'molto',
  'più', 'piu', 'voglio', 'tuo', 'beh', 'sia', 'nel', 'lui', 'allora', 'posso', 'ehi', 'prima',
  'tua', 'suo', 'niente', 'qualcosa', 'sai', 'siamo', "un'", 'cosi', 'così', 'davvero', 'ancora',
  'hanno', 'stai', 'fa', 'sua', 'uno', 'dove', 'su', 'vero', 'vuoi', 'noi', 'due', 'quindi',
  'dire', "d'", 'delle', 'quella', 'sempre', 'altro', 'poi', 'là', 'la', 'li', 'loro', 'cui',
  'già', 'gia', 'forse', 'proprio', 'sul', 'sulla', 'sui', 'col', 'coi', 'dal', 'dalla', 'dai',
  'dalle', 'nel', 'nella', 'nei', 'nelle', 'suo', 'sue', 'suoi', 'miei', 'tue', 'tua', 'tuo',
]);

const IRREGULAR_VERBS = new Set([
  'essere', 'avere', 'andare', 'venire', 'fare', 'dire', 'dare', 'stare', 'uscire', 'bere',
  'sapere', 'volere', 'potere', 'dovere', 'conoscere', 'vedere', 'leggere', 'scrivere',
  'mettere', 'prendere', 'rimanere', 'tenere', 'vincere', 'perdere', 'chiudere', 'aprire',
  'offrire', 'morire', 'salire', 'tradurre', 'trarre', 'porre', 'comporre', 'disporre',
  'promuovere', 'sedere', 'spegnere', 'accendere', 'cogliere', 'scegliere', 'togliere',
  'cadere', 'scendere', 'ascendere', 'nascere', 'crescere', 'decidere', 'ridere', 'piangere',
  'vivere',
]);

async function fetchText(url: string, attempts = 4): Promise<string | null> {
  let lastErr: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, accept: 'application/json' } });
      if (r.status === 429 || r.status === 503) {
        await sleep(1000 * Math.pow(2, i) + Math.random() * 500);
        continue;
      }
      if (!r.ok) return null;
      return await r.text();
    } catch (e) {
      lastErr = e;
      await sleep(500 * (i + 1) + Math.random() * 300);
    }
  }
  if (lastErr) console.error('  fetch failed:', url.slice(0, 100), String(lastErr).slice(0, 80));
  return null;
}

async function loadFrequencyRanks(): Promise<Map<string, number>> {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (!fs.existsSync(FREQ_CACHE) || REFRESH) {
    const r = await fetch(FREQ_URL, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`frequency list: ${r.status}`);
    fs.writeFileSync(FREQ_CACHE, await r.text());
  }
  const ranks = new Map<string, number>();
  for (const line of fs.readFileSync(FREQ_CACHE, 'utf8').trim().split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const word = parts[0].replace(/^'|'$/g, '').toLowerCase();
    const rank = parseInt(parts[1], 10);
    if (word && !Number.isNaN(rank)) ranks.set(word, rank);
  }
  return ranks;
}

async function loadWordlist(): Promise<FreqEntry[]> {
  if (!fs.existsSync(VDB_CACHE) || REFRESH) {
    const r = await fetch(VDB_URL, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`VdB list: ${r.status}`);
    fs.writeFileSync(VDB_CACHE, await r.text());
  }
  const ranks = await loadFrequencyRanks();
  const entries: FreqEntry[] = [];
  for (const raw of fs.readFileSync(VDB_CACHE, 'utf8').trim().split('\n')) {
    const lemma = raw.trim();
    if (!lemma || /\s/.test(lemma)) continue;
    const rank = ranks.get(lemma.toLowerCase());
    if (!rank || rank <= 50 || rank > 2500) continue;
    if (STOPWORDS.has(lemma.toLowerCase())) continue;
    if (lemma.endsWith('rsi') || lemma.endsWith('ersi') || lemma.endsWith('irsi')) continue;
    const level: Level = rank <= 1200 ? 'A1' : 'A2';
    entries.push({ lemma, rank, level });
  }
  entries.sort((a, b) => a.rank - b.rank);
  return entries;
}

function loadWiktCache(): WiktCache {
  if (REFRESH || !fs.existsSync(WIKT_CACHE)) return {};
  return JSON.parse(fs.readFileSync(WIKT_CACHE, 'utf8'));
}

function saveWiktCache(cache: WiktCache) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(WIKT_CACHE, JSON.stringify(cache));
}

async function fetchWiktEnWikitext(lemma: string): Promise<string | null> {
  const url = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(
    lemma,
  )}&prop=wikitext&format=json&formatversion=2`;
  const text = await fetchText(url);
  if (!text) return null;
  try {
    return JSON.parse(text)?.parse?.wikitext ?? null;
  } catch {
    return null;
  }
}

async function fetchWiktEnDef(lemma: string): Promise<unknown | null> {
  const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(lemma)}`;
  const text = await fetchText(url);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractTemplate(wt: string, name: string): string | null {
  const start = wt.indexOf(`{{${name}`);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < wt.length - 1; i++) {
    if (wt[i] === '{' && wt[i + 1] === '{') {
      depth++;
      i++;
    } else if (wt[i] === '}' && wt[i + 1] === '}') {
      depth--;
      i++;
      if (depth === 0) return wt.slice(start, i + 1);
    }
  }
  return null;
}

function italianSection(wt: string): string {
  const idx = wt.indexOf('==Italian==');
  return idx >= 0 ? wt.slice(idx) : wt;
}

function parseItNoun(enWt: string): Parsed['noun'] | undefined {
  const section = italianSection(enWt);
  const tpl = extractTemplate(section, 'it-noun');
  if (!tpl) {
    const m = section.match(/\{\{it-noun\|([mf])/i);
    if (!m) return undefined;
    const genus = m[1].toLowerCase() === 'f' ? 'f' : 'm';
    return { genus };
  }
  const inner = tpl.slice(2, -2);
  const firstParam = inner.split('|')[1]?.trim().charAt(0).toLowerCase();
  const genus: 'm' | 'f' | undefined =
    firstParam === 'f' ? 'f' : firstParam === 'm' ? 'm' : undefined;
  if (!genus) return undefined;
  return { genus };
}

function parseItConjFlags(enWt: string): { isc: boolean } {
  const section = italianSection(enWt);
  const tpl = extractTemplate(section, 'it-conj') || '';
  return { isc: tpl.includes('+isc') };
}

function areForm(stem: string, ending: string, lemma: string): string {
  let s = stem;
  if (s.endsWith('i') && ['o', 'i', 'iamo', 'iate', 'a', 'ano'].includes(ending)) {
    if (ending === 'o' || ending === 'iamo' || ending === 'iate') s = s.slice(0, -1);
  }
  const careGare =
    (lemma.endsWith('care') || lemma.endsWith('gare')) &&
    !lemma.endsWith('scare') &&
    !lemma.endsWith('sgare');
  if (s.endsWith('c') || s.endsWith('g')) {
    if (ending === 'i' || (careGare && (ending === 'iamo' || ending === 'iate'))) s += 'h';
  }
  return s + ending;
}

function conjugateItalian(lemma: string, enWt: string): Parsed['verb'] | undefined {
  if (IRREGULAR_VERBS.has(lemma.toLowerCase())) return undefined;
  if (lemma.endsWith('rsi') || /\s/.test(lemma)) return undefined;

  const { isc } = parseItConjFlags(enWt);

  if (lemma.endsWith('are')) {
    const stem = lemma.slice(0, -3);
    const ich = areForm(stem, 'o', lemma);
    const du = areForm(stem, 'i', lemma);
    const er = areForm(stem, 'a', lemma);
    const wir = areForm(stem, 'iamo', lemma);
    const ihr = areForm(stem, 'iate', lemma);
    const sie = areForm(stem, 'ano', lemma);
    const imperf = stem.replace(/i$/, '') + 'ava';
    const part = stem.replace(/i$/, '') + 'ato';
    return { ich, du, er, wir, ihr, sie, praeteritum: imperf, perfekt: `ha ${part}` };
  }

  if (lemma.endsWith('ere')) {
    const stem = lemma.slice(0, -3);
    const ich = stem.endsWith('c') || stem.endsWith('g') ? stem + 'o' : stem + 'o';
    const du = (stem.endsWith('c') || stem.endsWith('g') ? stem + 'h' : stem) + 'i';
    const er = stem + 'e';
    const wir = stem + 'iamo';
    const ihr = stem + 'ete';
    const sie = stem + 'ono';
    const imperf = stem + 'eva';
    const part = stem + 'uto';
    return { ich, du, er, wir, ihr, sie, praeteritum: imperf, perfekt: `ha ${part}` };
  }

  if (lemma.endsWith('ire')) {
    const stem = lemma.slice(0, -3);
    if (isc) {
      const ich = stem + 'isco';
      const du = stem + 'isci';
      const er = stem + 'isce';
      const wir = stem + 'iamo';
      const ihr = stem + 'ite';
      const sie = stem + 'iscono';
      const imperf = stem + 'iva';
      const part = stem + 'ito';
      return { ich, du, er, wir, ihr, sie, praeteritum: imperf, perfekt: `ha ${part}` };
    }
    const ich = stem + 'o';
    const du = stem + 'i';
    const er = stem + 'e';
    const wir = stem + 'iamo';
    const ihr = stem + 'ite';
    const sie = stem + 'ono';
    const imperf = stem + 'iva';
    const part = stem + 'ito';
    return { ich, du, er, wir, ihr, sie, praeteritum: imperf, perfekt: `ha ${part}` };
  }

  return undefined;
}

function italianPlural(lemma: string, genus: 'm' | 'f'): string {
  if (lemma.endsWith('o')) return lemma.slice(0, -1) + 'i';
  if (lemma.endsWith('a')) return lemma.slice(0, -1) + 'e';
  if (lemma.endsWith('e')) return lemma.slice(0, -1) + 'i';
  if (/[àùì]$/.test(lemma)) return lemma;
  if (genus === 'f' && lemma.endsWith('ca')) return lemma.slice(0, -1) + 'he';
  return lemma + 'i';
}

function articleFor(genus: 'm' | 'f', lemma: string): string {
  const vowel = /^[aeiou]/i.test(lemma);
  if (genus === 'f') return vowel ? "l'" : 'la';
  if (/^(z|s[^aeiouh]|gn|ps|x|y)/i.test(lemma)) return vowel ? "l'" : 'lo';
  return vowel ? "l'" : 'il';
}

function stripWiki(s: string | undefined | null): string {
  if (!s) return '';
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*\/?>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
    .replace(/'''([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFocus(htmlIt: string): string[] {
  const spans: string[] = [];
  for (const m of htmlIt.matchAll(/<b\b[^>]*>([\s\S]*?)<\/b>/gi)) {
    const clean = stripWiki(m[1]).replace(/[.,;:!?„"'»«]/g, '').trim();
    if (clean) spans.push(clean);
  }
  return spans;
}

function parseEnDef(en: unknown, preferPos?: string): { def?: string; examples?: RichExample[] } {
  if (!en || typeof en !== 'object') return {};
  const it = (en as Record<string, unknown[]>)['it'] || [];
  if (!Array.isArray(it) || it.length === 0) return {};
  type Entry = {
    partOfSpeech?: string;
    definitions?: { definition: string; parsedExamples?: { example: string; translation: string }[] }[];
  };
  const entries = it as Entry[];
  const entry =
    (preferPos && entries.find((e) => e.partOfSpeech === preferPos)) ||
    entries.find((e) => e.partOfSpeech === 'Noun') ||
    entries.find((e) => e.partOfSpeech === 'Verb') ||
    entries.find((e) => e.partOfSpeech === 'Adjective') ||
    entries[0];
  const definitions = entry?.definitions || [];
  if (definitions.length === 0) return {};
  const isMeta = (s: string) =>
    /^senses?\s+related\s+to\b/i.test(s) ||
    /\b(verbal noun|past participle|present participle|alternative form|alternative spelling|inflection of|feminine|masculine|plural|genitive|dative|accusative|nominative)\s+of\b/i.test(
      s,
    );
  let def = '';
  for (const d of definitions) {
    const cleaned = stripWiki(d.definition);
    if (cleaned && !isMeta(cleaned)) {
      def = cleaned;
      break;
    }
  }
  if (!def) def = stripWiki(definitions[0].definition);
  const examples: RichExample[] = [];
  for (const d of definitions) {
    for (const p of d.parsedExamples || []) {
      const focusSpans = extractFocus(p.example);
      const exIt = stripWiki(p.example);
      const exEn = stripWiki(p.translation);
      if (!exIt || !exEn) continue;
      if (exIt.length > 140 || exEn.length > 140) continue;
      const itWords = exIt.split(/\s+/).filter(Boolean);
      const enWords = exEn.split(/\s+/).filter(Boolean);
      if (itWords.length < 3 || enWords.length < 3) continue;
      const focus =
        focusSpans.length === 0 ? '' : focusSpans.length === 1 ? focusSpans[0] : focusSpans;
      examples.push({ de: exIt, en: exEn, focus });
      if (examples.length >= 3) break;
    }
    if (examples.length >= 3) break;
  }
  return { def, examples };
}

function mapEnPos(pos: string): string {
  if (pos === 'Noun') return 'noun';
  if (pos === 'Verb') return 'verb';
  if (pos === 'Adjective') return 'adjective';
  if (pos === 'Preposition') return 'prep';
  if (pos === 'Conjunction') return 'conjunction';
  if (pos === 'Pronoun' || pos === 'Determiner') return 'pronoun';
  if (pos === 'Possessive adjective' || pos === 'Possessive pronoun') return 'possessive';
  return '';
}

function inflectionLemma(def: string): string | null {
  const s = stripWiki(def);
  const m = s.match(
    /\b(?:inflection|alternative form|alternative spelling|past participle|present participle|gerund|plural|feminine|masculine)\s+of\s+(?:the\s+\w+\s+)?([A-Za-zàèéìòùÀÈÉÌÒÙ'-]+)/i,
  );
  return m?.[1]?.toLowerCase() ?? null;
}

function detectPos(en: unknown): string {
  if (!en || typeof en !== 'object') return '';
  const it = (en as Record<string, unknown[]>)['it'] || [];
  if (!Array.isArray(it) || it.length === 0) return '';
  for (const entry of it as { partOfSpeech?: string; definitions?: { definition: string }[] }[]) {
    for (const d of entry.definitions || []) {
      if (inflectionLemma(d.definition)) return '';
    }
    const mapped = mapEnPos(entry.partOfSpeech || '');
    if (mapped) return mapped;
  }
  return '';
}

async function pmap<T, R>(
  items: T[],
  n: number,
  fn: (item: T, i: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (true) {
        const i = cursor++;
        if (i >= items.length) return;
        results[i] = await fn(items[i], i);
        done++;
        if (onProgress && done % 50 === 0) onProgress(done, items.length);
      }
    }),
  );
  if (onProgress) onProgress(done, items.length);
  return results;
}

function ts(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function slugId(prefix: string, lemma: string): string {
  const slug = lemma
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${prefix}-${slug}`;
}

function tsFocus(focus: string | string[]): string {
  if (Array.isArray(focus)) return '[' + focus.map(ts).join(',') + ']';
  return ts(focus);
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function isQualityRealExample(ex: RichExample): boolean {
  return countWords(ex.de) >= 3 && countWords(ex.en) >= 3;
}

function looksLikeInflection(form: string, lemma: string): boolean {
  if (!form || !lemma) return false;
  const f = form.toLowerCase();
  const stem = lemma.toLowerCase().replace(/(arsi|are|ersi|ere|irsi|ire)$/, '').slice(0, 3);
  if (!stem) return false;
  return f.startsWith(stem) || f.includes(stem);
}

interface Emission {
  type: string;
  level: Level;
  source: string;
  id: string;
  lemma: string;
}

function tsExample(e: { de: string; en: string; focus: string | string[]; subject?: string }): string {
  const parts = [`de:${ts(e.de)}`, `en:${ts(e.en)}`, `focus:${tsFocus(e.focus)}`];
  if (e.subject) parts.push(`subject:${ts(e.subject)}`);
  return `    {${parts.join(',')}},`;
}

function emitNoun(
  lemma: string,
  art: string,
  plural: string,
  enNoun: string,
  level: Level,
  rank: number,
  realExamples: RichExample[],
): Emission | null {
  const id = slugId('gen-noun', lemma);
  const stemKey = lemma.toLowerCase().slice(0, Math.min(4, lemma.length));
  const qualityAll = realExamples.filter((ex) => isQualityRealExample(ex));
  const qualityReal = qualityAll.filter((ex) => {
    const flat = Array.isArray(ex.focus) ? ex.focus.join(' ') : ex.focus;
    return flat && flat.toLowerCase().includes(stemKey);
  });
  const usable = qualityReal.length > 0 ? qualityReal : qualityAll;
  let examples = usable.slice(0, 3).map((ex) => ({
    de: ex.de,
    en: ex.en,
    focus: ex.focus,
  }));
  if (examples.length === 0) {
    if (rank > 900) return null;
    const demo = art.endsWith("'") ? `${art}${lemma}` : `${art} ${lemma}`;
    examples = [
      { de: `Vedo ${demo}.`, en: `I see the ${enNoun}.`, focus: lemma },
      { de: `Ho ${demo}.`, en: `I have the ${enNoun}.`, focus: lemma },
    ];
  }
  const difficulty: 'easy' | 'standard' = usable.length >= 2 ? 'standard' : 'easy';
  const src =
    `  _noun(${ts(id)},${ts(level)},${ts(art)},${ts(lemma)},` +
    `{nom:${ts(art)},akk:${ts(art)},dat:${ts(art)}},` +
    `${ts(plural)},${ts(enNoun)},${ts(difficulty)},[\n` +
    examples.map(tsExample).join('\n') +
    `\n  ]),`;
  return { type: 'noun', level, source: src, id, lemma };
}

function emitVerb(
  lemma: string,
  conj: NonNullable<Parsed['verb']>,
  enInf: string,
  level: Level,
  rank: number,
  realExamples: RichExample[],
): Emission | null {
  const id = slugId('gen-verb', lemma);
  const { ich, du, er, wir, ihr, sie, praeteritum, perfekt } = conj;
  const qualityAll = realExamples.filter((ex) => isQualityRealExample(ex));
  const usable = qualityAll.filter((ex) => {
    const spans = Array.isArray(ex.focus) ? ex.focus : [ex.focus];
    if (spans.length === 0 || !spans[0]) return qualityAll.length <= 2;
    return spans.some((s) => looksLikeInflection(s, lemma));
  });
  const picked = usable.length > 0 ? usable : qualityAll;
  const drillDu = { de: `${du.charAt(0).toUpperCase()}${du.slice(1)}?`, en: `Do you ${enInf}?`, focus: du, subject: 'du' };
  const drillIch = { de: `${ich.charAt(0).toUpperCase()}${ich.slice(1)}.`, en: `I ${enInf}.`, focus: ich, subject: 'ich' };
  let examples: { de: string; en: string; focus: string | string[]; subject?: string }[];
  let difficulty: 'easy' | 'standard';
  if (picked.length >= 2) {
    examples = picked.slice(0, 3).map((ex) => ({ de: ex.de, en: ex.en, focus: ex.focus }));
    difficulty = 'standard';
  } else if (picked.length === 1) {
    examples = [{ de: picked[0].de, en: picked[0].en, focus: picked[0].focus }, drillDu];
    difficulty = 'easy';
  } else {
    if (rank > 900) return null;
    examples = [drillIch, drillDu];
    difficulty = 'easy';
  }
  const src =
    `  _verb(${ts(id)},${ts(level)},${ts(lemma)},` +
    `{ich:${ts(ich)},du:${ts(du)},er:${ts(er)},wir:${ts(wir)},ihr:${ts(ihr)},sie:${ts(sie)}},` +
    `${ts(praeteritum)},${ts(perfekt)},${ts(difficulty)},[\n` +
    examples.map(tsExample).join('\n') +
    `\n  ]),`;
  return { type: 'verb', level, source: src, id, lemma };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function emitGram(
  type: string,
  lemma: string,
  enDef: string,
  level: Level,
  examples: { de: string; en: string; focus: string | string[] }[],
): Emission {
  const id = slugId(`gen-${type}`, lemma);
  const rule = `<b>${escapeHtml(lemma)}</b> — ${escapeHtml(enDef)}`;
  const exSrc = examples
    .map((e) => `    {de:${ts(e.de)},en:${ts(e.en)},focus:${tsFocus(e.focus)}},`)
    .join('\n');
  const src =
    `  { id:${ts(id)}, language:'it', type:${ts(type)}, level:${ts(level)}, ` +
    `rule:${ts(rule)}, word:${ts(lemma)}, examples:[\n${exSrc}\n  ], source:'gen' },`;
  return { type, level, source: src, id, lemma };
}

function cleanGloss(def: string): string {
  let s = def
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/^\s*senses?\s+related\s+to\s+[^,.;:]+[,.;:]\s*/i, '')
    .replace(/^\s*(synonym|alternative form|alternative spelling) of\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const head = s.split(/[,;:]/)[0].trim();
  return (head || s).replace(/\.$/, '').trim();
}

function isPollutedGloss(g: string): boolean {
  if (!g) return true;
  if (g.length < 2 || g.length > 80) return true;
  if (/[{}|;]/.test(g)) return true;
  if (/mw-parser|mw:|wikt-|deprecat/i.test(g)) return true;
  if (/^(see|cf\.?|compare|usage)\b/i.test(g)) return true;
  if (/\b(of|form|sense|participle|alternative|inflection)\s+of\b/i.test(g)) return true;
  return false;
}

function readExistingLemmas(): { ids: Set<string>; words: Set<string> } {
  const ids = new Set<string>();
  const words = new Set<string>();
  for (const file of [HAND_FILE, DEPTH_FILE]) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/id\s*:\s*'([^']+)'/g)) ids.add(m[1]);
    for (const m of src.matchAll(/(?:noun|verb|word)\s*:\s*'([^']+)'/g)) words.add(m[1].toLowerCase());
    for (const m of src.matchAll(/\bverb\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'/g))
      words.add(m[1].toLowerCase());
    for (const m of src.matchAll(/\bnoun\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'/g))
      words.add(m[1].toLowerCase());
    for (const m of src.matchAll(/\bgram\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'[^']+'\s*,\s*\[[\s\S]*?\]\s*,\s*'([^']+)'/g))
      words.add(m[1].toLowerCase());
  }
  return { ids, words };
}

async function main() {
  console.log('▶ Loading De Mauro VdB × frequency wordlist…');
  const all = await loadWordlist();
  console.log(`  VdB lemmas in rank 51–2500: ${all.length}`);

  const seen = new Set<string>();
  const filtered: FreqEntry[] = [];
  for (const e of all) {
    if (/\s/.test(e.lemma)) continue;
    const key = e.lemma.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    filtered.push(e);
    if (filtered.length >= LIMIT) break;
  }

  const existing = readExistingLemmas();
  const dedup = filtered.filter((e) => !existing.words.has(e.lemma.toLowerCase()));
  console.log(`  After dedup vs hand deck: ${dedup.length}`);

  console.log('▶ Fetching Wiktionary data (concurrency=' + CONCURRENCY + ')…');
  const cache = loadWiktCache();
  const t0 = Date.now();
  let saveCounter = 0;
  const toFetch = dedup;
  await pmap(
    toFetch,
    CONCURRENCY,
    async (e) => {
      const lemma = e.lemma;
      const cached = cache[lemma];
      if (cached && (cached.enWikitext || cached.enDef)) return;
      const enWt = await fetchWiktEnWikitext(lemma);
      const enJson = await fetchWiktEnDef(lemma);
      cache[lemma] = { fetchedAt: Date.now(), enWikitext: enWt, enDef: enJson };
      saveCounter++;
      if (saveCounter % 100 === 0) saveWiktCache(cache);
    },
    (done, total) => console.log(`  ${done}/${total} (${Math.round((done / total) * 100)}%)`),
  );
  saveWiktCache(cache);
  console.log(`  …done in ${Math.round((Date.now() - t0) / 1000)}s`);

  console.log('▶ Generating cards…');
  const emissions: Emission[] = [];
  const dropReasons: Record<string, number> = {};
  const drop = (reason: string) => {
    dropReasons[reason] = (dropReasons[reason] || 0) + 1;
  };

  for (const e of toFetch) {
    const lemma = e.lemma;
    const c = cache[lemma];
    const cardType = detectPos(c?.enDef);
    if (!cardType) {
      drop('no POS / no Italian entry');
      continue;
    }

    const enWt = c?.enWikitext || '';
    const preferPos =
      cardType === 'noun' ? 'Noun' : cardType === 'verb' ? 'Verb' : cardType === 'adjective' ? 'Adjective' : undefined;
    const enInfo = parseEnDef(c?.enDef, preferPos);
    const enDef = enInfo.def || '';
    const realExamples = enInfo.examples || [];

    if (cardType === 'noun') {
      const parsedNoun = enWt ? parseItNoun(enWt) : undefined;
      if (!parsedNoun?.genus) {
        drop('noun: no gender');
        continue;
      }
      let rawGloss = enDef ? cleanGloss(enDef) : '';
      rawGloss = rawGloss.replace(/^(a|an|the)\s+/i, '');
      if (!rawGloss || isPollutedGloss(rawGloss)) {
        drop('noun: polluted/empty gloss');
        continue;
      }
      const art = articleFor(parsedNoun.genus, lemma);
      const plural = italianPlural(lemma, parsedNoun.genus);
      const nounEm = emitNoun(lemma, art, plural, rawGloss, e.level, e.rank, realExamples);
      if (!nounEm) {
        drop('noun: no quality examples');
        continue;
      }
      emissions.push(nounEm);
      if (emissions.length >= TARGET) break;
    } else if (cardType === 'verb') {
      if (!lemma.endsWith('are') && !lemma.endsWith('ere') && !lemma.endsWith('ire')) {
        drop('verb: not infinitive');
        continue;
      }
      const conj = enWt ? conjugateItalian(lemma, enWt) : conjugateItalian(lemma, '');
      if (!conj) {
        drop('verb: no conjugation');
        continue;
      }
      const rawInf = enDef ? cleanGloss(enDef).replace(/^to\s+/i, '') : '';
      if (!rawInf || isPollutedGloss(rawInf)) {
        drop('verb: polluted/empty gloss');
        continue;
      }
      const verbEm = emitVerb(lemma, conj, rawInf, e.level, e.rank, realExamples);
      if (!verbEm) {
        drop('verb: no quality examples');
        continue;
      }
      emissions.push(verbEm);
      if (emissions.length >= TARGET) break;
    } else {
      const cleanedDef = cleanGloss(enDef);
      if (!cleanedDef || isPollutedGloss(cleanedDef)) {
        drop(`${cardType}: polluted/empty gloss`);
        continue;
      }
      let examples = realExamples
        .filter((ex) => countWords(ex.de) >= 3 && countWords(ex.en) >= 3)
        .slice(0, 3)
        .map((ex) => ({
          de: ex.de,
          en: ex.en,
          focus: ex.focus || lemma,
        }));
      if (examples.length === 0 && e.rank <= 900) {
        examples = [
          { de: `È molto ${lemma}.`, en: `It is very ${cleanedDef}.`, focus: lemma },
          { de: `Non è ${lemma}.`, en: `It is not ${cleanedDef}.`, focus: lemma },
        ];
      }
      if (examples.length === 0) {
        drop(`${cardType}: no usable examples`);
        continue;
      }
      emissions.push(emitGram(cardType, lemma, cleanedDef, e.level, examples));
      if (emissions.length >= TARGET) break;
    }
  }

  if (emissions.length >= TARGET) {
    console.log(`  (capped at --target=${TARGET})`);
  }

  console.log(`  Emitted: ${emissions.length}`);
  console.log('  Dropped by reason:');
  for (const [reason, n] of Object.entries(dropReasons).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(4)}  ${reason}`);
  }

  console.log(`▶ Writing ${path.relative(ROOT, OUT_FILE)}`);
  const byType: Record<string, Emission[]> = {};
  for (const em of emissions) (byType[em.type] = byType[em.type] || []).push(em);

  const header = `// AUTO-GENERATED by scripts/build-deck-it.ts — do not edit by hand.
// Source: De Mauro VdB · Hermit Dave it_50k ranks · en.wiktionary.org

import type { CardDef, Conjugations, Example, Level } from './types';

function _verb(id: string, lv: Level, v: string, c: Conjugations, imperf: string, passato: string, diff: 'easy'|'standard'|'hard', ex: Example[]): CardDef {
  return { id, language: 'it', type: 'verb', level: lv, verb: v, conjugations: c, praeteritum: imperf, perfekt: passato, examples: ex, source: 'gen', difficulty: diff };
}

function _noun(id: string, lv: Level, art: string, n: string, forms: {nom:string;akk:string;dat:string}, pl: string, _enN: string, diff: 'easy'|'standard'|'hard', ex: Example[]): CardDef {
  return { id, language: 'it', type: 'noun', level: lv, article: art as CardDef['article'], noun: n, nounForms: forms, plural: pl, examples: ex, source: 'gen', difficulty: diff };
}

`;

  let body = '';
  const emitGroup = (title: string, items: Emission[]) => {
    body += `\n// ── ${title} (${items.length}) ─────────────────────────────────\n\n`;
    if (items.length === 0) {
      body += `export const GENERATED_${title.toUpperCase()}_IT: CardDef[] = [];\n`;
      return;
    }
    body += `export const GENERATED_${title.toUpperCase()}_IT: CardDef[] = [\n`;
    body += items.map((it) => it.source).join('\n');
    body += '\n];\n';
  };

  emitGroup('verbs', byType.verb || []);
  emitGroup('nouns', byType.noun || []);
  emitGroup('adjectives', byType.adjective || []);
  emitGroup('preps', byType.prep || []);
  emitGroup('conjunctions', byType.conjunction || []);
  emitGroup('pronouns', byType.pronoun || []);
  emitGroup('possessives', byType.possessive || []);

  body += `
export const CARDS_GENERATED_IT: CardDef[] = [
  ...GENERATED_VERBS_IT,
  ...GENERATED_NOUNS_IT,
  ...GENERATED_ADJECTIVES_IT,
  ...GENERATED_PREPS_IT,
  ...GENERATED_CONJUNCTIONS_IT,
  ...GENERATED_PRONOUNS_IT,
  ...GENERATED_POSSESSIVES_IT,
];
`;

  fs.writeFileSync(OUT_FILE, header + body);

  console.log('\n=== Summary ===');
  for (const t of Object.keys(byType).sort()) {
    console.log(`  ${t.padEnd(12)} ${byType[t].length}`);
  }
  console.log(`  TOTAL        ${emissions.length}`);
  console.log(`\n✅ Wrote ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
