/**
 * Build the German A1+A2 deck from public sources.
 *
 *  - Wordlist: DWDS Goethe-Zertifikat A1/A2 (https://www.dwds.de/api/lemma/goethe/{level}.json)
 *  - Inflection (plural / verb conjugations): de.wiktionary.org parse API
 *  - English definitions + bilingual example sentences: en.wiktionary.org REST v1
 *
 * Outputs `src/lib/cards-generated.ts`, which is concatenated with the hand-curated
 * deck in `src/lib/cards.ts`. Cached HTTP responses live under `scripts/.cache/`.
 *
 * Usage:
 *   pnpm build:deck                   # incremental, uses cache
 *   pnpm build:deck --refresh         # bust the wikt cache (re-fetch all)
 *   pnpm build:deck --limit=100       # cap entries (debug)
 */

import fs from 'node:fs';
import path from 'node:path';

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache');
const WIKT_CACHE = path.join(CACHE_DIR, 'wikt.json');
const OUT_FILE = path.join(ROOT, 'src', 'lib', 'cards-generated.ts');
const HAND_FILE = path.join(ROOT, 'src', 'lib', 'cards.ts');

// ─── CLI ──────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const REFRESH = argv.includes('--refresh');
const LIMIT_ARG = argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : Infinity;
const CONCURRENCY_ARG = argv.find((a) => a.startsWith('--concurrency='));
const CONCURRENCY = CONCURRENCY_ARG ? parseInt(CONCURRENCY_ARG.split('=')[1], 10) : 2;
const UA = 'gemma-deck-builder/0.1 (https://gemma-iota.vercel.app; vocab learning)';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Types ────────────────────────────────────────────────────────────────────

type Article = 'der' | 'die' | 'das';
type Level = 'A1' | 'A2';

interface DwdsEntry {
  pos: string;
  articles: string[];
  genera: string[];
  url: string;
  sch: { lemma: string; hidx: string | null }[];
  level: Level;
}

interface WiktCacheEntry {
  fetchedAt: number;
  deWikitext: string | null;
  enDef: unknown | null;
}

type WiktCache = Record<string, WiktCacheEntry>;

interface Parsed {
  noun?: {
    plural?: string;
    genus?: 'm' | 'f' | 'n';
    akkSg?: string;
    datSg?: string;
    uncountable?: boolean;
  };
  verb?: {
    ich?: string;
    du?: string;
    er?: string;
    praeteritum?: string;
    partizip2?: string;
    hilfsverb: 'haben' | 'sein';
    reflexive?: boolean;
    impersonal?: boolean;
  };
  enDef?: string;
  enExamples?: { de: string; en: string }[];
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { 'User-Agent': UA, accept: 'application/json' } });
  if (!r.ok) throw new Error(`${url}: ${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

async function fetchText(url: string, attempts = 4): Promise<string | null> {
  let lastErr: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, accept: 'application/json' } });
      if (r.status === 429 || r.status === 503) {
        const wait = 1000 * Math.pow(2, i) + Math.random() * 500;
        await sleep(wait);
        continue;
      }
      if (!r.ok) {
        // 404 / 400 — page doesn't exist, no point retrying
        return null;
      }
      return await r.text();
    } catch (e) {
      lastErr = e;
      await sleep(500 * (i + 1) + Math.random() * 300);
    }
  }
  if (lastErr) console.error('  fetch failed:', url.slice(0, 100), String(lastErr).slice(0, 80));
  return null;
}

async function fetchDwds(level: Level): Promise<DwdsEntry[]> {
  const cache = path.join(CACHE_DIR, `dwds-${level}.json`);
  if (fs.existsSync(cache)) {
    return JSON.parse(fs.readFileSync(cache, 'utf8'));
  }
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const data = await fetchJson<Omit<DwdsEntry, 'level'>[]>(
    `https://www.dwds.de/api/lemma/goethe/${level}.json`,
  );
  const enriched = data.map((d) => ({ ...d, level }));
  fs.writeFileSync(cache, JSON.stringify(enriched));
  return enriched;
}

// ─── Wiktionary fetch ────────────────────────────────────────────────────────

function loadWiktCache(): WiktCache {
  if (REFRESH || !fs.existsSync(WIKT_CACHE)) return {};
  return JSON.parse(fs.readFileSync(WIKT_CACHE, 'utf8'));
}

function saveWiktCache(cache: WiktCache) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(WIKT_CACHE, JSON.stringify(cache));
}

