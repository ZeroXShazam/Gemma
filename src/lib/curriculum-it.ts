import type { CardDef, SRSState } from './types';

export const CURRICULUM_IT = [
  { id: 'it-a1-basics', level: 'A1' as const, order: 1, title: 'Basics' },
  { id: 'it-a1-present', level: 'A1' as const, order: 2, title: 'Present tense' },
  { id: 'it-a1-questions', level: 'A1' as const, order: 3, title: 'Questions' },
  { id: 'it-a1-nouns', level: 'A1' as const, order: 4, title: 'Nouns & articles' },
  { id: 'it-a1-objects', level: 'A1' as const, order: 5, title: 'Direct objects' },
  { id: 'it-a1-modals', level: 'A1' as const, order: 6, title: 'Modal verbs' },
  { id: 'it-a1-negation', level: 'A1' as const, order: 7, title: 'Negation' },
  { id: 'it-a1-possessives', level: 'A1' as const, order: 8, title: 'Possessives' },
  { id: 'it-a1-indirect', level: 'A1' as const, order: 9, title: 'Indirect objects' },
  { id: 'it-a1-prepositions', level: 'A1' as const, order: 10, title: 'Prepositions' },
  { id: 'it-a1-food-shopping', level: 'A1' as const, order: 11, title: 'Food & shopping' },
  { id: 'it-a1-home-daily', level: 'A1' as const, order: 12, title: 'Home & daily life' },
  { id: 'it-a2-passato', level: 'A2' as const, order: 13, title: 'Passato prossimo' },
  { id: 'it-a2-imperfetto', level: 'A2' as const, order: 14, title: 'Imperfetto' },
  { id: 'it-a2-reflexive', level: 'A2' as const, order: 15, title: 'Reflexive verbs' },
  { id: 'it-a2-articulated', level: 'A2' as const, order: 16, title: 'Articulated prepositions' },
  { id: 'it-a2-clauses', level: 'A2' as const, order: 17, title: 'Subordinate clauses' },
  { id: 'it-a2-comparative', level: 'A2' as const, order: 18, title: 'Comparatives' },
  { id: 'it-a2-pronouns', level: 'A2' as const, order: 19, title: 'Combined pronouns' },
  { id: 'it-a2-agreement', level: 'A2' as const, order: 20, title: 'Adjective agreement' },
  { id: 'it-a2-future', level: 'A2' as const, order: 21, title: 'Future' },
  { id: 'it-a2-imperative', level: 'A2' as const, order: 22, title: 'Imperative' },
  { id: 'it-a2-travel', level: 'A2' as const, order: 23, title: 'Travel & transport' },
  { id: 'it-a2-health-work', level: 'A2' as const, order: 24, title: 'Health, work & services' },
] as const;

export type SectionIdIt = (typeof CURRICULUM_IT)[number]['id'];

export const ALL_SECTION_IDS_IT: SectionIdIt[] = CURRICULUM_IT.map((s) => s.id);

const SECTION_BY_ID = Object.fromEntries(CURRICULUM_IT.map((s) => [s.id, s])) as Record<
  SectionIdIt,
  (typeof CURRICULUM_IT)[number]
>;

export function sectionTitleIt(id: SectionIdIt): string {
  return SECTION_BY_ID[id]?.title ?? id;
}

const HAND_SECTION: Record<string, SectionIdIt> = {
  'it-noun-tempo': 'it-a1-basics',
  'it-noun-giorno': 'it-a1-basics',
  'it-noun-mela': 'it-a1-food-shopping',
  'it-noun-pane': 'it-a1-food-shopping',
  'it-noun-caffe': 'it-a1-food-shopping',
  'it-noun-acqua': 'it-a1-food-shopping',
  'it-noun-vino': 'it-a1-food-shopping',
  'it-noun-auto': 'it-a2-travel',
  'it-noun-treno': 'it-a2-travel',
  'it-noun-autobus': 'it-a2-travel',
  'it-noun-lavoro': 'it-a2-health-work',
};

const FOOD = new Set([
  'mela', 'pane', 'caffè', 'caffe', 'latte', 'acqua', 'vino', 'birra', 'torta', 'carne',
  'pesce', 'uovo', 'formaggio', 'insalata', 'zuppa', 'ristorante', 'supermercato', 'mercato',
  'menu', 'conto', 'ordinare', 'cucinare', 'colazione', 'pranzo', 'cena', 'fame', 'sete',
]);
const TRAVEL = new Set([
  'auto', 'treno', 'autobus', 'biglietto', 'viaggio', 'vacanza', 'hotel', 'aeroporto', 'volo',
  'stazione', 'andare', 'volare', 'arrivare', 'partire', 'valigia', 'passaporto', 'città', 'citta',
  'taxi', 'bicicletta', 'nave', 'porto', 'strada', 'visitare', 'mappa',
]);
const HEALTH_WORK = new Set([
  'medico', 'dottore', 'malato', 'ospedale', 'farmacia', 'medicina', 'pillola', 'dolore',
  'testa', 'febbre', 'appuntamento', 'lavoro', 'ufficio', 'collega', 'capo', 'stipendio',
  'scuola', 'università', 'universita', 'student', 'insegnante', 'malattia', 'salute', 'sport',
]);

