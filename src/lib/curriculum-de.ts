import type { CardDef, SRSState } from './types';

export const CURRICULUM_DE = [
  { id: 'a1-basics', level: 'A1' as const, order: 1, title: 'Basics' },
  { id: 'a1-present', level: 'A1' as const, order: 2, title: 'Present tense' },
  { id: 'a1-questions', level: 'A1' as const, order: 3, title: 'Questions' },
  { id: 'a1-nouns', level: 'A1' as const, order: 4, title: 'Nouns & articles' },
  { id: 'a1-accusative', level: 'A1' as const, order: 5, title: 'Accusative' },
  { id: 'a1-modals', level: 'A1' as const, order: 6, title: 'Modal verbs' },
  { id: 'a1-negation', level: 'A1' as const, order: 7, title: 'Negation' },
  { id: 'a1-possessives', level: 'A1' as const, order: 8, title: 'Possessives' },
  { id: 'a1-dative', level: 'A1' as const, order: 9, title: 'Dative' },
  { id: 'a1-prepositions', level: 'A1' as const, order: 10, title: 'Prepositions' },
  { id: 'a1-separable', level: 'A1' as const, order: 11, title: 'Separable verbs' },
  { id: 'a1-food-shopping', level: 'A1' as const, order: 12, title: 'Food & shopping' },
  { id: 'a1-home-daily', level: 'A1' as const, order: 13, title: 'Home & daily life' },
  { id: 'a2-perfekt', level: 'A2' as const, order: 14, title: 'Perfekt' },
  { id: 'a2-praeteritum', level: 'A2' as const, order: 15, title: 'Präteritum' },
  { id: 'a2-reflexive', level: 'A2' as const, order: 16, title: 'Reflexive verbs' },
  { id: 'a2-wechselpraep', level: 'A2' as const, order: 17, title: 'Two-way prepositions' },
  { id: 'a2-clauses', level: 'A2' as const, order: 18, title: 'Subordinate clauses' },
  { id: 'a2-comparative', level: 'A2' as const, order: 19, title: 'Comparatives' },
  { id: 'a2-pronouns', level: 'A2' as const, order: 20, title: 'Pronouns (all cases)' },
  { id: 'a2-adj-endings', level: 'A2' as const, order: 21, title: 'Adjective endings' },
  { id: 'a2-future', level: 'A2' as const, order: 22, title: 'Future' },
  { id: 'a2-imperative', level: 'A2' as const, order: 23, title: 'Imperative' },
  { id: 'a2-travel', level: 'A2' as const, order: 24, title: 'Travel & transport' },
  { id: 'a2-health-work', level: 'A2' as const, order: 25, title: 'Health, work & services' },
] as const;

export type SectionId = (typeof CURRICULUM_DE)[number]['id'];

export const ALL_SECTION_IDS: SectionId[] = CURRICULUM_DE.map((s) => s.id);

const SECTION_BY_ID = Object.fromEntries(CURRICULUM_DE.map((s) => [s.id, s])) as Record<
  SectionId,
  (typeof CURRICULUM_DE)[number]
>;

export function sectionTitle(id: SectionId): string {
  return SECTION_BY_ID[id]?.title ?? id;
}

export function sectionLevel(id: SectionId): 'A1' | 'A2' {
  return SECTION_BY_ID[id]?.level ?? 'A1';
}

// ─── Hand-curated card → section ─────────────────────────────────────────────

