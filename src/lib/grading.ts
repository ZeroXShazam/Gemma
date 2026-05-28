import type { CardDef, Example } from './types';
import { acceptableFocuses, canonicalFocus } from './trainer-pick';

export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export interface GradeResult {
  ok: boolean;
  nearMiss?: string;
}

export function gradeAnswer(input: string, ex: Example, card: CardDef | undefined): GradeResult {
  const n = normalizeAnswer(input);
  if (!n) return { ok: false };

  const focuses = acceptableFocuses(ex.focus);
  if (focuses.some((f) => normalizeAnswer(f) === n)) return { ok: true };

  if (ex.accept?.some((a) => normalizeAnswer(a) === n)) return { ok: true };

  // Multi-token focus (separable verbs): accept if user typed all tokens in order with gaps.
  if (focuses.some((f) => normalizeAnswer(f).includes(' '))) {
    const joined = focuses.map((f) => normalizeAnswer(f)).find((f) => f.includes(' '));
    if (joined) {
      const tokens = joined.split(/\s+/);
      if (tokens.every((t) => n.includes(t))) return { ok: true };
    }
  }

  if (card?.type === 'noun' && card.noun) {
    const nounNorm = normalizeAnswer(card.noun);
    const userTokens = n.split(/\s+/).filter(Boolean);

    for (const f of focuses) {
      const fNorm = normalizeAnswer(f);
      const fTokens = fNorm.split(/\s+/).filter(Boolean);
      const expectsArticle = fTokens.length >= 2;

      if (expectsArticle && userTokens.length >= 2 && userTokens[userTokens.length - 1] === nounNorm) {
        if (fNorm !== n) {
          return {
            ok: false,
            nearMiss: `Right noun, wrong article — the answer was "${canonicalFocus(ex.focus)}". Consider Hard.`,
          };
        }
      }

      if (expectsArticle && userTokens.length === 1 && userTokens[0] === nounNorm) {
        return {
          ok: false,
          nearMiss: `Missing article — the answer was "${canonicalFocus(ex.focus)}".`,
        };
      }
    }
  }

  return { ok: false };
}
