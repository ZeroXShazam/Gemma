import type { CardState, Example, SRSCard } from './types';

export interface TrainerDifficultySettings {
  nounHardMode: boolean;
  hideHintsAfterNew: boolean;
  reverseRateMature: number;
  prepProduction: boolean;
}

export const DEFAULT_TRAINER_DIFFICULTY: TrainerDifficultySettings = {
  nounHardMode: false,
  hideHintsAfterNew: true,
  reverseRateMature: 0.55,
  prepProduction: true,
};

const REVIEW_REVERSE_RATE = 0.33;

export function acceptableFocuses(focus: string | string[]): string[] {
  return Array.isArray(focus) ? focus : [focus];
}

export function canonicalFocus(focus: string | string[]): string {
  return Array.isArray(focus) ? focus[0] : focus;
}

export function expandNounFocus(ex: Example, noun: string): Example {
  const c = canonicalFocus(ex.focus);
  const expected = `${c} ${noun}`;
  if (!ex.de.includes(expected)) return ex;
  const expanded = acceptableFocuses(ex.focus).map((f) => `${f} ${noun}`);
  return { ...ex, focus: expanded.length === 1 ? expanded[0] : expanded };
}

export function applyNounStudyMode(ex: Example, noun: string | undefined, hardMode: boolean): Example {
  if (!hardMode || !noun) return ex;
  return expandNounFocus(ex, noun);
}

export function pickReverse(card: SRSCard | undefined, s: TrainerDifficultySettings): boolean {
  if (!card) return false;
  if (card.state !== 'review' && card.state !== 'mature') return false;
  if (card.type === 'prep' && !s.prepProduction) return false;
  if (card.state === 'review') return Math.random() < REVIEW_REVERSE_RATE;
  return Math.random() < s.reverseRateMature;
}

export function pickExampleIdx(card: SRSCard): number {
  const len = card.examples.length;
  if (len <= 1) return 0;
  const misses = card.exampleMisses ?? {};
  const last = card.lastExampleIdx;
  const weights = card.examples.map((_, i) => {
    let w = (misses[String(i)] ?? 0) + 1;
    if (last !== undefined && last >= 0 && i === last % len) w = 0;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return Math.floor(Math.random() * len);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return len - 1;
}

export function resolveLemmaHint(
  card: SRSCard | undefined,
  reverse: boolean,
  hideAfterNew: boolean,
): string | null {
  if (!card) return null;
  if (hideAfterNew && card.state !== 'new') return null;
  if (reverse) return card.verb ?? card.noun ?? card.word ?? null;
  if (card.type === 'noun' || card.type === 'prep') return null;
  return card.verb ?? card.word ?? null;
}

export function showPrepChoices(
  card: SRSCard | undefined,
  prepProduction: boolean,
  state: CardState,
): boolean {
  if (!card || card.type !== 'prep') return false;
  if (!prepProduction) return true;
  return state === 'new';
}
