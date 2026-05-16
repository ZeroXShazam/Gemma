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

export type Level = 'A1' | 'A2';
export type CardState = 'new' | 'learning' | 'review' | 'mature';
export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type Gender = 'der' | 'die' | 'das';

export interface Example {
  de: string;
  en: string;
  focus: string;
  subject?: string;   // verb cards: 'ich'|'du'|'er'|'wir'|'ihr'|'sie'
  caseLabel?: string; // noun cards: 'Nom'|'Akk'|'Dat'
}

export interface Conjugations {
  ich: string;
  du: string;
  er: string;
  wir: string;
  ihr: string;
  sie: string;
}

export interface CardDef {
  id: string;
  type: CardType;
  level: Level;
  examples: Example[];
  rule?: string;
  verb?: string;
  conjugations?: Conjugations;
  praeteritum?: string;
  perfekt?: string;
  noun?: string;
  article?: Gender;
  nounForms?: { nom: string; akk: string; dat: string };
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
}

export type SRSCard = CardDef & SRSState;
