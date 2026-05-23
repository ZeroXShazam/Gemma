'use client';

import {
  ALL_SECTION_IDS,
  CURRICULUM_DE,
  computeSectionStats,
  type SectionId,
} from '@/lib/curriculum-de';
import type { CardDef, SRSState } from '@/lib/types';

interface CurriculumSidebarProps {
  cards: CardDef[];
  pm: Record<string, SRSState>;
  enabledSections: SectionId[];
  onChange: (sections: SectionId[]) => void;
  onClose?: () => void;
}

function SectionRow({
  order,
  title,
  checked,
  mastered,
  total,
  onToggle,
}: {
  order: number;
  title: string;
  checked: boolean;
  mastered: number;
  total: number;
  onToggle: (v: boolean) => void;
}) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const label = total > 0 ? `${mastered}/${total}` : '—';

  return (
    <label
      style={{
        display: 'block',
        padding: '8px 10px',
        borderRadius: 8,
        cursor: 'pointer',
        opacity: checked ? 1 : 0.5,
      }}
      className="curriculum-row"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
          aria-label={`Include ${title}`}
          style={{ width: 16, height: 16, flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: 'var(--dim)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {order} ·
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)', flex: 1, lineHeight: 1.3 }}>
          {title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {label}
        </span>
      </div>
      <div
        style={{ height: 3, background: 'var(--elev)', borderRadius: 2, marginLeft: 24 }}
        role="progressbar"
        aria-valuenow={mastered}
        aria-valuemin={0}
        aria-valuemax={total || 1}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: '#3b82f6',
            borderRadius: 2,
            opacity: checked ? 1 : 0.4,
            transition: 'width 0.25s ease',
          }}
        />
      </div>
    </label>
  );
}

export function CurriculumSidebar({ cards, pm, enabledSections, onChange, onClose }: CurriculumSidebarProps) {
  const enabled = new Set(enabledSections);

  function toggleSection(id: SectionId, on: boolean) {
    if (on) {
      if (!enabled.has(id)) onChange([...enabledSections, id]);
    } else {
      onChange(enabledSections.filter((s) => s !== id));
    }
  }

  let lastLevel: string | null = null;

  return (
    <aside className="curriculum-sidebar">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 12px 8px',
          borderBottom: '1px solid var(--border-soft)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Curriculum
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="tap-sm"
            onClick={() => onChange([...ALL_SECTION_IDS])}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: 12,
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            All
          </button>
          <button
            type="button"
            className="tap-sm"
            onClick={() => onChange([])}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: 12,
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            None
          </button>
          {onClose && (
            <button
              type="button"
              className="tap-sm"
              onClick={onClose}
              aria-label="Close sections"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: 18,
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="curriculum-scroll">
        {CURRICULUM_DE.map((sec) => {
          const showHeader = sec.level !== lastLevel;
          lastLevel = sec.level;
          const stats = computeSectionStats(sec.id, cards, pm);
          return (
            <div key={sec.id}>
              {showHeader && (
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--dim)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    padding: '12px 12px 4px',
                  }}
                >
                  {sec.level}
                </div>
              )}
              <SectionRow
                order={sec.order}
                title={sec.title}
                checked={enabled.has(sec.id)}
                mastered={stats.mastered}
                total={stats.total}
                onToggle={(on) => toggleSection(sec.id, on)}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
}
