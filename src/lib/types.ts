export type CardType =
  | 'verb'
  | 'noun'
  | 'prep'
  | 'wh'
  | 'pronoun'
  | 'possessive'
  | 'adjective'
  | 'modal'
  | 'perfekt'
  | 'negation'
  | 'comparative'
  | 'reflexive'
  | 'conjunction';

export const ALL_TYPES: CardType[] = [
  'verb','noun','prep','wh','pronoun','possessive','adjective',
  'modal','perfekt','negation','comparative','reflexive','conjunction',
];

export type Language = 'de' | 'it';
export const ALL_LANGUAGES: Language[] = ['de', 'it'];
export const LANGUAGE_LABELS: Record<Language, string> = { de: 'German', it: 'Italian' };

export type Level = 'A1' | 'A2';
export type CardState = 'new' | 'learning' | 'review' | 'mature';
export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type Gender = 'der' | 'die' | 'das';

export interface Example {
  de: string;
  en: string;
  focus: string | string[];
  subject?: string;   // verb cards: 'ich'|'du'|'er'|'wir'|'ihr'|'sie'
  caseLabel?: string; // noun cards: 'Nom'|'Akk'|'Dat'
  note?: string;      // optional one-liner shown only on miss
  accept?: string[];  // alternate accepted answers (normalized match)
}

export interface Conjugations {
  ich: string;
  du: string;
  er: string;
  wir: string;
  ihr: string;
  sie: string;
}

export type CardDifficulty = 'easy' | 'standard' | 'hard';
export type CardSource = 'hand' | 'gen';

export interface CardDef {
  id: string;
  language?: Language;
  type: CardType;
  level: Level;
  /** Curriculum section (German deck). Assigned at runtime if omitted. */
  sectionId?: string;
  difficulty?: CardDifficulty;
  source?: CardSource;
  examples: Example[];
  rule?: string;
  verb?: string;
  conjugations?: Conjugations;
  praeteritum?: string;
  perfekt?: string;
  noun?: string;
  article?: Gender;
  nounForms?: { nom: string; akk: string; dat: string };
  plural?: string;
  word?: string;
}

export interface SRSState {
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  due: number;
  state: CardState;
  step: number;
  exampleMisses: Record<string, number>;
  recentResults: string; // oldest-to-newest, '1' = correct, '0' = wrong, max length 5
  /** Last example index shown (for cooldown when picking next). */
  lastExampleIdx?: number;
}

export type SRSCard = CardDef & SRSState;