function lemma(card: CardDef): string {
  return (card.verb || card.noun || card.word || '').toLowerCase();
}

function hasLemma(set: Set<string>, l: string): boolean {
  if (set.has(l)) return true;
  return [...set].some((k) => l.includes(k) || k.includes(l));
}

function topicSection(l: string, level: 'A1' | 'A2'): SectionIdIt {
  if (hasLemma(TRAVEL, l)) return 'it-a2-travel';
  if (hasLemma(HEALTH_WORK, l)) return 'it-a2-health-work';
  if (hasLemma(FOOD, l)) return 'it-a1-food-shopping';
  if (level === 'A2') return 'it-a2-health-work';
  return 'it-a1-home-daily';
}

export function cardSectionIt(card: CardDef): SectionIdIt {
  if (card.sectionId) return card.sectionId as SectionIdIt;
  const hand = HAND_SECTION[card.id];
  if (hand) return hand;

  const id = card.id;
  if (id.startsWith('it-pass-')) return 'it-a2-passato';
  if (id.startsWith('it-impf-')) return 'it-a2-imperfetto';
  if (id.startsWith('it-fut-')) return 'it-a2-future';
  if (id.startsWith('it-imp-')) return 'it-a2-imperative';
  if (id.startsWith('it-obj-')) return 'it-a1-objects';
  if (id.startsWith('it-ind-')) return 'it-a1-indirect';
  if (id.startsWith('it-refl-')) return 'it-a2-reflexive';
  if (id.startsWith('it-neg-')) return 'it-a1-negation';
  if (id.startsWith('it-conj-')) return 'it-a2-clauses';
  if (id.startsWith('it-adj-')) return 'it-a2-agreement';
  if (id.startsWith('it-art-')) return 'it-a2-articulated';
  if (id.startsWith('it-wh-')) return 'it-a1-questions';
  if (id.startsWith('it-poss-')) return 'it-a1-possessives';
  if (id.startsWith('it-comp-')) return 'it-a2-comparative';
  if (id.startsWith('it-pack-travel-')) return 'it-a2-travel';
  if (id.startsWith('it-pack-doctor-')) return 'it-a2-health-work';
  if (id.startsWith('it-pack-work-')) return 'it-a2-health-work';

  const l = lemma(card);
  switch (card.type) {
    case 'wh':
      return 'it-a1-questions';
    case 'modal':
      return 'it-a1-modals';
    case 'negation':
      return 'it-a1-negation';
    case 'possessive':
      return 'it-a1-possessives';
    case 'perfekt':
      return 'it-a2-passato';
    case 'comparative':
      return 'it-a2-comparative';
    case 'reflexive':
      return 'it-a2-reflexive';
    case 'conjunction':
      return 'it-a2-clauses';
    case 'prep':
      if (id.includes('-art-')) return 'it-a2-articulated';
      return 'it-a1-prepositions';
    case 'pronoun':
      if (id.includes('ind') || id.includes('mi') || id.includes('gli')) return 'it-a1-indirect';
      return 'it-a1-objects';
    case 'adjective':
      return 'it-a2-agreement';
    case 'noun':
      if (id.startsWith('it-noun-')) return 'it-a1-nouns';
      return topicSection(l, card.level);
    case 'verb':
      if (id.startsWith('it-verb-')) return 'it-a1-present';
      return topicSection(l, card.level);
    default:
      return card.level === 'A2' ? 'it-a2-health-work' : 'it-a1-home-daily';
  }
}

export function computeSectionStatsIt(
  sectionId: SectionIdIt,
  cards: CardDef[],
  pm: Record<string, SRSState>,
  now = Date.now(),
) {
  let total = 0;
  let mastered = 0;
  let due = 0;
  let newCount = 0;
  for (const card of cards) {
    if (cardSectionIt(card) !== sectionId) continue;
    total++;
    const srs = pm[card.id];
    if (!srs || srs.state === 'new') {
      newCount++;
      continue;
    }
    if (srs.state === 'mature' || (srs.state === 'review' && srs.interval >= 7)) mastered++;
    else if (
      (srs.state === 'learning' || srs.state === 'review' || srs.state === 'mature') &&
      srs.due <= now
    ) {
      due++;
    }
  }
  return { total, mastered, due, new: newCount };
}
