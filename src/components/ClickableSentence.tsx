'use client';

import type { GrammarEntry, SentenceSegment } from '@/lib/grammar-index';
import { segmentSentence } from '@/lib/grammar-index';
import type { CardDef, CardType, Language } from '@/lib/types';

const TYPE_LABELS: Record<CardType, string> = {
  verb: 'Verbs',
  noun: 'Nouns',
  prep: 'Prepositions',
  wh: 'Wh-words',
  pronoun: 'Pronouns',
  possessive: 'Possessives',
  adjective: 'Adjectives',
  modal: 'Modals',
  perfekt: 'Perfekt',
  negation: 'Negation',
  comparative: 'Comparative',
  reflexive: 'Reflexive',
  conjunction: 'Conjunctions',
};

interface ClickableSentenceProps {
  text: string;
  focus?: string | string[];
  grammarIndex: Map<string, GrammarEntry[]>;
  cardsById: Map<string, CardDef>;
  language: Language;
  currentCardId?: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  onWordClick: (entry: GrammarEntry | null, anchor: HTMLElement, word: string) => void;
}

function renderSegment(
  seg: SentenceSegment,
  i: number,
  onWordClick: ClickableSentenceProps['onWordClick'],
) {
  if (seg.kind === 'text') {
    return <span key={i}>{seg.text}</span>;
  }

  const className = [
    'grammar-word',
    seg.focus ? 'grammar-word--focus' : '',
    !seg.entry ? 'grammar-word--empty' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      key={i}
      type="button"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        onWordClick(seg.entry, e.currentTarget, seg.text);
      }}
      title={seg.entry ? 'Grammar note' : 'Look up word'}
    >
      {seg.text}
    </button>
  );
}

export function ClickableSentence({
  text,
  focus,
  grammarIndex,
  cardsById,
  language,
  currentCardId,
  fontSize = 22,
  lineHeight = 1.6,
  color = 'var(--text)',
  onWordClick,
}: ClickableSentenceProps) {
  const segments = segmentSentence(text, focus, grammarIndex, cardsById, language, currentCardId);

  return (
    <span style={{ fontSize, lineHeight, color }}>
      {segments.map((seg, i) => renderSegment(seg, i, onWordClick))}
    </span>
  );
}

export { TYPE_LABELS as GRAMMAR_TYPE_LABELS };