const HAND_SECTION: Record<string, SectionId> = {
  'verb-sein': 'a1-basics',
  'verb-haben': 'a1-basics',
  'noun-zeit': 'a1-basics',
  'noun-tag': 'a1-basics',
  'noun-apfel': 'a1-food-shopping',
  'noun-brot': 'a1-food-shopping',
  'noun-kaffee': 'a1-food-shopping',
  'noun-wein': 'a1-food-shopping',
  'noun-wasser': 'a1-food-shopping',
  'noun-auto': 'a2-travel',
  'noun-zug': 'a2-travel',
  'noun-bus': 'a2-travel',
  'noun-arbeit': 'a2-health-work',
  'prep-in-dat': 'a2-wechselpraep',
  'prep-auf-dat': 'a2-wechselpraep',
  'prep-an-dat': 'a2-wechselpraep',
  'prep-in-akk': 'a2-wechselpraep',
  'prep-an-akk': 'a2-wechselpraep',
  'prep-auf-akk': 'a2-wechselpraep',
  'pron-mich': 'a1-accusative',
  'pron-dich': 'a1-accusative',
  'pron-ihn': 'a1-accusative',
  'pron-sie-akk': 'a1-accusative',
  'pron-mir': 'a1-dative',
  'pron-dir': 'a1-dative',
  'pron-ihm': 'a1-dative',
  'pron-ihr-dat': 'a1-dative',
  'pron-uns': 'a1-dative',
  'pron-euch': 'a1-dative',
  'pron-ihnen': 'a2-pronouns',
};

const SEPARABLE_PREFIXES = [
  'ab', 'an', 'auf', 'aus', 'bei', 'ein', 'mit', 'nach', 'vor', 'weg', 'zu',
  'zurück', 'zuruck', 'durch', 'über', 'uber', 'unter', 'um', 'wieder', 'fort',
  'hoch', 'her', 'hin', 'raus', 'rein', 'runter', 'dazu', 'darauf', 'davon',
  'daran', 'herein', 'hinaus', 'weiter', 'zusammen',
];

const WECHSEL_PREPS = new Set([
  'in', 'an', 'auf', 'über', 'uber', 'unter', 'vor', 'hinter', 'neben', 'zwischen',
]);

const FOOD_LEMMAS = new Set([
  'apfel', 'brot', 'kaffee', 'tee', 'milch', 'wasser', 'wein', 'bier', 'kuchen',
  'fleisch', 'fisch', 'ei', 'eier', 'käse', 'kase', 'salat', 'suppe', 'restaurant',
  'supermarkt', 'markt', 'karte', 'rechnung', 'bestellen', 'kochen', 'backen',
  'frühstück', 'fruhstuck', 'mittagessen', 'abendessen', 'hunger', 'durst', 'obst',
  'gemüse', 'gemuse', 'kartoffel', 'tomate', 'banane', 'zucker', 'salz', 'öl', 'ol',
]);

const TRAVEL_LEMMAS = new Set([
  'auto', 'zug', 'bus', 'bahn', 'ticket', 'fahrkarte', 'reise', 'urlaub', 'hotel',
  'flughafen', 'flug', 'flugzeug', 'bahnhof', 'station', 'fahren', 'fliegen',
  'ankommen', 'abfahren', 'koffer', 'pass', 'grenze', 'stadtplan', 'links', 'rechts',
  'geradeaus', 'bahn', 'fahrplan', 'gleis', 'taxi', 'fahrrad', 'schiff', 'hafen',
  'land', 'karte', 'reisen', 'besichtigen', 'besuchen', 'weg', 'straße', 'strasse',
]);

const HEALTH_WORK_LEMMAS = new Set([
  'arzt', 'ärztin', 'arztin', 'krank', 'krankenhaus', 'apotheke', 'medizin', 'tablette',
  'schmerzen', 'kopf', 'fieber', 'termin', 'job', 'beruf', 'firma', 'büro', 'buero',
  'kollege', 'kollegin', 'chef', 'gehalt', 'bewerbung', 'prüfung', 'prufung', 'schule',
  'universität', 'universitat', 'student', 'lehrer', 'lehrerin', 'arbeit', 'arbeiten',
  'krankheit', 'gesund', 'sport', 'training',
]);

function lemma(card: CardDef): string {
  return (card.verb || card.noun || card.word || '').toLowerCase();
}

function isSeparableVerb(v: string): boolean {
  const l = v.toLowerCase();
  return SEPARABLE_PREFIXES.some((p) => l.startsWith(p) && l.length > p.length + 2);
}

function hasLemma(set: Set<string>, l: string): boolean {
  if (set.has(l)) return true;
  return [...set].some((k) => l.includes(k) || k.includes(l));
}

