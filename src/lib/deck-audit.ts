import type { CardDef, Example } from './types';

export function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function isMechanicalNounTemplate(de: string): boolean {
  return (
    /ist hier\.?$/i.test(de.trim()) ||
    /^Ich sehe (den|die|das|dem|der) /i.test(de) ||
    /^Ich spreche von (dem|der|den|die|das) /i.test(de)
  );
}

export function isBareVerbConjugation(ex: Example): boolean {
  const de = ex.de.trim();
  if (!/^(Ich|Du|Er|Sie|Wir|Ihr) .+[.?]$/.test(de)) return false;
  return countWords(de) <= 4;
}

export function isRealSentence(ex: Example, minWords = 5): boolean {
  return countWords(ex.de) >= minWords && countWords(ex.en) >= minWords;
}

export interface DeckAuditReport {
  totalCards: number;
  totalExamples: number;
  mechanicalNounPct: number;
  bareVerbPct: number;
  fivePlusWordsPct: number;
  cardsWithZeroReal: number;
  byType: Record<string, { cards: number; examples: number; mechanical: number }>;
}

export function auditDeck(cards: CardDef[]): DeckAuditReport {
  let totalExamples = 0;
  let mechanicalNoun = 0;
  let bareVerb = 0;
  let fivePlus = 0;
  let cardsWithZeroReal = 0;
  const byType: DeckAuditReport['byType'] = {};

  for (const card of cards) {
    let realCount = 0;
    const bucket = byType[card.type] ?? { cards: 0, examples: 0, mechanical: 0 };
    bucket.cards++;

    for (const ex of card.examples) {
      totalExamples++;
      bucket.examples++;
      if (isMechanicalNounTemplate(ex.de)) {
        mechanicalNoun++;
        bucket.mechanical++;
      }
      if (card.type === 'verb' && isBareVerbConjugation(ex)) bareVerb++;
      if (isRealSentence(ex)) {
        fivePlus++;
        realCount++;
      }
    }

    if (realCount === 0) cardsWithZeroReal++;
    byType[card.type] = bucket;
  }

  const pct = (n: number) => (totalExamples === 0 ? 0 : Math.round((n / totalExamples) * 1000) / 10);

  return {
    totalCards: cards.length,
    totalExamples,
    mechanicalNounPct: pct(mechanicalNoun),
    bareVerbPct: pct(bareVerb),
    fivePlusWordsPct: pct(fivePlus),
    cardsWithZeroReal,
    byType,
  };
}

export function formatAuditReport(report: DeckAuditReport): string {
  const lines = [
    `Cards: ${report.totalCards}`,
    `Examples: ${report.totalExamples}`,
    `Mechanical noun templates: ${report.mechanicalNounPct}%`,
    `Bare verb conjugation drills: ${report.bareVerbPct}%`,
    `Sentences with ≥5 words (DE+EN): ${report.fivePlusWordsPct}%`,
    `Cards with zero real sentences: ${report.cardsWithZeroReal}`,
    '',
    'By type:',
  ];
  for (const [type, stats] of Object.entries(report.byType).sort((a, b) => b[1].cards - a[1].cards)) {
    const mechPct =
      stats.examples === 0 ? 0 : Math.round((stats.mechanical / stats.examples) * 1000) / 10;
    lines.push(`  ${type.padEnd(14)} ${String(stats.cards).padStart(4)} cards  ${String(stats.examples).padStart(5)} ex  ${mechPct}% mechanical`);
  }
  return lines.join('\n');
}