async function fetchWiktDeWikitext(lemma: string): Promise<string | null> {
  const url = `https://de.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(
    lemma,
  )}&prop=wikitext&format=json&formatversion=2`;
  const text = await fetchText(url);
  if (!text) return null;
  try {
    const j = JSON.parse(text);
    return j?.parse?.wikitext ?? null;
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

// ─── Wikitext parsing ────────────────────────────────────────────────────────

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

function tplFields(tpl: string): Record<string, string> {
  const inner = tpl.slice(2, -2);
  const parts: string[] = [];
  let depth = 0;
  let buf = '';
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    const next = inner[i + 1];
    if (c === '{' && next === '{') {
      depth++;
      buf += c;
      continue;
    }
    if (c === '}' && next === '}') {
      depth--;
      buf += c;
      continue;
    }
    if (c === '|' && depth === 0) {
      parts.push(buf);
      buf = '';
      continue;
    }
    buf += c;
  }
  parts.push(buf);
  const fields: Record<string, string> = {};
  for (const p of parts.slice(1)) {
    const eq = p.indexOf('=');
    if (eq < 0) continue;
    const k = p.slice(0, eq).trim();
    const v = p.slice(eq + 1).trim();
    if (!fields[k]) fields[k] = v;
  }
  return fields;
}

function parseSubstantiv(wt: string): {
  plural?: string;
  genus?: 'm' | 'f' | 'n';
  /** Akk singular form of the noun itself (not the article). For weak / n-nouns
   * this differs from the nominative, e.g. Mensch → Menschen. */
  akkSg?: string;
  /** Dat singular form. */
  datSg?: string;
  /** True when wiktionary marks plural-only or plural is absent / "—". */
  uncountable?: boolean;
} | undefined {
  const tpl = extractTemplate(wt, 'Deutsch Substantiv Übersicht');
  if (!tpl) return undefined;
  const f = tplFields(tpl);
  const rawPlural = (f['Nominativ Plural'] || f['Nominativ Plural*'] || '').trim();
  const uncountable = !rawPlural || rawPlural === '—' || /^-+$/.test(rawPlural);
  const plural = uncountable ? undefined : rawPlural;
  const g = (f['Genus'] || '').toLowerCase();
  const genus: 'm' | 'f' | 'n' | undefined =
    g.startsWith('m') ? 'm' : g.startsWith('f') ? 'f' : g.startsWith('n') ? 'n' : undefined;
  const nomSg = (f['Nominativ Singular'] || '').trim();
  const akkSg = (f['Akkusativ Singular'] || '').trim() || undefined;
  const datSg = (f['Dativ Singular'] || '').trim() || undefined;
  return { plural, genus, akkSg, datSg, uncountable };
}

/** True when wiktionary marks sense [1] as reflexive (sich …). */
function isPrimaryReflexiveVerb(wt: string): boolean {
  if (/\{\{Wortart\|reflexives Verb\|Deutsch\}\}/i.test(wt)) return true;
  const meanings = wt.match(/\{\{Bedeutungen\}\}([\s\S]*?)(?=\n\{\{|\n==|$)/)?.[1] || '';
  if (!meanings) return false;
  // Sense [1] line tagged {{K|refl...}} or definition starts with "sich".
  if (/:\[1\][^\n]*\{\{K\|[^}]*\brefl\b/i.test(meanings)) return true;
  if (/:\[1\][^\n]*\bsich\b/i.test(meanings)) return true;
  // Bullet immediately before sense [1], e.g. "* {{K|refl.}}\n:[1] sich …"
  const chunkBefore2 = meanings.split(/:\[2\]/)[0] || meanings.slice(0, 500);
  if (/\{\{K\|[^}]*\brefl\b/i.test(chunkBefore2)) return true;
  return false;
}

function parseVerb(wt: string): Parsed['verb'] {
  const tpl = extractTemplate(wt, 'Deutsch Verb Übersicht');
  if (!tpl) return undefined;
  const f = tplFields(tpl);
  const hilfsverbRaw = (f['Hilfsverb'] || '').toLowerCase();
  const hilfsverb: 'haben' | 'sein' = hilfsverbRaw === 'sein' ? 'sein' : 'haben';
  const ich = (f['Präsens_ich'] || '').trim();
  const reflexiveFromIch = /\bmich\b/i.test(ich);
  const reflexive = reflexiveFromIch || isPrimaryReflexiveVerb(wt);
  // Impersonal verbs only conjugate as "es ..." (regnen, schneien, hageln, dämmern, …).
  // Detect by Präsens_ich == "—" or by absence of ich/du and presence of "es" template.
  const impersonal =
    ich === '—' ||
    ich === '-' ||
    (!ich && /\{\{Wortart\|unpersönliches Verb/i.test(wt));
  return {
    ich: ich || undefined,
    du: f['Präsens_du'] || undefined,
    er: f['Präsens_er, sie, es'] || undefined,
    praeteritum: f['Präteritum_ich'] || undefined,
    partizip2: f['Partizip II'] || undefined,
    hilfsverb,
    reflexive,
    impersonal,
  };
}

function stripWiki(s: string | undefined | null): string {
  if (!s) return '';
  return s
    // Strip <style> / <script> blocks INCLUDING their contents BEFORE stripping
    // generic tags, otherwise the CSS body leaks into the gloss as e.g.
    // "{font-style:italic}.mw-parser-output .deprecated{color:...}".
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Drop <link rel="..."> self-closing meta tags from REST API HTML
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

interface RichExample {
  de: string;
  en: string;
  focus: string | string[];
}

/**
 * Pull a clean focus span out of <b>...</b> markers in an HTML example string.
 * en.wiktionary marks the lemma's surface form(s) with <b>. We capture them
 * before stripping all tags so we can use them as the cloze focus.
 *
 * Multi-bold (e.g. separable verbs `<b>gibt</b> ... <b>ab</b>`) returns an array.
 */
function extractFocus(htmlDe: string): string[] {
  const matches = Array.from(htmlDe.matchAll(/<b\b[^>]*>([\s\S]*?)<\/b>/gi));
  const spans: string[] = [];
  for (const m of matches) {
    const clean = stripWiki(m[1]).replace(/[.,;:!?„"'»«]/g, '').trim();
    if (clean) spans.push(clean);
  }
  return spans;
}

function parseEnDef(
  en: unknown,
  preferPos?: string,
): { def?: string; examples?: RichExample[] } {
  if (!en || typeof en !== 'object') return {};
  const de = (en as Record<string, unknown[]>)['de'] || [];
  if (!Array.isArray(de) || de.length === 0) return {};
  type Entry = {
    partOfSpeech?: string;
    definitions?: { definition: string; parsedExamples?: { example: string; translation: string }[] }[];
  };
  const entries = de as Entry[];
  const entry =
    (preferPos && entries.find((e) => e.partOfSpeech === preferPos)) ||
    entries.find((e) => e.partOfSpeech === 'Noun') ||
    entries.find((e) => e.partOfSpeech === 'Verb') ||
    entries.find((e) => e.partOfSpeech === 'Adjective') ||
    entries[0];
  const definitions = entry?.definitions || [];
  if (definitions.length === 0) return {};
  // Find first non-meta definition. Wiktionary stores headers like "senses related to dressing"
  // or cross-references like "verbal noun of anziehen" as the first definition entry.
  const isMeta = (s: string) =>
    /^senses?\s+related\s+to\b/i.test(s) ||
    /\b(verbal noun|past participle|present participle|alternative form|alternative spelling|alternative case form|inflection of|feminine|masculine|plural|genitive|dative|accusative|nominative)\s+of\b/i.test(
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
      const exDe = stripWiki(p.example);
      const exEn = stripWiki(p.translation);
      if (!exDe || !exEn) continue;
      if (exDe.length > 140 || exEn.length > 140) continue; // too long for a card
      // Must be a real sentence (≥3 words on each side). Wiktionary sometimes
      // includes bare collocations like "Karten spielen" that aren't useful
      // as standalone learning material.
      const deWords = exDe.split(/\s+/).filter(Boolean);
      const enWords = exEn.split(/\s+/).filter(Boolean);
      if (deWords.length < 3 || enWords.length < 3) continue;
      const focus =
        focusSpans.length === 0
          ? ''
          : focusSpans.length === 1
          ? focusSpans[0]
          : focusSpans;
      examples.push({ de: exDe, en: exEn, focus });
      if (examples.length >= 3) break;
    }
    if (examples.length >= 3) break;
  }
  return { def, examples };
}

// ─── pmap ─────────────────────────────────────────────────────────────────────

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

// ─── Card builders (TS source emission) ───────────────────────────────────────

function ts(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function slugId(prefix: string, lemma: string): string {
  const slug = lemma
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[äöü]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue' })[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${prefix}-${slug}`;
}

interface Emission {
  type: string;
  level: Level;
  source: string;
  id: string;
  lemma: string;
}

type NounExample = { de: string; en: string; focus: string | string[]; caseLabel?: string };

function tsFocus(focus: string | string[]): string {
  if (Array.isArray(focus)) return '[' + focus.map(ts).join(',') + ']';
  return ts(focus);
}

function tsExample(e: NounExample): string {
  const parts = [`de:${ts(e.de)}`, `en:${ts(e.en)}`, `focus:${tsFocus(e.focus)}`];
  if (e.caseLabel) parts.push(`caseLabel:${ts(e.caseLabel)}`);
  return `    {${parts.join(',')}},`;
}

function emitNoun(
  lemma: string,
  article: Article,
  parsedNoun: NonNullable<Parsed['noun']>,
  enNoun: string,
  level: Level,
  realExamples: RichExample[],
): Emission | null {
  const id = slugId('gen-noun', lemma);
  const forms =
    article === 'der'
      ? { nom: 'der', akk: 'den', dat: 'dem' }
      : article === 'die'
      ? { nom: 'die', akk: 'die', dat: 'der' }
      : { nom: 'das', akk: 'das', dat: 'dem' };
  // Surface form of the noun across cases. For most nouns the singular is
  // identical to the lemma in all three cases; weak / n-nouns add -n / -en in
  // akk/dat (Mensch → Menschen). When wiktionary disagrees with the lemma we
  // trust wiktionary.
  const nomForm = lemma;
  const akkForm = parsedNoun.akkSg && parsedNoun.akkSg !== '—' ? parsedNoun.akkSg : lemma;
  const datForm = parsedNoun.datSg && parsedNoun.datSg !== '—' ? parsedNoun.datSg : lemma;
  const NOM = forms.nom[0].toUpperCase() + forms.nom.slice(1);

  // Mix strategy for nouns:
  //  - Always show the three core cases (Nom / Akk / Dat) so the learner gets
  //    full article+case practice.
  //  - When wiktionary has a real-world bilingual example that contains the
  //    lemma, swap it in for the Nom template — this gives one authentic
  //    usage alongside the structured case drills.
  const stemKey = lemma.toLowerCase().slice(0, Math.min(4, lemma.length));
  const realNomCandidates = realExamples.filter((ex) => {
    const flat = Array.isArray(ex.focus) ? ex.focus.join(' ') : ex.focus;
    return flat && flat.toLowerCase().includes(stemKey);
  });
  const realFirst = realNomCandidates[0];
  // Real example deliberately has no caseLabel — the case of the bolded form
  // in wiktionary's sentence might be Akk or Dat, and a wrong label would
  // confuse the learner. The two templated drills below still carry case
  // labels so the user practices den/dem explicitly.
  const examples: NounExample[] = [
    realFirst
      ? { de: realFirst.de, en: realFirst.en, focus: realFirst.focus }
      : { de: `${NOM} ${nomForm} ist hier.`, en: `The ${enNoun} is here.`, focus: NOM, caseLabel: 'Nom' },
    { de: `Ich sehe ${forms.akk} ${akkForm}.`, en: `I see the ${enNoun}.`, focus: forms.akk, caseLabel: 'Akk' },
    { de: `Ich spreche von ${forms.dat} ${datForm}.`, en: `I speak about the ${enNoun}.`, focus: forms.dat, caseLabel: 'Dat' },
  ];

  // Plural — emit "—" sentinel for uncountable, never the singular as a fake plural.
  const pluralOut = parsedNoun.uncountable ? '—' : (parsedNoun.plural || '—');

  const src =
    `  _noun(${ts(id)},${ts(level)},${ts(article)},${ts(lemma)},` +
    `{nom:${ts(forms.nom)},akk:${ts(forms.akk)},dat:${ts(forms.dat)}},` +
    `${ts(pluralOut)},${ts(enNoun)},[\n` +
    examples.map(tsExample).join('\n') +
    `\n  ]),`;
  return { type: 'noun', level, source: src, id, lemma };
}

function pluralize3rd(en: string): string {
  const parts = en.split(/\s+/);
  if (parts.length === 0) return en;
  const first = parts[0];
  let inflected = first;
  if (/[sxz]$/.test(first) || /(ch|sh)$/.test(first)) inflected = first + 'es';
  else if (/[^aeiou]y$/.test(first)) inflected = first.slice(0, -1) + 'ies';
  else inflected = first + 's';
  return [inflected, ...parts.slice(1)].join(' ');
}

function needsETInsert(stem: string): boolean {
  // Standard rule (simplified): -et instead of -t when stem ends in t/d, or m/n
  // preceded by another (non-liquid) consonant (atmen → atmet).
  if (/[td]$/.test(stem)) return true;
  if (/[^aeiouhlrmn][mn]$/i.test(stem)) return true;
  return false;
}

function deriveConjugations(
  lemma: string,
  conj: NonNullable<Parsed['verb']>,
): { ich: string; du: string; er: string; wir: string; ihr: string; sie: string } {
  const ichRaw = conj.ich || '';
  const isSeparable = /\s/.test(ichRaw);

  if (isSeparable) {
    const [, prefix] = ichRaw.split(/\s+/);
    const baseInf = lemma.startsWith(prefix) ? lemma.slice(prefix.length) : lemma;
    const stem = baseInf.replace(/en$/, '');
    const ihrEnd = needsETInsert(stem) ? 'et' : 't';
    return {
      ich: ichRaw,
      du: conj.du || `${stem}${needsETInsert(stem) ? 'est' : 'st'} ${prefix}`,
      er: conj.er || `${stem}${ihrEnd} ${prefix}`,
      wir: `${baseInf} ${prefix}`,
      ihr: `${stem}${ihrEnd} ${prefix}`,
      sie: `${baseInf} ${prefix}`,
    };
  }

  const stem = lemma.replace(/en$/, '');
  const ihrEnd = needsETInsert(stem) ? 'et' : 't';
  return {
    ich: ichRaw || `${stem}e`,
    du: conj.du || `${stem}${needsETInsert(stem) ? 'est' : 'st'}`,
    er: conj.er || `${stem}${ihrEnd}`,
    wir: lemma,
    ihr: `${stem}${ihrEnd}`,
    sie: lemma,
  };
}

type VerbExample = { de: string; en: string; focus: string | string[]; subject?: string };

function tsVerbExample(e: VerbExample): string {
  const parts = [`de:${ts(e.de)}`, `en:${ts(e.en)}`, `focus:${tsFocus(e.focus)}`];
  if (e.subject) parts.push(`subject:${ts(e.subject)}`);
  return `    {${parts.join(',')}},`;
}

/** Heuristic: does the surface form `f` look like an inflection of `lemma`? */
function looksLikeInflection(form: string, lemma: string): boolean {
  if (!form || !lemma) return false;
  const f = form.toLowerCase();
  const l = lemma.toLowerCase();
  // Share at least the first 3 chars of the stem (most German verbs preserve the
  // initial consonant cluster: gehen → ging, lesen → liest, sprechen → spricht).
  const stem = l.replace(/en$|n$/, '').slice(0, 3);
  if (!stem) return false;
  return f.startsWith(stem) || f.includes(stem);
}

function emitVerb(
  lemma: string,
  conj: NonNullable<Parsed['verb']>,
  enInf: string,
  level: Level,
  realExamples: RichExample[],
): Emission {
  const id = slugId('gen-verb', lemma);
  const c = deriveConjugations(lemma, conj);
  const { ich, du, er, wir, ihr, sie: sie3 } = c;
  const stem = lemma.replace(/en$/, '');
  const praet = conj.praeteritum || `${stem}te`;
  const partizip2 = conj.partizip2 || `ge${stem}t`;
  const auxConj = conj.hilfsverb === 'sein' ? 'ist' : 'hat';
  const perf = `${auxConj} ${partizip2}`;
  const en3 = pluralize3rd(enInf);

  // Real-world examples from en.wiktionary where the bolded focus span actually
  // looks like an inflection of this verb (filters out examples that happened
  // to bold an unrelated word).
  const usable = realExamples.filter((ex) => {
    const spans = Array.isArray(ex.focus) ? ex.focus : [ex.focus];
    if (spans.length === 0 || !spans[0]) return false;
    return spans.some((s) => looksLikeInflection(s, lemma));
  });

  // Mix strategy: lead with a real example when available, then drill du/er
  // forms so the learner still gets active conjugation practice.
  const drillDu: VerbExample = { de: `Du ${du}?`, en: `Do you ${enInf}?`, focus: du, subject: 'du' };
  const drillEr: VerbExample = { de: `Er ${er}.`, en: `He ${en3}.`, focus: er, subject: 'er' };
  const drillIch: VerbExample = { de: `Ich ${ich}.`, en: `I ${enInf}.`, focus: ich, subject: 'ich' };
  let examples: VerbExample[];
  if (usable.length >= 2) {
    examples = usable.slice(0, 3).map((ex) => ({ de: ex.de, en: ex.en, focus: ex.focus }));
  } else if (usable.length === 1) {
    examples = [{ de: usable[0].de, en: usable[0].en, focus: usable[0].focus }, drillDu, drillEr];
  } else {
    examples = [drillIch, drillDu, drillEr];
  }

  const src =
    `  _verb(${ts(id)},${ts(level)},${ts(lemma)},` +
    `{ich:${ts(ich)},du:${ts(du)},er:${ts(er)},wir:${ts(wir)},ihr:${ts(ihr)},sie:${ts(sie3)}},` +
    `${ts(praet)},${ts(perf)},[\n` +
    examples.map(tsVerbExample).join('\n') +
    `\n  ]),`;
  return { type: 'verb', level, source: src, id, lemma };
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
    `  { id:${ts(id)}, type:${ts(type)}, level:${ts(level)}, ` +
    `rule:${ts(rule)}, word:${ts(lemma)}, examples:[\n${exSrc}\n  ] },`;
  return { type, level, source: src, id, lemma };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Mapping DWDS POS → CardType ─────────────────────────────────────────────

function mapPos(pos: string): string {
  // Core PoS → card type.
  if (pos === 'Substantiv') return 'noun';
  if (pos === 'Verb') return 'verb';
  if (pos === 'Adjektiv' || pos === 'partizipiales Adjektiv') return 'adjective';
  if (pos === 'Präposition' || pos === 'Präposition + Artikel') return 'prep';
  if (pos === 'Konjunktion') return 'conjunction';
  if (
    pos === 'Pronomen' ||
    pos === 'Personalpronomen' ||
    pos === 'Demonstrativpronomen' ||
    pos === 'Indefinitpronomen' ||
    pos === 'Interrogativpronomen' ||
    pos === 'Relativpronomen' ||
    pos === 'Reflexivpronomen' ||
    pos === 'reziprokes Pronomen'
  )
    return 'pronoun';
  if (pos === 'Possessivpronomen') return 'possessive';
  // Intentionally dropped — no clean fit in current card-type schema, and
  // generated cards for these were systematically low-quality (audit, May 2026):
  //   Adverb, partizipiales Adverb, Pronominaladverb  → no 'adverb' type
  //   Kardinalzahlwort, Ordinalzahlwort, Bruchzahlwort → numbers, learn elsewhere
  //   Mehrwortausdruck                                → phrases don't fit lemma schema
  //   Interjektion, Partikel                           → discourse markers, low pedagogical value
  //   bestimmter Artikel, unbestimmter Artikel         → already covered by hand-curated
  //   Komparativ, Superlativ                           → forms, not lemmas
  //   Symbol, Affix, Eigenname, Imperativ              → not real vocab
  return '';
}

// ─── Existing card de-duplication ────────────────────────────────────────────

function readExistingLemmas(): { ids: Set<string>; words: Set<string> } {
  const src = fs.readFileSync(HAND_FILE, 'utf8');
  const ids = new Set<string>();
  const words = new Set<string>();
  for (const m of src.matchAll(/id\s*:\s*'([^']+)'/g)) ids.add(m[1]);
  for (const m of src.matchAll(/(?:noun|verb|word)\s*:\s*'([^']+)'/g)) words.add(m[1].toLowerCase());
  // also pick up bare positional verb('...','A1','sein',...) and noun('...','der','Mann',...)
  for (const m of src.matchAll(/\bverb\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'/g))
    words.add(m[1].toLowerCase());
  for (const m of src.matchAll(/\bnoun\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'/g))
    words.add(m[1].toLowerCase());
  return { ids, words };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function lemmaForLookup(e: DwdsEntry): string {
  return e.sch?.[0]?.lemma || '';
}

function pickArticle(e: DwdsEntry): Article | undefined {
  for (const a of e.articles) {
    if (a === 'der' || a === 'die' || a === 'das') return a;
  }
  return undefined;
}

async function main() {
  console.log('▶ Fetching DWDS Goethe wordlists…');
  const a1 = await fetchDwds('A1');
  const a2 = await fetchDwds('A2');
  console.log(`  A1: ${a1.length}  A2: ${a2.length}  total: ${a1.length + a2.length}`);

  const all: DwdsEntry[] = [...a1, ...a2];
  const seen = new Set<string>();
  const filtered: DwdsEntry[] = [];
  for (const e of all) {
    const lemma = lemmaForLookup(e);
    const cardType = mapPos(e.pos);
    if (!lemma || !cardType) continue;
    const key = `${cardType}::${lemma.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    filtered.push(e);
    if (filtered.length >= LIMIT) break;
  }
  console.log(`  After POS filter & dedup: ${filtered.length}`);

  // existing dedup
  const existing = readExistingLemmas();
  const dedup = filtered.filter((e) => !existing.words.has(lemmaForLookup(e).toLowerCase()));
  console.log(`  After dedup vs hand-curated cards: ${dedup.length}`);

  // Wiktionary fetches — sequential per worker (DE then EN) and retry on rate-limit.
  // Re-fetch entries cached with both fields empty (likely earlier rate-limit drops).
  console.log('▶ Fetching Wiktionary data (concurrency=' + CONCURRENCY + ')…');
  const cache = loadWiktCache();
  const t0 = Date.now();
  let saveCounter = 0;
  await pmap(
    dedup,
    CONCURRENCY,
    async (e) => {
      const lemma = lemmaForLookup(e);
      const cached = cache[lemma];
      // Skip if any field has actual data; re-fetch only when both empty (transient earlier failure).
      if (cached && (cached.deWikitext || cached.enDef)) return;
      const deWt = await fetchWiktDeWikitext(lemma);
      const enJson = await fetchWiktEnDef(lemma);
      cache[lemma] = { fetchedAt: Date.now(), deWikitext: deWt, enDef: enJson };
      saveCounter++;
      if (saveCounter % 100 === 0) saveWiktCache(cache);
    },
    (done, total) => console.log(`  ${done}/${total} (${Math.round((done / total) * 100)}%)`),
  );
  saveWiktCache(cache);
  console.log(`  …done in ${Math.round((Date.now() - t0) / 1000)}s`);

  // Build cards
  console.log('▶ Generating cards…');
  const emissions: Emission[] = [];
  const dropReasons: Record<string, number> = {};
  const drop = (reason: string) => {
    dropReasons[reason] = (dropReasons[reason] || 0) + 1;
  };
  for (const e of dedup) {
    const lemma = lemmaForLookup(e);
    const cardType = mapPos(e.pos);
    const c = cache[lemma];
    const wt = c?.deWikitext || '';
    const parsed: Parsed = {};
    if (wt) {
      parsed.noun = parseSubstantiv(wt);
      parsed.verb = parseVerb(wt);
    }
    const preferPos =
      cardType === 'noun' ? 'Noun' : cardType === 'verb' ? 'Verb' : cardType === 'adjective' ? 'Adjective' : undefined;
    const enInfo = parseEnDef(c?.enDef, preferPos);
    const enDef = enInfo.def || '';
    const realExamples = enInfo.examples || [];

    // Skip multi-word lemmas — phrasal expressions don't fit the noun/verb card schema cleanly.
    if (/\s/.test(lemma)) {
      drop('multi-word lemma');
      continue;
    }

    if (cardType === 'noun') {
      const article = pickArticle(e);
      if (!article) {
        drop('noun: no article');
        continue;
      }
      if (!parsed.noun) {
        drop('noun: no wiktionary Übersicht');
        continue;
      }
      // Weak / n-noun (Mensch → den Menschen): when Akk-Sg ≠ Nom-Sg the
      // mechanical template "Ich sehe den X" would produce wrong output. We
      // do honor wiktionary's akkSg/datSg in emitNoun, but only when the
      // forms are present and look sane. Otherwise skip rather than guess.
      if (parsed.noun.akkSg && parsed.noun.akkSg !== lemma) {
        // Only skip if we can't trust the form (e.g. contains a slash listing
        // multiple acceptable forms which the template can't render).
        if (/[/,]/.test(parsed.noun.akkSg)) {
          drop('noun: ambiguous akk form');
          continue;
        }
      }
      let rawGloss = enDef ? cleanGloss(enDef) : '';
      // Strip leading article so the template "I see the X" doesn't end up as
      // "I see the a sun" / "I see the the sun".
      rawGloss = rawGloss.replace(/^(a|an|the)\s+/i, '');
      if (!rawGloss || isPollutedGloss(rawGloss)) {
        drop('noun: polluted/empty gloss');
        continue;
      }
      emissions.push(emitNoun(lemma, article, parsed.noun, rawGloss, e.level, realExamples) as Emission);
    } else if (cardType === 'verb') {
      if (!parsed.verb || !parsed.verb.ich) {
        drop('verb: no conjugation');
        continue;
      }
      if (parsed.verb.reflexive) {
        drop('verb: reflexive (needs sich)');
        continue;
      }
      if (parsed.verb.impersonal) {
        drop('verb: impersonal');
        continue;
      }
      const rawInf = enDef ? cleanGloss(enDef).replace(/^to\s+/i, '') : '';
      if (!rawInf || isPollutedGloss(rawInf)) {
        drop('verb: polluted/empty gloss');
        continue;
      }
      emissions.push(emitVerb(lemma, parsed.verb, rawInf, e.level, realExamples));
    } else {
      // gram-style card (adjective / prep / conjunction / pronoun / possessive)
      const cleanedDef = cleanGloss(enDef);
      if (!cleanedDef || isPollutedGloss(cleanedDef)) {
        drop(`${cardType}: polluted/empty gloss`);
        continue;
      }
      // Use real examples (with focus markers) where available; otherwise drop
      // the card. A "Ja." or one-word example has no pedagogical value.
      const examples = realExamples
        .filter((ex) => /\s/.test(ex.de) && /\s/.test(ex.en))
        .slice(0, 3)
        .map((ex) => ({
          de: ex.de,
          en: ex.en,
          focus: ex.focus || lemma,
        }));
      if (examples.length === 0) {
        drop(`${cardType}: no usable examples`);
        continue;
      }
      emissions.push(emitGram(cardType, lemma, cleanedDef, e.level, examples));
    }
  }
  console.log(`  Emitted: ${emissions.length}`);
  console.log(`  Dropped by reason:`);
  for (const [reason, n] of Object.entries(dropReasons).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(4)}  ${reason}`);
  }

  // Write output
  console.log(`▶ Writing ${path.relative(ROOT, OUT_FILE)}`);
  const byType: Record<string, Emission[]> = {};
  for (const em of emissions) (byType[em.type] = byType[em.type] || []).push(em);

  const header = `// AUTO-GENERATED by scripts/build-deck.ts — do not edit by hand.
// Source: DWDS Goethe-Zertifikat A1+A2 wordlist · de.wiktionary.org · en.wiktionary.org

import type { CardDef, Conjugations, Example, Level } from './types';

type Art = 'der'|'die'|'das';

function _verb(id: string, lv: Level, v: string, c: Conjugations, prat: string, perf: string, ex: Example[]): CardDef {
  return { id, type: 'verb', level: lv, verb: v, conjugations: c, praeteritum: prat, perfekt: perf, examples: ex };
}

function _noun(id: string, lv: Level, art: Art, n: string, forms: {nom:string;akk:string;dat:string}, pl: string, _enN: string, ex: Example[]): CardDef {
  return { id, type: 'noun', level: lv, article: art, noun: n, nounForms: forms, plural: pl, examples: ex };
}

`;

  let body = '';
  const emitGroup = (title: string, items: Emission[]) => {
    body += `\n// ── ${title} (${items.length}) ─────────────────────────────────\n\n`;
    if (items.length === 0) {
      body += `export const GENERATED_${title.toUpperCase()}: CardDef[] = [];\n`;
      return;
    }
    body += `export const GENERATED_${title.toUpperCase()}: CardDef[] = [\n`;
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
export const CARDS_GENERATED: CardDef[] = [
  ...GENERATED_VERBS,
  ...GENERATED_NOUNS,
  ...GENERATED_ADJECTIVES,
  ...GENERATED_PREPS,
  ...GENERATED_CONJUNCTIONS,
  ...GENERATED_PRONOUNS,
  ...GENERATED_POSSESSIVES,
];
`;

  fs.writeFileSync(OUT_FILE, header + body);

  // Summary
  console.log('\n=== Summary ===');
  for (const t of Object.keys(byType).sort()) {
    console.log(`  ${t.padEnd(12)} ${byType[t].length}`);
  }
  console.log(`  TOTAL        ${emissions.length}`);
  console.log(`\n✅ Wrote ${OUT_FILE}`);
}

function cleanGloss(def: string): string {
  // Strip parentheticals, brackets, leading "senses related to ...", "synonym of ...", italics markers.
  let s = def
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/^\s*senses?\s+related\s+to\s+[^,.;:]+[,.;:]\s*/i, '')
    .replace(/^\s*(synonym|alternative form|alternative spelling) of\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Take first gloss (split on , ; :)
  const head = s.split(/[,;:]/)[0].trim();
  return (head || s).replace(/\.$/, '').trim();
}

// Reject glosses that still smell like Wiktionary scrape pollution after cleanup.
// (Most CSS leaks are caught by stripWiki now; this is a final safety net.)
function isPollutedGloss(g: string): boolean {
  if (!g) return true;
  if (g.length < 2 || g.length > 80) return true;
  if (/[{}|;]/.test(g)) return true;           // CSS / template residue
  if (/mw-parser|mw:|wikt-|deprecat/i.test(g)) return true;
  if (/^(see|cf\.?|compare|usage)\b/i.test(g)) return true;
  if (/\b(of|form|sense|participle|alternative|inflection)\s+of\b/i.test(g)) return true;
  if (/^senses?\s+related/i.test(g)) return true;
  return false;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
