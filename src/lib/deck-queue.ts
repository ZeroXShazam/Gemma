import { cardSection } from './curriculum-de';
import { isMechanicalNounTemplate } from './deck-audit';
import type { CardDef, Example, SRSCard } from './types';

export function exampleFingerprint(card: CardDef, ex: Example): string {
  const de = ex.de.trim();
  if (isMechanicalNounTemplate(de)) {
    if (/ist hier/i.test(de)) return 'noun:nom-hier';
    if (/^Ich sehe /i.test(de)) return 'noun:see-akk';
    if (/^Ich spreche von /i.test(de)) return 'noun:speak-dat';
    return 'noun:template';
  }
  if (/^Du .+\?$/i.test(de) && de.split(/\s+/).length <= 4) return 'verb:du-drill';
  if (/^Er .+\.$/i.test(de) && de.split(/\s+/).length <= 4) return 'verb:er-drill';
  if (/^Ich .+\.$/i.test(de) && de.split(/\s+/).length <= 4) return 'verb:ich-drill';
  return `${card.type}:sentence`;
}

export function cardQueueFingerprint(card: CardDef): string {
  const section = cardSection(card);
  const templates = new Set(card.examples.map((ex) => exampleFingerprint(card, ex)));
  if (templates.has('noun:nom-hier') || templates.has('noun:see-akk') || templates.has('noun:speak-dat')) {
    return `${section}:noun-template`;
  }
  if (templates.has('verb:du-drill') || templates.has('verb:er-drill') || templates.has('verb:ich-drill')) {
    return `${section}:verb-drill`;
  }
  return `${section}:${card.type}`;
}

/** Reduce back-to-back cards with the same fingerprint or section run. */
export function mixQueue(queue: SRSCard[]): SRSCard[] {
  if (queue.length < 3) return queue;
  const arr = [...queue];
  const fp = (c: SRSCard) => cardQueueFingerprint(c);
  const sec = (c: SRSCard) => cardSection(c);

  for (let pass = 0; pass < arr.length * 2; pass++) {
    let moved = false;
    for (let i = 1; i < arr.length; i++) {
      const sameFp = fp(arr[i]) === fp(arr[i - 1]);
      const threeSameSection =
        i >= 2 && sec(arr[i]) === sec(arr[i - 1]) && sec(arr[i]) === sec(arr[i - 2]);
      if (!sameFp && !threeSameSection) continue;

      for (let j = i + 1; j < Math.min(arr.length, i + 8); j++) {
        if (fp(arr[j]) === fp(arr[i - 1]) && sec(arr[j]) === sec(arr[i - 1])) continue;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        moved = true;
        break;
      }
    }
    if (!moved) break;
  }
  return arr;
}

/** Prefer hand/grammar cards when filling the daily new budget. */
export function sortNewCardsForBudget(cards: SRSCard[], preferGrammar: boolean): SRSCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (!preferGrammar) return shuffled;

  return shuffled.sort((a, b) => {
    const aHand = a.source === 'hand' || a.type !== 'noun' && a.type !== 'verb' ? 0 : 1;
    const bHand = b.source === 'hand' || b.type !== 'noun' && b.type !== 'verb' ? 0 : 1;
    if (aHand !== bHand) return aHand - bHand;
    return 0;
  });
}