function topicSection(l: string, level: 'A1' | 'A2'): SectionId {
  if (hasLemma(TRAVEL_LEMMAS, l)) return 'a2-travel';
  if (hasLemma(HEALTH_WORK_LEMMAS, l)) return 'a2-health-work';
  if (hasLemma(FOOD_LEMMAS, l)) return 'a1-food-shopping';
  if (level === 'A2') return 'a2-health-work';
  return 'a1-home-daily';
}

export function cardSection(card: CardDef): SectionId {
  if (card.sectionId) return card.sectionId as SectionId;

  const hand = HAND_SECTION[card.id];
  if (hand) return hand;

  const id = card.id;
  if (id.startsWith('prat-')) return 'a2-praeteritum';
  if (id.startsWith('fut-')) return 'a2-future';
  if (id.startsWith('imp-')) return 'a2-imperative';
  if (id.startsWith('acc-')) return 'a1-accusative';
  if (id.startsWith('perf-')) return 'a2-perfekt';
  if (id.startsWith('refl-')) return 'a2-reflexive';
  if (id.startsWith('neg-')) return 'a1-negation';
  if (id.startsWith('conj-')) return 'a2-clauses';
  if (id.startsWith('dat-')) return 'a1-dative';
  if (id.startsWith('pack-travel-')) return 'a2-travel';
  if (id.startsWith('pack-doctor-')) return 'a2-health-work';
  if (id.startsWith('pack-work-')) return 'a2-health-work';
  if (id.startsWith('adj-')) return 'a2-adj-endings';
  if (id.startsWith('wh-')) return 'a1-questions';
  if (id.startsWith('poss-')) return 'a1-possessives';
  if (id.startsWith('comp-')) return 'a2-comparative';

  const l = lemma(card);

  switch (card.type) {
    case 'wh':
      return 'a1-questions';
    case 'modal':
      return 'a1-modals';
    case 'negation':
      return 'a1-negation';
    case 'possessive':
      return 'a1-possessives';
    case 'perfekt':
      return 'a2-perfekt';
    case 'comparative':
      return 'a2-comparative';
    case 'reflexive':
      return 'a2-reflexive';
    case 'conjunction':
      return 'a2-clauses';
    case 'prep':
      if (card.id.includes('-akk') || card.id.includes('-dat')) {
        return 'a2-wechselpraep';
      }
      if (WECHSEL_PREPS.has(l)) return 'a2-wechselpraep';
      return 'a1-prepositions';
    case 'pronoun':
      return 'a2-pronouns';
    case 'adjective':
      if (card.id.startsWith('adj-')) return 'a2-adj-endings';
      return topicSection(l, card.level);
    case 'noun':
      if (card.id.startsWith('noun-')) return 'a1-nouns';
      return topicSection(l, card.level);
    case 'verb':
      if (card.id.startsWith('verb-')) return 'a1-present';
      if (isSeparableVerb(l)) return 'a1-separable';
      return topicSection(l, card.level);
    default:
      return card.level === 'A2' ? 'a2-health-work' : 'a1-home-daily';
  }
}

// ─── Progress ────────────────────────────────────────────────────────────────

export interface SectionStats {
  total: number;
  mastered: number;
  due: number;
  new: number;
}

export function isMastered(srs: SRSState): boolean {
  return srs.state === 'mature' || (srs.state === 'review' && srs.interval >= 7);
}

export function computeSectionStats(
  sectionId: SectionId,
  cards: CardDef[],
  pm: Record<string, SRSState>,
  now = Date.now(),
): SectionStats {
  let total = 0;
  let mastered = 0;
  let due = 0;
  let newCount = 0;
  for (const card of cards) {
    if (cardSection(card) !== sectionId) continue;
    total++;
    const srs = pm[card.id];
    if (!srs || srs.state === 'new') {
      newCount++;
      continue;
    }
    if (isMastered(srs)) mastered++;
    else if (
      (srs.state === 'learning' || srs.state === 'review' || srs.state === 'mature') &&
      srs.due <= now
    ) {
      due++;
    }
  }
  return { total, mastered, due, new: newCount };
}

export function emptySectionStats(): SectionStats {
  return { total: 0, mastered: 0, due: 0, new: 0 };
}
