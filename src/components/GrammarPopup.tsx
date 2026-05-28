'use client';

import { useEffect, useRef, useState } from 'react';
import type { GrammarEntry } from '@/lib/grammar-index';
import type { Example } from '@/lib/types';
import { GRAMMAR_TYPE_LABELS } from '@/components/ClickableSentence';

interface GrammarPopupProps {
  word: string;
  entry: GrammarEntry | null;
  anchor: HTMLElement | null;
  onClose: () => void;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

function ExampleBlock({ ex, highlight }: { ex: Example; highlight?: boolean }) {
  return (
    <div className={`grammar-example${highlight ? ' grammar-example--current' : ''}`}>
      <div className="grammar-example-de">{ex.de}</div>
      <div className="grammar-example-en">{ex.en}</div>
      {ex.caseLabel && <div className="grammar-example-meta">{ex.caseLabel}</div>}
    </div>
  );
}

export function GrammarPopup({ word, entry, anchor, onClose }: GrammarPopupProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const examples = entry?.examples?.length
    ? entry.examples
    : entry?.example
      ? [entry.example]
      : [];

  useEffect(() => {
    if (isMobile || !anchor || !popoverRef.current) {
      setPos(null);
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const pop = popoverRef.current;
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    const pad = 8;
    let left = rect.left + rect.width / 2 - pw / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - pw - pad));
    let top = rect.bottom + pad;
    if (top + ph > window.innerHeight - pad) {
      top = rect.top - ph - pad;
    }
    setPos({ top, left });
  }, [anchor, isMobile, entry]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="grammar-popup-scrim" onClick={onClose} aria-hidden />
      <div
        ref={popoverRef}
        className={`grammar-popup${isMobile ? ' grammar-popup--sheet' : ''}`}
        style={!isMobile && pos ? { top: pos.top, left: pos.left } : undefined}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Grammar friend"
      >
        <div className="grammar-popup-header">
          <div>
            <div className="grammar-popup-kicker">Grammar friend</div>
            <span className="grammar-popup-title">
              {entry
                ? `${GRAMMAR_TYPE_LABELS[entry.type]} · ${entry.level}`
                : 'Word lookup'}
            </span>
          </div>
          <button type="button" className="grammar-popup-close tap-sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {entry ? (
          <div className="grammar-popup-body">
            <div className="grammar-headline">{entry.headline ?? word}</div>

            <div className="grammar-section">
              <div className="grammar-section-label">What it means</div>
              <div
                className="grammar-rule"
                dangerouslySetInnerHTML={{ __html: entry.rule }}
              />
              {entry.detail && (
                <div
                  className="grammar-detail"
                  dangerouslySetInnerHTML={{ __html: entry.detail }}
                />
              )}
            </div>

            {entry.tip && (
              <div className="grammar-tip">
                <span className="grammar-tip-label">Tip</span>
                <div dangerouslySetInnerHTML={{ __html: entry.tip }} />
              </div>
            )}

            {examples.length > 0 && (
              <div className="grammar-section">
                <div className="grammar-section-label">
                  {examples.length === 1 ? 'Example' : 'Examples'}
                </div>
                {examples.map((ex, i) => (
                  <ExampleBlock key={i} ex={ex} highlight={i === 0} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="grammar-empty">
            No deck note for <strong>{word}</strong> yet.
          </p>
        )}
      </div>
    </>
  );
}
